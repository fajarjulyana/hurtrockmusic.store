import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import type { CartItem as DBCartItem, Product } from '@shared/schema';
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalizationProvider, useLocalization } from "@/contexts/LocalizationContext";

// Components
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import ProductGrid from "@/components/ProductGrid";
import FeaturedArtists from "@/components/FeaturedArtists";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ShoppingCart from "@/components/ShoppingCart";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import MidtransPayment from "@/components/MidtransPayment";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import AdminPage from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import NotFoundPage from "@/pages/not-found";
import PaymentSuccessPage from "@/pages/payment-success"; // Import the new page
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/protected-route";

// Shadcn Components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Extended cart item type for frontend display
interface CartItem extends DBCartItem {
  product?: Product;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
}

function HomePage() {
  const { translations } = useLocalization();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch cart items from API
  const { data: cartItems = [], refetch: refetchCart } = useQuery<CartItem[]>({
    queryKey: ['/api/cart']
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      console.log('Adding product to cart:', productId);
      const response = await apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add to cart error:', errorData);
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      console.log('Successfully added to cart:', data);
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
      alert('Gagal menambahkan ke keranjang: ' + (error as Error).message);
    }
  });

  // Update cart quantity mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      console.error('Failed to update cart:', error);
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    }
  });

  // Cart action handlers
  const addToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    updateCartMutation.mutate({ id, quantity });
  };

  const removeFromCart = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  const handleShopNow = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreCollection = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    console.log('Category clicked:', categoryId);
    setSelectedCategory(categoryId);
    // Clear search when selecting category
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="homepage">
      {/* Header with Cart */}
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onSearchSubmit={handleSearch}
      />

      {/* Theme and Language Toggle - Fixed Position */}
      <div className="fixed top-20 right-4 z-40 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Shopping Cart Sidebar */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader className="mb-6">
            <SheetTitle>{translations.shoppingCart}</SheetTitle>
          </SheetHeader>
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={() => {
              if (!user) {
                // Redirect to login if not authenticated
                window.location.href = '/auth';
                return;
              }
              console.log('Proceeding to checkout');
              setIsCartOpen(false);
              setIsPaymentOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Midtrans Payment Dialog */}
      <Sheet open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader className="mb-6">
            <SheetTitle>{translations.payment}</SheetTitle>
          </SheetHeader>
          <MidtransPayment
            onPaymentSuccess={(result) => {
              console.log('Payment successful:', result);
              setIsPaymentOpen(false);
              // Clear cart after successful payment
              queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
              // Optionally redirect to a success page or show a confirmation message
              window.location.href = `/payment/success?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`;
            }}
            onPaymentPending={(result) => {
              console.log('Payment pending:', result);
              setIsPaymentOpen(false);
              window.location.href = `/payment/pending?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`;
            }}
            onPaymentError={(result) => {
              console.log('Payment error:', result);
              alert('Pembayaran gagal. Silakan coba lagi.');
              window.location.href = `/payment/error?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`;
            }}
            onClose={() => setIsPaymentOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main>
        {/* Show hero and other sections only when not searching */}
        {!debouncedSearchQuery && (
          <>
            {/* Hero Section */}
            <Hero
              onShopNowClick={handleShopNow}
              onExploreClick={handleExploreCollection}
            />

            {/* Categories Section */}
            <div id="categories">
              <CategorySection onCategoryClick={handleCategorySelect} />
            </div>
          </>
        )}

        {/* Products Section - Always visible but title changes based on search */}
        <div id="products">
          <ProductGrid
            title={debouncedSearchQuery ? `Hasil Pencarian: "${debouncedSearchQuery}"` : "Featured Products"}
            selectedCategory={selectedCategory}
            searchQuery={debouncedSearchQuery}
            onAddToCart={addToCart}
            onToggleFavorite={(id) => console.log('Toggled favorite:', id)}
            onProductClick={(id) => console.log('View product:', id)}
          />
        </div>

        {/* Show other sections only when not searching */}
        {!debouncedSearchQuery && (
          <>
            {/* Featured Artists */}
            <FeaturedArtists
              onArtistClick={(id) => console.log('View artist:', id)}
            />

            {/* Contact Section */}
            <ContactSection
              onFormSubmit={(data) => console.log('Contact form:', data)}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNewsletterSubmit={(email) => console.log('Newsletter signup:', email)}
      />
    </div>
  );
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/admin" component={AdminPage} requireAdmin={true} />
        <Route path="/payment/success" component={PaymentSuccessPage} />
        <Route path="/payment/pending" component={PaymentSuccessPage} />
        <Route path="/payment/error" component={PaymentSuccessPage} />
        <Route component={NotFoundPage} />
      </Switch>

      {/* Floating Chat Widget - Available on all pages */}
      <FloatingChatWidget />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}