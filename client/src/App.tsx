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
import AdminPage from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/protected-route";

// Shadcn Components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Extended cart item type with product details for frontend display
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

  // Fetch cart items from API
  const { data: cartItems = [], refetch: refetchCart } = useQuery<CartItem[]>({
    queryKey: ['/api/cart']
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      console.log('Successfully added to cart');
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
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

  const handleCategoryClick = (categoryId: string) => {
    console.log('Navigate to category:', categoryId);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    console.log('Search for:', query);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
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
        onSearchSubmit={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
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
            }}
            onPaymentPending={(result) => {
              console.log('Payment pending:', result);
              setIsPaymentOpen(false);
            }}
            onPaymentError={(result) => {
              console.log('Payment error:', result);
              alert('Pembayaran gagal. Silakan coba lagi.');
            }}
            onClose={() => setIsPaymentOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero
          onShopNowClick={handleShopNow}
          onExploreClick={handleExploreCollection}
        />

        {/* Categories Section */}
        <div id="categories">
          <CategorySection onCategoryClick={handleCategoryClick} />
        </div>

        {/* Featured Products */}
        <div id="products">
          <ProductGrid
            title="Featured Instruments"
            showFilters={true}
            onAddToCart={addToCart}
            onToggleFavorite={(id) => console.log('Toggled favorite:', id)}
            onProductClick={(id) => console.log('View product:', id)}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Featured Artists */}
        <FeaturedArtists
          onArtistClick={(id) => console.log('View artist:', id)}
        />

        {/* Contact Section */}
        <ContactSection
          onFormSubmit={(data) => console.log('Contact form:', data)}
        />
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
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminPage} requireAdmin={true} />
      <Route>
        {/* 404 Page */}
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1 className="font-bebas text-6xl text-primary mb-4">404</h1>
            <h2 className="font-bebas text-2xl mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-8">
              Halaman yang Anda cari tidak ada.
            </p>
            <Button asChild>
              <a href="/" data-testid="button-back-home">
                Kembali ke Beranda
              </a>
            </Button>
          </div>
        </div>
      </Route>
    </Switch>
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