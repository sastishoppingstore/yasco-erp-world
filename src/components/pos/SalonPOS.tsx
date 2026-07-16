import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, User, Scissors, Sparkles, Droplet, Zap, Brush, Gift, CreditCard, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  stylist: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  duration: number; // minutes
  price: number;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  depositPaid: boolean;
  addons: string[];
  total: number;
  notes?: string;
}

const appointmentFormSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  service: z.string().min(1, "Please select a service"),
  stylist: z.string().min(1, "Please select a stylist"),
  date: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  duration: z.number().min(15, "Minimum 15 minutes").max(240, "Maximum 4 hours"),
  price: z.number().min(0, "Price must be positive"),
  depositAmount: z.number().min(0).max(100).default(0),
  notes: z.string().optional()
});

const stylists = [
  { id: "S1", name: "Fatima Al-Saud", specialty: ["Haircut", "Color", "Styling"] },
  { id: "S2", name: "Aisha Mohammed", specialty: ["Bridal", "Extensions", "Treatment"] },
  { id: "S3", name: "Khalid Hassan", specialty: ["Men's Cut", "Shave", "Beard Trim"] },
  { id: "S4", name: "Noor Al-Farsi", specialty: ["Nails", "Waxing", "Facial"] }
];

const services = [
  { id: "haircut", name: "Haircut & Style", price: 80, duration: 45 },
  { id: "color", name: "Hair Color Service", price: 250, duration: 120 },
  { id: "highlights", name: "Highlights/Lowlights", price: 300, duration: 150 },
  { id: "keratin", name: "Keratin Treatment", price: 450, duration: 180 },
  { id: "bridal", name: "Bridal Package", price: 1200, duration: 240 },
  { id: "mens", name: "Men's Grooming", price: 60, duration: 30 },
  { id: "beard", name: "Beard Trim & Shape", price: 40, duration: 20 },
  { id: "manicure", name: "Manicure", price: 60, duration: 45 },
  { id: "pedicure", name: "Pedicure", price: 80, duration: 60 },
  { id: "facial", name: "Facial Treatment", price: 200, duration: 90 },
  { id: "waxing", name: "Waxing Service", price: 100, duration: 45 }
];

