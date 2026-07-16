import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pill, Prescription, Trash2, Edit, CheckCircle, Calendar, User } from "lucide-react";
import { Badge as AntdBadge } from "antd";
import "./Prescription.css"; // For prescription-specific styles

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  prescription?: boolean;
  batchNumber?: string;
  expiryDate?: string;
  requiresPrescription: boolean;
  insuranceCovered?: boolean;
  copayAmount?: number;
}

interface PrescriptionInfo {
  patientName: string;
  doctorName: string;
  prescriptionNumber: string;
  dateIssued: string;
  validUntil: string;
  medications: Array<{
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }>;
}

export default function PharmacyPOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [patientCopay, setPatientCopay] = useState(0);
  const [activePrescription, setActivePrescription] = useState<PrescriptionInfo | null>(null);

  // Add item to cart
  const addItemToCart = (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    const newItem: CartItem = {
      id: `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quantity: item.quantity ?? 1,
      ...item
    };

    setCart(prev => {
      // Check if same prescription item already exists
      const existingIndex = prev.findIndex(existing => 
        existing.name === newItem.name && 
        existing.prescription === newItem.prescription &&
        (existing.batchNumber === newItem.batchNumber || 
         (!existing.batchNumber && !newItem.batchNumber))
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity
        };
        return updated;
      }

      return [...prev, newItem];
    });

    calculateTotals();
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    calculateTotals();
  };

  // Update quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
    calculateTotals();
  };

  // Calculate totals
  const calculateTotals = () => {
    let newTotal = 0;
    let newInsuranceTotal = 0;
    let newPatientCopay = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      newTotal += itemTotal;
      
      if (item.insuranceCovered && item.copayAmount !== undefined) {
        const coveredAmount = itemTotal - (item.copayAmount * item.quantity);
        newInsuranceTotal += Math.max(0, coveredAmount);
        newPatientCopay += item.copayAmount * item.quantity;
      } else {
        newPatientCopay += itemTotal;
      }
    });

    setTotal(newTotal);
    setInsuranceTotal(Math.max(0, newInsuranceTotal));
    setPatientCopay(newPatientCopay);
  };

  // Load prescription (in real app, this would fetch from EHR/pharmacy system)
  const loadPrescription = (prescriptionNumber: string) => {
    // Simulate fetching prescription data
    const mockPrescription: PrescriptionInfo = {
      patientName: "Ahmed Al-Saud",
      doctorName: "Dr. Fatima Al-Rashid",
      prescriptionNumber: prescriptionNumber,
      dateIssued: "2026-07-01",
      validUntil: "2026-07-15",
      medications: [
        {
          name: "Amoxicillin 500mg",
          dosage: "1 capsule every 8 hours",
          quantity: 21,
          instructions: "Take with food. Complete full course."
        },
        {
          name: "Paracetamol 500mg",
          dosage": "1-2 tablets every 6 hours as needed",
          quantity: 20,
          instructions: "For fever or pain relief"
        }
      ]
    };

    setActivePrescription(mockPrescription);
    
    // Add prescription items to cart
    clearCart();
    mockPrescription.medications.forEach(med => {
      addItemToCart({
        name: med.name,
        price: Math.random() * 50 + 10, // Random price between 10-60 SAR
        prescription: true,
        requiresPrescription: true,
        batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`,
        expiryDate: `2027-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        insuranceCovered: Math.random() > 0.3, // 70% chance insurance covers
        copayAmount: Math.random() > 0.7 ? 5 : 0 // 30% chance of copay
      });
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setTotal(0);
    setInsuranceTotal(0);
    setPatientCopay(0);
  };

  // Process insurance claim
  const processInsuranceClaim = () => {
    if (patientCopay > 0) {
      alert(`Insurance claim submitted!\nCovered by insurance: SAR ${insuranceTotal.toFixed(2)}\nPatient copay: SAR ${patientCopay.toFixed(2)}`);
    } else {
      alert("No insurance coverage needed for this purchase.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <Prescription className="mr-2 h-4 w-4 text-red-600" /> Pharmacy POS
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">Ready</Badge>
          <Button onClick={() => setActivePrescription(null)}>New Prescription</Button>
        </div>
      </div>

      {/* Prescription Input */}
      {(!activePrescription && cart.length === 0) && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Enter Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prescription Number</label>
              <Input
                placeholder="RX-123456"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      loadPrescription(input.value.trim());
                      input.value = "";
                    }
                  }
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="RX-123456"]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    loadPrescription(input.value.trim());
                    input.value = "";
                  }
                }}
              >
                Load Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription Details */}
      {activePrescription && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Prescription Details</h2>
              <Badge variant="destructive" className="ml-4">
                Expires: {new Date(activePrescription.validUntil).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1"><strong>Patient:</strong> {activePrescription.patientName}</p>
                <p><strong>Doctor:</strong> {activePrescription.doctorName}</p>
              </div>
              <div>
                <p className="mb-1"><strong>RX #:</strong> {activePrescription.prescriptionNumber}</p>
                <p><strong>Issued:</strong> {new Date(activePrescription.dateIssued).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t">
              <h3 className="font-medium mb-2">Medications</h3>
              {activePrescription.medications.map((med, index) => (
                <div key={index} className="p-3 bg-muted rounded">
                  <div className="flex justify-between">
                    <div className="font-medium">{med.name}</div>
                    <span className="text-sm text-muted-foreground">{med.quantity} units</span>
                  </div>
                  <p className="text-sm mt-1">{med.dosage}</p>
                  <p className="text-sm mt-1">{med.instructions}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={() => {
                // Add all prescription meds to cart
                activePrescription?.medications.forEach(med => {
                  addItemToCart({
                    name: med.name,
                    price: Math.random() * 50 + 10,
                    prescription: true,
                    requiresPrescription: true,
                    batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`,
                    expiryDate: `2027-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                    insuranceCovered: Math.random() > 0.3,
                    copayAmount: Math.random() > 0.7 ? 5 : 0
                  });
                });
                setActivePrescription(null);
              }}
              className="w-48"
            >
              Add All to Cart
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Quick Add */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Common OTC medications */}
              <div className="space-y-3">
                <button 
                  onClick={() => addItemToCart({
                    name: "Paracetamol 500mg",
                    price: 12.50,
                    requiresPrescription: false,
                    batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`,
                    expiryDate: "2027-12-31",
                    insuranceCovered: false
                  })}
                  className="w-full text-left p-3 border rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">Paracetamol 500mg</div>
                      <div className="text-sm text-muted-foreground">Pack of 20 tablets</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">SAR 12.50</div>
                      <div className="text-sm text-muted-foreground">OTC</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => addItemToCart({
                    name: "Vitamin D3 1000IU",
                    price: 45.00,
                    requiresPrescription: false,
                    batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`,
                    expiryDate: "2028-06-30",
                    insuranceCovered: false
                  })}
                  className="w-full text-left p-3 border rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">Vitamin D3 1000IU</div>
                      <div className="text-sm text-muted-foreground">30 softgels</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">SAR 45.00</div>
                      <div className="text-sm text-muted-foreground">Supplement</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => addItemToCart({
                    name: "Blood Pressure Monitor",
                    price: 180.00,
                    requiresPrescription: false,
                    batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`,
                    expiryDate: "2029-12-31",
                    insuranceCovered: true,
                    copayAmount: 20
                  })}
                  className="w-full text-left p-3 border rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">BP Monitor</div>
                      <div className="text-sm text-muted-foreground">Digital wrist</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">SAR 180.00</div>
                      <div className="text-sm text-muted-foreground">(Insurance: SAR 160)</div>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Cart */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CartTitle>Prescription Items</CartTitle>
                <Badge variant="secondary">{cart.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No items in prescription
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Medication</TableHead>
                        <TableHead className="w-1/6">Price</TableHead>
                        <TableHead className="w-1/6">Qty</TableHead>
                        <TableHead className="w-1/6">Total</TableHead>
                        <TableHead className="w-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted">
                          <TableCell className="font-medium flex items-center gap-2">
                            {item.prescription && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded" title="Prescription Required"></div>
                              </div>
                            )}
                            <span>{item.name}</span>
                            {item.batchNumber && (
                              <div className="ml-2 text-xs text-muted-foreground">
                                Batch: {item.batchNumber.substring(0, 6)}...
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            SAR {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity === 1}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            SAR {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>SAR {total.toFixed(2)}</span>
                      </div>
                      {insuranceTotal > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Insurance Coverage:</span>
                            <span className="text-green-600">SAR {insuranceTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Patient Copay:</span>
                            <span className="text-red-600 font-medium">SAR {patientCopay.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {patientCopay > 0 && (
                <Button 
                  variant="outline" 
                  onClick={processInsuranceClaim}
                >
                  Submit Insurance Claim
                </Button>
              )}
              <Button 
                onClick={() => alert(`Total due: SAR ${patientCopay.toFixed(2)}`)}
                disabled={cart.length === 0}
                className="w-48"
              >
                Collect Payment
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right - Patient Info & Tools */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePrescription ? (
                <>
                  <div className="text-sm">
                    <div className="mb-2">
                      <div className="font-medium">Current Patient:</div>
                      <div>{activePrescription.patientName}</div>
                    </div>
                    <div className="mb-2">
                      <div className="font-medium">Prescription Valid Until:</div>
                      <div>{new Date(activePrescription.validUntil).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <h3 className="font-medium mb-2">Allergy Alerts</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium">No known allergies</div>
                          <div className="text-sm text-muted-foreground">Updated: 2026-06-15</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No active prescription
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tools & Utilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => alert("Drug interaction checker opened")} 
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <CircleHelp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">Interaction Check</div>
                        <div className="text-sm text-muted-foreground">Check drug compatibility</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => alert("Insurance eligibility tool opened")} 
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Insurance Check</div>
                        <div className="text-sm text-muted-foreground">Verify coverage</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => alert("Dosage calculator opened")} 
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <Calculator className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">Dosage Calc</div>
                        <div className="text-sm text-muted-foreground">Pediatric/geriatric dosing</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}