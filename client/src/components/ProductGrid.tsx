import { useState } from 'react';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Grid, List, Loader2 } from 'lucide-react';
import type { Product as DBProduct, Category } from '@shared/schema';
import guitarsImage from '@assets/generated_images/Vintage_guitars_collection_1895215a.png';
import vinylImage from '@assets/generated_images/Vintage_vinyl_records_dbaab490.png';
import drumsImage from '@assets/generated_images/Vintage_drum_kit_f4ce4b67.png';
import { useLocalization } from '../contexts/LocalizationContext';

// Extended product type for frontend display with category name
interface Product extends Omit<DBProduct, 'price' | 'originalPrice' | 'rating' | 'categoryId'> {
  price: number;
  originalPrice?: number;
  rating: number;
  category: string; // category name instead of categoryId
  image: string; // fallback image if imageUrl is null
  reviewCount: number;
  isNew?: boolean;
}

interface ProductGridProps {
  title?: string;
  showFilters?: boolean;
  selectedCategory?: string | null;
  searchQuery?: string;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: string[];
  onProductClick?: (productId: string) => void;
}

export default function ProductGrid({
  title = "Featured Products",
  showFilters = true,
  selectedCategory,
  searchQuery = '',
  onAddToCart,
  onToggleFavorite,
  favorites = [],
  onProductClick
}: ProductGridProps) {
  const { translations, formatCurrency } = useLocalization();
  const [sortBy, setSortBy] = useState('featured');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  // Update filterBy when selectedCategory changes
  React.useEffect(() => {
    if (selectedCategory !== undefined) {
      if (selectedCategory === null) {
        setFilterBy('all');
      } else {
        // Map category ID to category name
        const category = categories.find(c => c.id === selectedCategory);
        setFilterBy(category?.name || 'all');
      }
    }
  }, [selectedCategory, categories]);

  // Fetch products from API
  const {
    data: rawProducts = [],
    isLoading,
    error
  } = useQuery<(DBProduct & { categoryName?: string; categoryId: string })[]>({
    queryKey: ['/api/products']
  });

  // Transform products for frontend display
  const products: Product[] = rawProducts.map(product => {
    // Get fallback image based on category
    const getFallbackImage = (categoryName: string) => {
      if (categoryName.toLowerCase().includes('guitar')) return guitarsImage;
      if (categoryName.toLowerCase().includes('vinyl') || categoryName.toLowerCase().includes('record')) return vinylImage;
      if (categoryName.toLowerCase().includes('drum')) return drumsImage;
      return guitarsImage; // default fallback
    };

    return {
      ...product,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
      rating: parseFloat(product.rating || '0'),
      category: product.categoryName || 'Unknown',
      image: product.imageUrl || getFallbackImage(product.categoryName || ''),
      reviewCount: product.reviewCount || 0,
    };
  });

  // Get category options for filter dropdown
  const categoryOptions = ['all', ...categories.map(cat => cat.name)];

  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || translations.unknownCategory;
  };

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    // Filter by category
    const categoryMatch = filterBy === 'all' || product.category === filterBy;

    // Filter by search query
    const searchMatch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(product.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return categoryMatch && searchMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  // Handle no products found based on filter and search
  if (sortedProducts.length === 0) {
    return (
      <section className="py-16" data-testid="section-no-products">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {searchQuery
              ? `Tidak ada produk ditemukan untuk "${searchQuery}"`
              : translations.noProductsFound
            }
          </h2>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Coba gunakan kata kunci yang berbeda atau jelajahi kategori lain'
              : translations.noProductsFoundDescription
            }
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" data-testid="section-product-grid">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h2 className="font-bebas text-4xl md:text-5xl mb-2" data-testid="text-products-title">
              {title}
            </h2>
            <p className="text-muted-foreground" data-testid="text-products-count">
              {sortedProducts.length} {translations.products_found}
            </p>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={translations.filter_by_category} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? translations.all_categories : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder={translations.sort_by} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{translations.featured}</SelectItem>
                  <SelectItem value="newest">{translations.newest_first}</SelectItem>
                  <SelectItem value="price-low">{translations.price_low_to_high}</SelectItem>
                  <SelectItem value="price-high">{translations.price_high_to_low}</SelectItem>
                  <SelectItem value="rating">{translations.highest_rated}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12" data-testid="loading-products">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>{translations.loading_products}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12" data-testid="error-products">
            <p className="text-red-500 mb-4">{translations.failed_to_load_products}</p>
            <Button onClick={() => window.location.reload()}>
              {translations.try_again}
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 lg:grid-cols-2'
            }`}
            data-testid="products-grid"
          >
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => console.log('Load more products')}
            data-testid="button-load-more"
          >
            {translations.load_more_products}
          </Button>
        </div>
      </div>
    </section>
  );
}