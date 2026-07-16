import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, DollarSign, Trash2, Edit, CheckCircle, Package, CreditCard, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  taxExempt?: boolean;
  customerPriceLevel?: "A" | "B" | "C"; // A=wholesale, B=retail, C=special
}

const checkoutFormSchema = z.object({
  paymentMethod: z.enum(["credit", "bank_transfer", "check", "net_30"]),
  purchaseOrder: z.string().optional(),
  discountCode: z.string().optional(),
  taxExempt: z.boolean().default(false),
});

export default function WholesalePOS() {
  const [scannerActive, setScannerActive] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<{
    id: string;
    name: string;
    creditLimit: number;
    currentBalance: number;
    discountTier: "A" | "B" | "C";
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      paymentMethod: "net_30",
      purchaseOrder: "",
      discountCode: "",
      taxExempt: false
    }
  });

  // Scan barcode from camera
  const handleScan = (data: string | null) => {
    if (data) {
      // Simulate fetching product from inventory
      addItemToCart({
        id: `ITEM-${Date.now()}`,
        sku: `SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        name: `Wholesale Product ${data.slice(-6)}`,
        price: Math.floor(Math.random() * 200) + 50, // Wholesale prices higher
        quantity: 1,
        customerPriceLevel: "A"
      });
      setScannerActive(false);
    }
  };

  // Manual SKU entry
  const handleSKUSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById("sku-input") as HTMLInputElement;
    const sku = input.value.trim().toUpperCase();
    
    if (sku) {
      addItemToCart({
        id: `ITEM-${Date.now()}`,
        sku: sku.length >= 6 ? sku : `SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        name: `Product ${sku.slice(-6)}`,
        price: Math.floor(Math.random() * 200) + 50,
        quantity: 1,
        customerPriceLevel: customerInfo?.discountTier ?? "A"
      });
      input.value = "";
    }
  };

  // Add item to cart
  const addItemToCart = (item: Omit<CartItem, "id"> & { quantity?: number }) => {
    const newItem: CartItem = {
      id: `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quantity: item.quantity ?? 1,
      ...item
    };

    setCart(prev => {
      // Check if same SKU already exists
      const existingIndex = prev.findIndex(existing => 
        existing.sku === newItem.sku
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

  // Apply discount
  const applyDiscount = (code: string) => {
    // Simulate discount validation
    if (code.toUpperCase() === "SALE10") {
      setDiscountAmount(prev => prev + 10); // 10% off
      reset({ ...reset().defaultValues, discountCode: "" });
      calculateTotals();
      alert("10% discount applied!");
    } else if (code.toUpperCase() === "VIP5") {
      setDiscountAmount(prev => prev + 5); // 5% off
      reset({ ...reset().defaultValues, discountCode: "" });
      calculateTotals();
      alert("5% VIP discount applied!");
    } else {
      alert("Invalid discount code");
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    // Calculate subtotal
    const newSubtotal = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      // Apply customer-specific pricing if applicable
      const priceAdjustment = 
        customerInfo?.discountTier === "B" ? 0.15 : // 15% markup for tier B
        customerInfo?.discountTier === "C" ? 0.25 : // 25% markup for tier C
        0; // No adjustment for tier A (wholesale)
      
      return sum + (itemTotal * (1 + priceAdjustment));
    }, 0);
    
    setSubtotal(newSubtotal);
    
    // Calculate tax (5% VAT in KSA, unless tax exempt)
    const newTaxAmount = !customerInfo?.taxExempt && !taxExempt ? 
      newSubtotal * 0.05 : 0;
    setTaxAmount(newTaxAmount);
    
    // Calculate discount
    const newDiscountAmount = (newSubtotal + newTaxAmount) * (discountAmount / 100);
    setDiscountAmount(newDiscountAmount);
    
    // Calculate total
    const newTotal = newSubtotal + newTaxAmount - newDiscountAmount;
    setTotal(newTotal);
  };

  // Set customer
  const setCustomer = (customer: {
    id: string;
    name: string;
    creditLimit: number;
    currentBalance: number;
    discountTier: "A" | "B" | "C";
  }) => {
    setCustomerInfo(customer);
    // Reset discount when customer changes
    setDiscountAmount(0);
    calculateTotals();
  };

  // Clear customer
  const clearCustomer = () => {
    setCustomerInfo(null);
    setDiscountAmount(0);
    calculateTotals();
  };

  // Handle checkout
  const handleCheckout = (data: z.infer<typeof checkoutFormSchema>) => {
    // In a real app, this would create an invoice/order in the ERP
    console.log("Wholesale Order:", { 
      customer: customerInfo,
      cart, 
      subtotal, 
      taxAmount, 
      discountAmount, 
      total,
      ...data 
    });
    
    // Update customer balance if on credit
    if (data.paymentMethod === "net_30" && customerInfo) {
      const newBalance = customerInfo.currentBalance + total;
      if (newBalance <= customerInfo.creditLimit) {
        setCustomerInfo(prev => 
          prev ? { ...prev, currentBalance: newBalance } : null
        );
        alert(`Order placed on credit!\nNew balance: SAR ${newBalance.toFixed(2)} / Limit: SAR ${customerInfo.creditLimit.toFixed(2)}`);
      } else {
        alert(`Credit limit exceeded! Current balance: SAR ${customerInfo.currentBalance.toFixed(2)}, Attempted charge: SAR ${total.toFixed(2)}, Limit: SAR ${customerInfo.creditLimit.toFixed(2)}`);
        return;
      }
    } else {
      alert(`Order confirmed!\nTotal: SAR ${total.toFixed(2)}\nPayment method: ${data.paymentMethod}`);
    }
    
    // Reset for next transaction
    setCart([]);
    setSubtotal(0);
    setTaxAmount(0);
    setDiscountAmount(0);
    setTotal(0);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <Truck className="mr-2 h-4 w-4 text-blue-600" /> Wholesale POS
        </h1>
        <div className="flex items-center gap-4">
          {customerInfo ? (
            <>
              <div className="text-sm">
                <div className="font-medium">{customerInfo.name}</div>
                <div className="text-xs text-muted-foreground">
                  {customerInfo.discountTier === "A" && "Wholesale Price"}
                  {customerInfo.discountTier === "B" && "+15% Markup"}
                  {customerInfo.discountTier === "C" && "+25% Markup"}
                </div>
              </div>
              <Badge 
                variant={customerInfo.currentBalance > (customerInfo.creditLimit * 0.8) ? "destructive" : "secondary"}
              >
                Balance: SAR {customerInfo.currentBalance.toFixed(0)}
              </Badge>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={clearCustomer}
              >
                <Users className="h-3 w-3" /> Clear
              </Button>
            </>
          ) : (
            <Button onClick={() => {
              // Simulate customer lookup
              setCustomerInfo({
                id: "CUST-001",
                name: "Al-Rahbi Trading Co.",
                creditLimit: 50000,
                currentBalance: 12500,
                discountTier: "A"
              });
            }}>
              Lookup Customer
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setScannerActive(true)}>
            <Scan className="h-3 w-3" /> Scan
          </Button>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Scan SKU/Barcode</h2>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Point camera at product barcode or case label
              </p>
            </div>
            <Scanner 
              onScan={handleScan}
              style={{ width: "100%", height: 400 }}
              constraints={{
                facingMode: "environment"
              }}
            />
            <div className="mt-4">
              <Button variant="outline" onClick={() => setScannerActive(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Product Search & Quick Add */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Search */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, or category..."
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              /* Popular / Frequently Ordered Items */
              <div className="space-y-3">
                <h3 className="font-medium mb-2">Frequently Ordered</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => addItemToCart({
                      sku: "WH-001234",
                      name: "Premium Bottled Water (24x500ml)",
                      price: 45.00,
                      quantity: 1,
                      customerPriceLevel: "A"
                    })}
                    className="w-full text-left p-3 border rounded hover:bg-muted"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Premium Bottled Water</div>
                        <div className="text-sm text-muted-foreground">SKU: WH-001234 • 24x500ml bottles</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">SAR 45.00</div>
                        <div className="text-sm text-muted-foreground">Case</div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => addItemToCart({
                      sku: "WH-005678",
                      name: "Industrial Cleaning Solution (20L)",
                      price: 180.00,
                      quantity: 1,
                      customerPriceLevel: "B"
                    })}
                    className="w-full text-left p-3 border rounded hover:bg-muted"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Industrial Cleaner</div>
                        <div className="text-sm text-muted-foreground">SKU: WH-005678 • 20L drum</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">SAR 180.00</div>
                        <div className="text-sm text-muted-foreground">+15% markup</div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => addItemToCart({
                      sku: "WH-009012",
                      name: "Organic Dates Box (5kg)",
                      price: 120.00,
                      quantity: 1,
                      customerPriceLevel: "C"
                    })}
                    className="w-full text-left p-3 border rounded hover:bg-muted"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Organic Dates</div>
                        <div className="text-sm text-muted-foreground">SKU: WH-009012 • 5kg box</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">SAR 120.00</div>
                        <div className="text-sm text-muted-foreground">+25% markup</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Cart & Order Details */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CartTitle>Shopping Cart</CartTitle>
                <Badge variant="secondary">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-2/5">Product</TableHead>
                        <TableHead className="w-1/5">SKU</TableHead>
                        <TableHead className="w-1/5">Price</TableHead>
                        <TableHead className="w-1/5">Qty</TableHead>
                        <TableHead className="w-1/5">Total</TableHead>
                        <TableHead className="w-1">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <div>
                                <div>{item.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.customerPriceLevel === "B" && "(+15%)"}
                                  {item.customerPriceLevel === "C" && "(+25%)"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm font-mono">
                            {item.sku}
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
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>SAR {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (5% VAT):</span>
                            <span>SAR {taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span className="text-red-600">-{discountAmount}%</span>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="font-bold text-lg">
                            <div className="flex justify-between">
                              <span>TOTAL DUE:</span>
                              <span>SAR {total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium block mb-1">Discount Code</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                  placeholder="Enter code (e.g., SALE10, VIP5)"
                  value={reset().defaultValues.discountCode}
                  onChange={(e) => {
                    // Update form value manually since we're not using the form for this
                    const formValues = { ...reset().defaultValues, discountCode: e.target.value };
                    // In a real app, we'd update form state here
                  }}
                  className="flex-1 border rounded px-3 py-2"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.querySelector('input[placeholder="Enter code (e.g., SALE10, VIP5)"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      applyDiscount(input.value.trim());
                      input.value = "";
                    }
                  }}
                >
                  Apply
                </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSubmit(handleCheckout)} 
                    disabled={cart.length === 0 || total <= 0}
                    className="w-48"
                  >
                    Place Order
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right - Customer Info & Payment Terms */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerInfo ? (
                    <>
                      <div className="space-y-3">
                        <div className="border-t pt-3">
                          <div className="text-sm">
                            <div className="font-medium">Credit Limit:</div>
                            <div className="text-right font-medium">
                              SAR {customerInfo.creditLimit.toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span className="font-mono">
                                SAR {customerInfo.currentBalance.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`bg-${customerInfo.currentBalance > (customerInfo.creditLimit * 0.8) ? "red-500" : "green-500"} h-2 rounded-full`} 
                                  style={{ width: `${Math.min((customerInfo.currentBalance / customerInfo.creditLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center mt-1">
                                {Math.min((customerInfo.currentBalance / customerInfo.creditLimit) * 100, 100).toFixed(0)}% Used
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="text-sm">
                            <div className="font-medium">Payment Terms:</span>
                            <div className="text-right">
                              Net 30 Days
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between">
                              <span>Available Credit:</span>
                              <span className="font-mono text-green-600">
                                SAR {(customerInfo.creditLimit - customerInfo.currentBalance).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="text-sm">
                            <div className="font-medium">Last Payment:</span>
                            <div className="text-right">
                              2026-06-15
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between">
                              <span>Days Sales Outstanding:</span>
                              <span className="font-mono">28 days</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        Please select a customer to begin
                      </div>
                    )}
                </CardContent>
              </Card>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={() => alert("Generate packing list")} 
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <ClipboardList className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">Packing List</div>
                            <div className="text-sm text-muted-foreground">Prepare for warehouse</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <Button 
                          variant="outline" 
                          onClick={() => alert("Generate shipping labels")} 
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <Truck className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                              <div className="font-medium">Shipping Labels</div>
                              <div className="text-sm text-muted-foreground">Print for carrier</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="border-t pt-3">
                        <Button 
                          variant="outline" 
                          onClick={() => alert("Create backorder report")} 
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-medium">Backorder Report</div>
                              <div className="text-sm text-muted-foreground">Items needing restock</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}