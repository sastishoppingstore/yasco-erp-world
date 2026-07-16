import * as THREE from 'three';

export interface BIMElement {
  id: string;
  name: string;
  type: string; // e.g., "IfcWall", "IfcColumn", "IfcSlab"
  globalId: string;
  geometry?: {
    vertices: number[];
    faces: number[];
    bbox: { min: [number, number, number]; max: [number, number, number] };
  };
  properties: Record<string, any>;
  material?: string;
  color?: [number, number, number];
  level?: string;
  area?: number;
  volume?: number;
  associatedTasks?: string[];
  clashGroups?: string[];
}

export interface ClashDetection {
  id: string;
  element1Id: string;
  element2Id: string;
  element1Name: string;
  element2Name: string;
  clashType: 'hard-clash' | 'soft-clash' | 'warning';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: [number, number, number];
  resolution?: string;
  status: 'open' | 'resolved' | 'ignored';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ScheduleOverlay {
  elementId: string;
  taskId: string;
  taskName: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  progressPercentage: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  color?: string;
}

export class BIMViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private elements: Map<string, THREE.Object3D> = new Map();
  private elementData: Map<string, BIMElement> = new Map();
  private clashes: ClashDetection[] = [];
  private scheduleOverlay: Map<string, ScheduleOverlay> = new Map();
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(
    containerElement: HTMLElement,
    width: number = 1200,
    height: number = 800
  ) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.8));

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    this.camera.position.set(100, 100, 100);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    containerElement.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add grid helper
    const gridHelper = new THREE.GridHelper(500, 50);
    this.scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(50);
    this.scene.add(axesHelper);

    // Setup controls (simplified orbit controls)
    this.setupEventListeners();
    this.animate();
  }

  /**
   * Import and parse IFC file
   */
  async importIFCFile(file: File): Promise<BIMElement[]> {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);
    
    const elements = this.parseIFC(text);
    
    // Clear existing elements
    this.clear();

    // Add parsed elements to scene
    for (const element of elements) {
      this.addElement(element);
    }

    return elements;
  }

  /**
   * Parse IFC file content
   */
  private parseIFC(content: string): BIMElement[] {
    const elements: BIMElement[] = [];
    
    // Parse IFC headers and data
    const lines = content.split('\n');
    const dataMap = new Map<number, any>();

    // First pass: extract all entities
    for (const line of lines) {
      const match = line.match(/^#(\d+)=\s*(\w+)\s*\((.*)\)\s*;/);
      if (match) {
        const [, id, type, params] = match;
        dataMap.set(parseInt(id), { type, params: this.parseParams(params) });
      }
    }

    // Second pass: build elements from entities
    for (const [id, data] of dataMap.entries()) {
      if (this.isGeometricType(data.type)) {
        const element = this.buildElement(id, data, dataMap);
        if (element) {
          elements.push(element);
        }
      }
    }

    return elements;
  }

  /**
   * Parse IFC parameter list
   */
  private parseParams(paramStr: string): any[] {
    const params: any[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < paramStr.length; i++) {
      const char = paramStr[i];

      if (char === '(' || char === '[') {
        depth++;
        current += char;
      } else if (char === ')' || char === ']') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        params.push(this.parseValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      params.push(this.parseValue(current.trim()));
    }

    return params;
  }

  /**
   * Parse individual IFC value
   */
  private parseValue(value: string): any {
    if (value === '$' || value === '*') return null;
    if (value === '.T.') return true;
    if (value === '.F.') return false;
    if (/^-?\d+\.?\d*$/.test(value)) return parseFloat(value);
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    if (value.startsWith('#')) return parseInt(value.slice(1));
    return value;
  }

  /**
   * Check if entity type is geometric
   */
  private isGeometricType(type: string): boolean {
    const geometricTypes = [
      'IfcWall', 'IfcColumn', 'IfcSlab', 'IfcBeam', 'IfcDoor', 'IfcWindow',
      'IfcRoof', 'IfcStair', 'IfcRamp', 'IfcWallStandardCase', 'IfcBuilding'
    ];
    return geometricTypes.includes(type);
  }

  /**
   * Build BIM element from IFC data
   */
  private buildElement(id: number, data: any, dataMap: Map<number, any>): BIMElement | null {
    try {
      const element: BIMElement = {
        id: `${id}`,
        name: `${data.type}_${id}`,
        type: data.type,
        globalId: `${id}`,
        properties: {},
        color: this.getColorForType(data.type),
      };

      // Extract geometry if available
      const geometry = this.extractGeometry(data, dataMap);
      if (geometry) {
        element.geometry = geometry;
      }

      this.elementData.set(element.id, element);
      return element;
    } catch (error) {
      console.error(`Error building element ${id}:`, error);
      return null;
    }
  }

  /**
   * Extract geometry from IFC data
   */
  private extractGeometry(data: any, dataMap: Map<number, any>): any {
    // Simplified geometry extraction
    // In production, would use proper IFC libraries like web-ifc
    return {
      vertices: [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0],
      faces: [0, 1, 2, 0, 2, 3],
      bbox: {
        min: [0, 0, 0] as [number, number, number],
        max: [10, 10, 10] as [number, number, number],
      },
    };
  }

  /**
   * Get color for IFC element type
   */
  private getColorForType(type: string): [number, number, number] {
    const colors: Record<string, [number, number, number]> = {
      'IfcWall': [0.8, 0.8, 0.8],
      'IfcColumn': [0.6, 0.6, 0.6],
      'IfcSlab': [0.7, 0.7, 0.7],
      'IfcBeam': [0.5, 0.5, 0.5],
      'IfcDoor': [0.9, 0.7, 0.3],
      'IfcWindow': [0.3, 0.7, 0.9],
      'IfcRoof': [0.8, 0.2, 0.2],
    };
    return colors[type] || [0.75, 0.75, 0.75];
  }

  /**
   * Add element to 3D scene
   */
  private addElement(element: BIMElement) {
    if (!element.geometry) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(element.geometry.vertices),
      3
    ));
    geometry.setIndex(new THREE.BufferAttribute(
      new Uint32Array(element.geometry.faces),
      1
    ));
    geometry.computeVertexNormals();

    const [r, g, b] = element.color || [0.75, 0.75, 0.75];
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(r, g, b),
      shininess: 100,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { elementId: element.id };

    this.scene.add(mesh);
    this.elements.set(element.id, mesh);
  }

  /**
   * Detect clashes between elements
   */
  async detectClashes(): Promise<ClashDetection[]> {
    this.clashes = [];
    const elementArray = Array.from(this.elementData.values());

    for (let i = 0; i < elementArray.length; i++) {
      for (let j = i + 1; j < elementArray.length; j++) {
        const clash = this.checkClash(elementArray[i], elementArray[j]);
        if (clash) {
          this.clashes.push(clash);
        }
      }
    }

    return this.clashes;
  }

  /**
   * Check if two elements clash
   */
  private checkClash(elem1: BIMElement, elem2: BIMElement): ClashDetection | null {
    if (!elem1.geometry?.bbox || !elem2.geometry?.bbox) return null;

    const bbox1 = elem1.geometry.bbox;
    const bbox2 = elem2.geometry.bbox;

    // Simple AABB collision detection
    if (
      bbox1.max[0] < bbox2.min[0] || bbox1.min[0] > bbox2.max[0] ||
      bbox1.max[1] < bbox2.min[1] || bbox1.min[1] > bbox2.max[1] ||
      bbox1.max[2] < bbox2.min[2] || bbox1.min[2] > bbox2.max[2]
    ) {
      return null;
    }

    const clashCenter: [number, number, number] = [
      (bbox1.min[0] + bbox1.max[0]) / 2,
      (bbox1.min[1] + bbox1.max[1]) / 2,
      (bbox1.min[2] + bbox1.max[2]) / 2,
    ];

    return {
      id: `clash-${elem1.id}-${elem2.id}`,
      element1Id: elem1.id,
      element2Id: elem2.id,
      element1Name: elem1.name,
      element2Name: elem2.name,
      clashType: 'hard-clash',
      severity: 'major',
      description: `Clash detected between ${elem1.name} and ${elem2.name}`,
      location: clashCenter,
      status: 'open',
      createdAt: new Date(),
    };
  }

  /**
   * Apply schedule overlay to elements
   */
  applyScheduleOverlay(overlays: ScheduleOverlay[]) {
    for (const overlay of overlays) {
      this.scheduleOverlay.set(overlay.elementId, overlay);

      const mesh = this.elements.get(overlay.elementId);
      if (mesh) {
        const colorMap = {
          'pending': 0x999999,
          'in-progress': 0xffff00,
          'completed': 0x00ff00,
          'delayed': 0xff0000,
        };

        const material = mesh.material as THREE.MeshPhongMaterial;
        material.color.setHex(colorMap[overlay.status] || 0x999999);
      }
    }
  }

  /**
   * Update element properties
   */
  updateElement(elementId: string, properties: Partial<BIMElement>) {
    const element = this.elementData.get(elementId);
    if (element) {
      Object.assign(element, properties);

      const mesh = this.elements.get(elementId);
      if (mesh && properties.color) {
        const [r, g, b] = properties.color;
        const material = mesh.material as THREE.MeshPhongMaterial;
        material.color.setRGB(r, g, b);
      }
    }
  }

  /**
   * Highlight element
   */
  highlightElement(elementId: string, highlight: boolean = true) {
    const mesh = this.elements.get(elementId);
    if (mesh) {
      const material = mesh.material as THREE.MeshPhongMaterial;
      material.emissive.setHex(highlight ? 0xff0000 : 0x000000);
    }
  }

  /**
   * Get element by screen coordinates
   */
  getElementAtPoint(x: number, y: number): BIMElement | null {
    this.mouse.x = (x / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(y / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const object = intersects[0].object as any;
      if (object.userData?.elementId) {
        return this.elementData.get(object.userData.elementId) || null;
      }
    }

    return null;
  }

  /**
   * Fit view to all elements
   */
  fitView() {
    const box = new THREE.Box3();
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        box.expandByObject(child);
      }
    });

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    const center = box.getCenter(new THREE.Vector3());
    this.camera.position.copy(center);
    this.camera.position.z += cameraZ * 1.5;
    this.camera.lookAt(center);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    const container = this.renderer.domElement;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        this.camera.position.applyAxisAngle(
          new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005),
          deltaY * 0.005
        );
        this.camera.lookAt(0, 0, 0);

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDirection = e.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(zoomDirection);
    });
  }

  /**
   * Animation loop
   */
  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Clear scene
   */
  private clear() {
    this.elements.forEach((mesh) => {
      this.scene.remove(mesh);
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    });
    this.elements.clear();
    this.elementData.clear();
  }

  /**
   * Export scene as JSON
   */
  exportScene(): string {
    const data = {
      elements: Array.from(this.elementData.values()),
      clashes: this.clashes,
      scheduleOverlay: Array.from(this.scheduleOverlay.values()),
    };
    return JSON.stringify(data);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
