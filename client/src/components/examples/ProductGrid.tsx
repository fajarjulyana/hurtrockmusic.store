import ProductGrid from '../ProductGrid';

export default function ProductGridExample() {
  return (
    <ProductGrid
      title="Featured Products"
      showFilters={true}
      onAddToCart={(id) => console.log('Added to cart:', id)}
      onToggleFavorite={(id) => console.log('Toggled favorite:', id)}
      onProductClick={(id) => console.log('Product clicked:', id)}
    />
  );
}