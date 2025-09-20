import ProductCard from '../ProductCard';
import guitarImage from '@assets/generated_images/Vintage_guitars_collection_1895215a.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id="guitar-1"
        name="1959 Gibson Les Paul Standard Vintage Sunburst"
        price={2499.99}
        originalPrice={2799.99}
        image={guitarImage}
        category="Electric Guitars"
        rating={4.8}
        reviewCount={24}
        isNew={false}
        isSale={true}
        onAddToCart={(id) => console.log('Added to cart:', id)}
        onToggleFavorite={(id) => console.log('Toggled favorite:', id)}
        onProductClick={(id) => console.log('Product clicked:', id)}
      />
    </div>
  );
}