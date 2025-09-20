import ShoppingCart from '../ShoppingCart';
import guitarImage from '@assets/generated_images/Vintage_guitars_collection_1895215a.png';
import vinylImage from '@assets/generated_images/Vintage_vinyl_records_dbaab490.png';

export default function ShoppingCartExample() {
  const sampleItems = [
    {
      id: '1',
      name: '1959 Gibson Les Paul Standard',
      price: 2499.99,
      quantity: 1,
      image: guitarImage,
      category: 'Electric Guitars'
    },
    {
      id: '2', 
      name: 'Led Zeppelin IV - Original Pressing',
      price: 89.99,
      quantity: 2,
      image: vinylImage,
      category: 'Vinyl Records'
    }
  ];

  return (
    <ShoppingCart
      items={sampleItems}
      onUpdateQuantity={(id, quantity) => console.log('Update quantity:', id, quantity)}
      onRemoveItem={(id) => console.log('Remove item:', id)}
      onCheckout={() => console.log('Checkout initiated')}
    />
  );
}