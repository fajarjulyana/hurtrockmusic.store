import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
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

  // Fetch categories from API
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(searchQuery);
    console.log('Search submitted:', searchQuery);
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={translations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-2">
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
            <nav className="flex flex-col space-y-2">
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
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={translations.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-mobile-search"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}