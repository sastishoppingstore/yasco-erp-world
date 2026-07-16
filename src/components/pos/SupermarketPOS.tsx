import { useState } from "react";
import { Scanner } from "react-qr-reader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Barcode, Trash2, Edit, CheckCircle, Scanner as ScannerIcon } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  weight?: number; // For weighable items
  isWeighable?: boolean;
}

export default function SupermarketPOS() {
  const [scannerActive, setScannerActive] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [weight, setWeight] = useState(0);

  // Scan barcode from camera
  const handleScan = (data: string | null) => {
    if (data) {
      addItemToCart({
        id: `ITEM-${Date.now()}`,
        name: `Scanned Product ${data.slice(-6)}`,
        price: Math.floor(Math.random() * 100) + 5,
        barcode: data,
        quantity: 1
      });
      setScannerActive(false);
    }
  };

  // Manual barcode entry
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById("barcode-input") as HTMLInputElement;
    const barcode = input.value.trim();
    
    if (barcode) {
      addItemToCart({
        id: `ITEM-${Date.now()}`,
        name: `Product ${barcode.slice(-6)}`,
        price: Math.floor(Math.random() * 100) + 5,
        barcode,
        quantity: 1
      });
      input.value = "";
    }
  };

  // Add item to cart
  const addItemToCart = (item: Omit<CartItem, "id"> & { quantity?: number }) => {
    const newItem: CartItem = {
      id: `SM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quantity: item.quantity ?? 1,
      ...item
    };

    setCart(prev => {
      // Check if same barcode already exists
      const existingIndex = prev.findIndex(existing => 
        existing.barcode === item.barcode
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }

      return [...prev, newItem];
    });

    calculateTotal();
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    calculateTotal();
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
    calculateTotal();
  };

  // Calculate total
  const calculateTotal = () => {
    const newTotal = cart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    setTotal(newTotal);
  };

  // Handle weight input for produce
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setWeight(value);
    }
  };

  // Add weighable item
  const addWeighableItem = () => {
    if (weight > 0) {
      addItemToCart({
        id: `WEIGH-${Date.now()}`,
        name: "Fresh Produce",
        price: 15, // per kg
        weight,
        isWeighable: true,
        quantity: 1
      });
      setWeight(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <Barcode className="mr-2 h-4 w-4" /> Supermarket POS
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setScannerActive(true)}>
            <ScannerIcon className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => alert(`Total due: SAR ${total.toFixed(2)}`)}
            disabled={cart.length === 0}
            className="w-48"
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Scan Barcode</h2>
            <Scanner 
              onScan={handleScan}
              style={{ width: "100%", height: 400 }}
              constraints={{
                facingMode: "environment"
              }}
            />
            <Button variant="outline" onClick={() => setScannerActive(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Item Entry */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Barcode Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Barcode</label>
                <div className="flex items-center gap-2">
                  <input
                    id="barcode-input"
                    type="text"
                    placeholder="Scan or enter barcode"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          handleBarcodeSubmit(new Event("submit") as React.FormEvent);
                        }
                      }
                    }}
                    className="flex-1 border rounded px-3 py-2"
                    autoFocus
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBarcodeSubmit}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Weighable Items Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Weighable Items</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    min="0"
                    step="0.01"
                    value={weight}
                    onChange={handleWeightChange}
                    className="w-24 border rounded px-3 py-2 text-center"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                  <Button 
                    variant="outline" 
                    onClick={addWeighableItem}
                    disabled={weight <= 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Cart */}
        <div className="lg:col-span-1">
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
                        <TableHead className="w-1/2">Item</TableHead>
                        <TableHead className="w-1/6">Price</TableHead>
                        <TableHead className="w-1/6">Qty</TableHead>
                        <TableHead className="w-1/6">Total</TableHead>
                        <TableHead className="w-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted">
                          <TableCell className="font-medium">
                            {item.name}
                            {item.isWeighable && ` (${item.weight.toFixed(2)} kg)`}
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
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>SAR {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => alert(`Purchase complete! Total: SAR ${total.toFixed(2)}`)} 
                  disabled={cart.length === 0}
                  className="w-48"
                >
                  Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}