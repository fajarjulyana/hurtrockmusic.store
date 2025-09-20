import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useAuth } from '@/hooks/useAuth';
import type { Category } from '@shared/schema';
import hurtrock_logo from '@assets/image_1758270465273.png';

interface HeaderProps {
  cartItemCount?: number;
  onSearchSubmit?: (query: string) => void;
  onCartClick?: () => void;
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

export default function Header({ 
  cartItemCount = 0, 
  onSearchSubmit, 
  onCartClick, 
  onCategorySelect,
  selectedCategory 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { translations } = useLocalization();
  const { user, logoutMutation } = useAuth();

  // Fetch categories from API
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit?.(searchQuery.trim());
      console.log('Search submitted:', searchQuery);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Trigger search on typing with debouncing
    onSearchSubmit?.(value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearchSubmit?.(searchQuery.trim());
      console.log('Search submitted via Enter:', searchQuery);
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={hurtrock_logo} 
              alt="Hurtrock Music Store" 
              className="h-8 w-auto"
              data-testid="img-logo"
            />
            <span className="font-bebas text-xl text-primary" data-testid="text-brand-name">
              HURTROCK
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => handleCategoryClick(null)}
              className="text-sm font-medium transition-colors hover-elevate"
              data-testid="link-all-categories"
            >
              {translations.allCategories || 'All'}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className="text-sm font-medium transition-colors hover-elevate"
                data-testid={`link-${category.slug}`}
              >
                {category.name}
              </Button>
            ))}
          </nav>

          {/* Search Bar - Desktop Only */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={translations.searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* Cart, Auth, Search (Mobile), and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
              data-testid="button-mobile-search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onCartClick}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'buyer' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/dashboard'}
                      data-testid="menu-dashboard"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  {(user.role === 'admin' || user.role === 'operator') && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/admin'}
                      data-testid="menu-admin"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.location.href = '/auth'}
                data-testid="button-login"
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4" data-testid="menu-mobile">
            {/* Mobile Search - Prioritized at Top */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={translations.searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10"
                  data-testid="input-mobile-search"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-2">
              {/* Auth Section for Mobile */}
              {user ? (
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-2 p-2 mb-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">{user.firstName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'buyer' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/dashboard';
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start mb-1"
                      data-testid="mobile-menu-dashboard"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  )}
                  {(user.role === 'admin' || user.role === 'operator') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/admin';
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start mb-1"
                      data-testid="mobile-menu-admin"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    className="w-full justify-start text-red-600"
                    data-testid="mobile-menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="border-b pb-4 mb-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      window.location.href = '/auth';
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                    data-testid="mobile-menu-login"
                  >
                    Login
                  </Button>
                </div>
              )}

              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  handleCategoryClick(null);
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-sm font-medium transition-colors hover-elevate"
                data-testid="link-mobile-all-categories"
              >
                {translations.allCategories || 'All'}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    handleCategoryClick(category.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-sm font-medium transition-colors hover-elevate"
                  data-testid={`link-mobile-${category.slug}`}
                >
                  {category.name}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}