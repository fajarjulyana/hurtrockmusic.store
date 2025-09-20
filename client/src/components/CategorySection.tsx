import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { Category as DBCategory } from '@shared/schema';
import guitarsImage from '@assets/generated_images/Vintage_guitars_collection_1895215a.png';
import vinylImage from '@assets/generated_images/Vintage_vinyl_records_dbaab490.png';
import drumsImage from '@assets/generated_images/Vintage_drum_kit_f4ce4b67.png';

interface Category extends DBCategory {
  image: string;
  itemCount: number;
}

interface CategorySectionProps {
  onCategoryClick?: (categoryId: string) => void;
}

export default function CategorySection({ onCategoryClick }: CategorySectionProps) {
  // Fetch categories from API
  const { data: rawCategories = [], isLoading, error } = useQuery<DBCategory[]>({
    queryKey: ['/api/categories']
  });

  // Transform categories for frontend display with fallback images and product counts
  const categories: Category[] = rawCategories.map(category => {
    const getFallbackImage = (name: string) => {
      if (name.toLowerCase().includes('guitar')) return guitarsImage;
      if (name.toLowerCase().includes('vinyl') || name.toLowerCase().includes('record')) return vinylImage;
      if (name.toLowerCase().includes('drum')) return drumsImage;
      return guitarsImage; // default fallback
    };

    return {
      ...category,
      image: getFallbackImage(category.name),
      itemCount: Math.floor(Math.random() * 100) + 20 // TODO: Replace with real count from API
    };
  });

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick?.(categoryId);
    console.log('Category clicked:', categoryId);
  };

  return (
    <section className="py-16 bg-muted/30" data-testid="section-categories">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-bebas text-4xl md:text-5xl mb-4" data-testid="text-categories-title">
            EXPLORE BY CATEGORY
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-categories-description">
            Discover our carefully curated collection of vintage and modern instruments, 
            each piece selected for its exceptional quality and rock heritage.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12" data-testid="loading-categories">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading categories...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12" data-testid="error-categories">
            <p className="text-red-500 mb-4">Failed to load categories</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group hover-elevate overflow-hidden cursor-pointer transition-all duration-300"
              onClick={() => handleCategoryClick(category.id)}
              data-testid={`card-category-${category.id}`}
            >
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-testid={`img-category-${category.id}`}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white">
                    <h3 className="font-bebas text-2xl mb-2" data-testid={`text-category-name-${category.id}`}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-3" data-testid={`text-category-description-${category.id}`}>
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60" data-testid={`text-category-count-${category.id}`}>
                        {category.itemCount} items
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 p-0 h-auto"
                        data-testid={`button-view-category-${category.id}`}
                      >
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => handleCategoryClick('all')}
            data-testid="button-view-all-categories"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}