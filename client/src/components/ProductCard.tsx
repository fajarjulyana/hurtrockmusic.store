import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onProductClick?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating,
  reviewCount,
  isNew = false,
  isSale = false,
  onAddToCart,
  onToggleFavorite,
  onProductClick
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { formatCurrency } = useLocalization();

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    onToggleFavorite?.(id);
    console.log('Toggled favorite:', id);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    onAddToCart?.(id);
    console.log('Added to cart:', id);
    // Simulate async operation
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const handleProductClick = () => {
    onProductClick?.(id);
    console.log('Product clicked:', id);
  };

  return (
    <Card className="group hover-elevate overflow-hidden" data-testid={`card-product-${id}`}>
      <div className="relative">
        {/* Product Image */}
        <div 
          className="aspect-square bg-muted cursor-pointer overflow-hidden"
          onClick={handleProductClick}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`img-product-${id}`}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {isNew && (
            <Badge variant="destructive" className="text-xs" data-testid={`badge-new-${id}`}>
              NEW
            </Badge>
          )}
          {isSale && (
            <Badge className="bg-primary text-primary-foreground text-xs" data-testid={`badge-sale-${id}`}>
              SALE
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
          onClick={handleToggleFavorite}
          data-testid={`button-favorite-${id}`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Category */}
          <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${id}`}>
            {category}
          </Badge>

          {/* Product Name */}
          <h3 
            className="font-semibold text-lg leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleProductClick}
            data-testid={`text-product-name-${id}`}
          >
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2" data-testid={`rating-${id}`}>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2" data-testid={`price-${id}`}>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          data-testid={`button-add-to-cart-${id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}