export default function SalonPOS() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [revenueToday, setRevenueToday] = useState(0);
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "cancelled" | "no-show">("all");
  const { register, handleSubmit, control, reset } = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      clientName: "",
      service: "",
      stylist: "",
      date: new Date().toISOString().split('T')[0],
      time: "10:00",
      duration: 60,
      price: 0,
      depositAmount: 0,
      notes: ""
    }
  });

  // Filter appointments by date and status
  const filteredAppointments = appointments.filter(apt => {
    const dateMatch = apt.date.startsWith(selectedDate);
    const statusMatch = filterStatus === "all" || apt.status === filterStatus;
    return dateMatch && statusMatch;
  });

  // Calculate today's revenue
  const calculateTodayRevenue = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => 
      apt.date === today && 
      (apt.status === "completed" || apt.status === "no-show")
    );
    
    const revenue = todayAppointments.reduce((sum, apt) => sum + apt.total, 0);
    setRevenueToday(revenue);
  };

  // Add appointment
  const addAppointment = (data: z.infer<typeof appointmentFormSchema>) => {
    const newAppointment: Appointment = {
      id: `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientName: data.clientName,
      service: data.service,
      stylist: data.stylist,
      date: data.date,
      time: data.time,
      duration: data.duration,
      price: data.price,
      status: "scheduled",
      depositPaid: data.depositAmount > 0,
      addons: [],
      total: data.price + (data.depositAmount || 0),
      notes: data.notes
    };

    setAppointments(prev => [...prev, newAppointment]);
    reset();
    calculateTodayRevenue();
  };

  // Update appointment status
  const updateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      )
    );
    
    if (status === "completed" || status === "no-show") {
      calculateTodayRevenue();
    }
  };

  // Cancel appointment
  const cancelAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === id ? { ...apt, status: "cancelled" } : apt
      )
    );
    
    calculateTodayRevenue();
  };

  // Complete appointment
  const completeAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === id ? { ...apt, status: "completed" } : apt
      )
    );
    
    calculateTodayRevenue();
  };

  // Add service addon
  const addAddon = (id: string, addon: string, price: number) => {
    setAppointments(prev =>
      prev.map(apt => 
        apt.id === id 
          ? { 
              ...apt, 
              addons: [...apt.addons, addon],
              total: apt.total + price
            } 
          : apt
      )
    );
    
    // If appointment is already completed, update today's revenue
    if (appointments.find(a => a.id === id)?.status === "completed") {
      calculateTodayRevenue();
    }
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <Scissors className="mr-2 h-4 w-4" /> Salon POS
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedDate(new Date(Date.parse(selectedDate) - 86400000).toISOString().split('T')[0])}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedDate(new Date(Date.parse(selectedDate) + 86400000).toISOString().split('T')[0])}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant="secondary">Today: SAR {revenueToday.toFixed(0)}</Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Schedule & Calendar */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {/* Appointment Form */}
            <Card>
              <CardHeader>
                <CardTitle>New Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(addAppointment)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Client Name</label>
                      <Input
                        placeholder="Enter client name"
                        {...register("clientName")}
                      />
                      {errors.clientName && (
                        <p className="text-sm text-red-500 mt-1">{errors.clientName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Service</label>
                      <select
                        {...register("service")}
                        className="block w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select service...</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} (SAR {service.price})
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <p className="text-sm text-red-500 mt-1">{errors.service.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Stylist</label>
                      <select
                        {...register("stylist")}
                        className="block w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select stylist</option>
                        {stylists.map(stylist => (
                          <option key={stylist.id} value={stylist.id}>
                            {stylist.name}
                          </option>
                        ))}
                      </select>
                      {errors.stylist && (
                        <p className="text-sm text-red-500 mt-1">{errors.stylist.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Date</label>
                      <input
                        type="date"
                        {...register("date")}
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full px-3 py-2 border rounded"
                      />
                      {errors.date && (
                        <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Time</label>
                      <input
                        type="time"
                        step="900" // 15 minute intervals
                        {...register("time")}
                        className="block w-full px-3 py-2 border rounded"
                      />
                      {errors.time && (
                        <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        {...register("duration")}
                        className="block w-full px-3 py-2 border rounded"
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Service Price (SAR)</label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        {...register("price")}
                        className="block w-full px-3 py-2 border rounded"
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Deposit %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        {...register("depositAmount")}
                        className="block w-full px-3 py-2 border rounded"
                      />
                      {errors.depositAmount && (
                        <p className="text-sm text-red-500 mt-1">{errors.depositAmount.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                    <textarea
                      {...register("notes")}
                      rows="3"
                      className="block w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="w-48"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Schedule</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFilterStatus("scheduled")}>
                      Upcoming
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFilterStatus("completed")}>
                      Completed
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFilterStatus("cancelled")}>
                      Cancelled
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No appointments for {filterStatus === "all" ? "today" : filterStatus}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`p-3 border rounded hover:bg-muted 
                          ${appointment.status === "completed" ? "border-green-200" : ""
                          } ${appointment.status === "cancelled" ? "border-red-200" : ""
                          } ${appointment.status === "no-show" ? "border-orange-200" : ""}
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.service} • {appointment.stylist}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full 
                              ${appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" : ""
                              } ${appointment.status === "completed" ? "bg-green-100 text-green-800" : ""
                              } ${appointment.status === "cancelled" ? "bg-red-100 text-red-800" : ""
                              } ${appointment.status === "no-show" ? "bg-orange-100 text-orange-800" : ""}
                            }">
                              {appointment.status === "scheduled" ? "Scheduled" :
                               appointment.status === "completed" ? "Completed" :
                               appointment.status === "cancelled" ? "Cancelled" : "No-Show"}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatTime(appointment.time)} ({appointment.duration}min)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-sm font-medium">
                            SAR {appointment.total.toFixed(0)}
                            {appointment.depositPaid && (
                              <span className="ml-2 text-xs text-green-600">
                                (Deposit: {Math.round((appointment.total * 0.3)).toFixed(0)} SAR)
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === "scheduled" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => updateStatus(appointment.id, "completed")}
                                  title="Mark as completed"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => updateStatus(appointment.id, "cancelled")}
                                  title="Cancel appointment"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {appointment.status === "completed" && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => addAddon(appointment.id, "Deep Conditioning Treatment", 50)}
                                title="Add service"
                              >
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-2 text-xs text-muted-foreground italic">
                            "{appointment.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Client Management & Quick Services */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Client Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="mt-4">
                      <div className="font-medium text-lg">Walk-in Client</div>
                      <div className="text-sm text-muted-foreground">New customer</div>
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Visits:</span>
                          <span>1</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Visit:</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Favorite Service:</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Loyalty Points:</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => alert("Client history opened")} 
                    className="w-full"
                  >
                    View Full History
                  </Button>
                </CardFooter>
              </Card>

              {/* Quick Services & Retail */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium mb-2">Express Services</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          alert("Bangs trim added - SAR 25");
                          // In real app, would add to current appointment or create new
                        }}
                        className="w-full text-left p-3 border rounded hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">Bangs Trim</div>
                            <div className="text-sm text-muted-foreground">5 minute service</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">SAR 25</div>
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          alert("Blow dry added - SAR 40");
                        }}
                        className="w-full text-left p-3 border rounded hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">Blow Dry</div>
                            <div className="text-sm text-muted-foreground">15 minutes</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">SAR 40</div>
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          alert("Scalp massage added - SAR 35");
                        }}
                        className="w-full text-left p-3 border rounded hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">Scalp Massage</div>
                            <div className="text-sm text-muted-foreground">10 minutes</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">SAR 35</div>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h3 className="font-medium mb-2">Retail Products</h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            alert("Argan Oil Treatment added - SAR 120");
                          }}
                          className="w-full text-left p-3 border rounded hover:bg-muted"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">Argan Oil Hair Treatment</div>
                              <div className="text-sm text-muted-foreground">100ml bottle</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">SAR 120</div>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => {
                            alert("Sea Salt Spray added - SAR 85");
                          }}
                          className="w-full text-left p-3 border rounded hover:bg-muted"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">Sea Salt Texture Spray</div>
                              <div className="text-sm text-muted-foreground">200ml spray</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">SAR 85</div>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => {
                            alert("Biotin Vitamins added - SAR 95");
                          }}
                          className="w-full text-left p-3 border rounded hover:bg-muted"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">Biotin Hair Vitamins</div>
                              <div className="text-sm text-muted-foreground">60 capsules</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">SAR 95</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => alert("Proceed to checkout with selected items")} 
                  >
                    Add to Ticket
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}