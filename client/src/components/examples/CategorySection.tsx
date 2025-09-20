import CategorySection from '../CategorySection';

export default function CategorySectionExample() {
  return (
    <CategorySection 
      onCategoryClick={(categoryId) => console.log('Category clicked:', categoryId)}
    />
  );
}