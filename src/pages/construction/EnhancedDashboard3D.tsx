import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 3D ANIMATED CUBE COMPONENT
 */
const AnimatedCube = ({ color, rotation }: { color: string; rotation: [number, number, number] }) => {
  const mesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mesh.current) {
        mesh.current.rotation.x += 0.01;
        mesh.current.rotation.y += 0.02;
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <mesh ref={mesh} rotation={rotation}>
      <boxGeometry args={[2, 2, 2]} />
      <meshPhongMaterial color={color} />
    </mesh>
  );
};

/**
 * FLOATING 3D KPI SPHERES
 */
const FloatingMetrics = () => {
  const metrics = [
    { label: "Budget", value: "48%", color: "#3B82F6" },
    { label: "Schedule", value: "45%", color: "#10B981" },
    { label: "Quality", value: "94.5", color: "#8B5CF6" },
    { label: "Safety", value: "98.2", color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: idx * 0.1, duration: 0.6 }}
          className="group"
        >
          <div
            className="h-32 rounded-lg p-4 text-white shadow-xl backdrop-blur-sm border border-white border-opacity-20 hover:scale-110 transition-transform cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${metric.color}80, ${metric.color}40)`,
            }}
          >
            <p className="text-sm opacity-90 group-hover:opacity-100">{metric.label}</p>
            <p className="text-4xl font-bold mt-4 group-hover:scale-125 transition-transform">{metric.value}</p>
            <motion.div
              animate={{ width: [0, 100, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 h-1 bg-white rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * ANIMATED PROJECT TIMELINE
 */
const ProjectTimeline = ({ projects }: { projects: any[] }) => {
  if (!projects?.length) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-lg font-medium">No projects yet</p>
        <p className="text-sm mt-1">Project timeline will appear once data is added.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {projects.map((project, idx) => (
        <motion.div
          key={idx}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {idx + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{project.name}</h4>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{project.progress}%</p>
            <p className="text-xs text-gray-500">{project.status}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * REAL-TIME DATA CHARTS
 */
const AnalyticsCharts = () => {
  const { data: budgetData } = useQuery({
    queryKey: ["construction-budget"],
    queryFn: () => [],
    initialData: [],
  });
  const { data: safetyData } = useQuery({
    queryKey: ["construction-safety"],
    queryFn: () => [],
    initialData: [],
  });
  const { data: qualityData } = useQuery({
    queryKey: ["construction-quality"],
    queryFn: () => [],
    initialData: [],
  });

  const hasBudget = Array.isArray(budgetData) && budgetData.length > 0;
  const hasSafety = Array.isArray(safetyData) && safetyData.length > 0;
  const hasQuality = Array.isArray(qualityData) && qualityData.length > 0;

  if (!hasBudget && !hasSafety) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-slate-400">
          <p className="text-lg font-medium">No analytics data yet</p>
          <p className="text-sm mt-1">Charts will appear once project data is available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget Spending Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Budget Analysis</CardTitle>
            <CardDescription>Monthly spending vs allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocated" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="spent" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Incidents Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Safety Performance</CardTitle>
            <CardDescription>Weekly incidents & near-misses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safetyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="nearMiss" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Metrics Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quality Score</CardTitle>
            <CardDescription>Overall inspection results</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={qualityData} cx="50%" cy="50%" labelLine={false} outerRadius={100}>
                  {qualityData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Index */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Performance Index</CardTitle>
            <CardDescription>Trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

/**
 * AI-POWERED INSIGHTS
 */
const AIInsights = () => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Project Insights</span>
        </CardTitle>
        <CardDescription>Project overview & recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Connect data source to see project insights.
        </div>
      </CardContent>
    </Card>
  );
};
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * MAIN ENHANCED 3D DASHBOARD
 */
export function EnhancedDashboard3D() {
  const projects: { name: string; progress: number; status: string }[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            🏗️ YASCO Construction ERP
          </h1>
          <p className="text-lg text-gray-300">Real-time Project Management & Analytics</p>
        </motion.div>

        {/* Floating Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FloatingMetrics />
        </motion.div>

        {/* 3D Visualization Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white border-opacity-20">
            <CardHeader>
              <CardTitle className="text-white">3D Project Visualization</CardTitle>
              <CardDescription className="text-gray-300">Interactive 3D cubes representing project metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <Canvas className="w-full h-full">
                  <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                  <OrbitControls />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <AnimatedCube color="#3B82F6" rotation={[0, 0, 0]} />
                </Canvas>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white border-opacity-20">
            <CardHeader>
              <CardTitle className="text-white">📋 Project Timeline</CardTitle>
              <CardDescription className="text-gray-300">Current project phases & progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectTimeline projects={mockProjects} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
          <AnalyticsCharts />
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <AIInsights />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "📜", label: "Payment Cert", action: "Generate" },
                  { icon: "💰", label: "Budget", action: "Review" },
                  { icon: "🛡️", label: "Safety", action: "Report" },
                  { icon: "✅", label: "Quality", action: "Inspect" },
                ].map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
                  >
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <div className="font-semibold text-sm">{action.label}</div>
                    <div className="text-xs opacity-75">{action.action}</div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default EnhancedDashboard3D;
