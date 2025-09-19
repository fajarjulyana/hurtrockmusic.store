import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface ShoppingCartProps {
  items?: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onCheckout?: () => void;
}

export default function ShoppingCart({ 
  items = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: ShoppingCartProps) {
  const { translations, formatCurrency } = useLocalization();
  const [cartItems, setCartItems] = useState<CartItem[]>(items);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    onUpdateQuantity?.(id, newQuantity);
    console.log('Updated quantity:', id, newQuantity);
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    onRemoveItem?.(id);
    console.log('Removed item:', id);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    let price = item.price;
    
    // Ensure price is a valid number
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
    
    // Fallback to 0 if price is still not a valid number
    if (isNaN(price) || price === null || price === undefined) {
      console.warn('Invalid price for item:', item);
      price = 0;
    }
    
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    onCheckout?.();
    console.log('Checkout initiated');
  };

  if (cartItems.length === 0) {
    return (
      <Card className="w-full max-w-md" data-testid="cart-empty">
        <CardContent className="p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2" data-testid="text-empty-cart">
            {translations.emptyCart}
          </h3>
          <p className="text-muted-foreground mb-4" data-testid="text-empty-cart-description">
            {translations.emptyCartDescription}
          </p>
          <Button data-testid="button-continue-shopping">
            {translations.continueShopping}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="cart-with-items">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="text-cart-title">
          <ShoppingBag className="h-5 w-5" />
          Keranjang Belanja ({cartItems.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3" data-testid={`cart-item-${item.id}`}>
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
                data-testid={`img-cart-item-${item.id}`}
              />
              
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium text-sm leading-tight" data-testid={`text-cart-item-name-${item.id}`}>
                    {item.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs" data-testid={`badge-cart-item-category-${item.id}`}>
                    {item.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm" data-testid={`text-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" data-testid={`text-cart-item-total-${item.id}`}>
                      {(() => {
                        let price = item.price;
                        if (typeof price === 'string') {
                          price = parseFloat(price);
                        }
                        if (isNaN(price) || price === null || price === undefined) {
                          price = 0;
                        }
                        return formatCurrency(price * item.quantity);
                      })()}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2" data-testid="order-summary">
          <div className="flex justify-between text-sm">
            <span data-testid="text-subtotal-label">{translations.subtotal}:</span>
            <span data-testid="text-subtotal-amount">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span data-testid="text-tax-label">{translations.tax}:</span>
            <span data-testid="text-tax-amount">{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span data-testid="text-total-label">{translations.total}:</span>
            <span data-testid="text-total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleCheckout}
          data-testid="button-checkout"
        >
          {translations.checkout}
        </Button>
      </CardContent>
    </Card>
  );
}