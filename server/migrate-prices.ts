
import { db } from './db';
import { products } from '../shared/schema';

async function migratePricesToIDR() {
  console.log('Starting price migration from USD to IDR...');
  
  try {
    // Get all products
    const allProducts = await db.select().from(products);
    
    console.log(`Found ${allProducts.length} products to migrate`);
    
    // Convert prices from USD to IDR (multiply by 15000)
    for (const product of allProducts) {
      const idrPrice = parseFloat(product.price) * 15000;
      const idrOriginalPrice = product.originalPrice ? parseFloat(product.originalPrice) * 15000 : null;
      
      await db.update(products)
        .set({
          price: idrPrice.toString(),
          originalPrice: idrOriginalPrice ? idrOriginalPrice.toString() : null,
        })
        .where(eq(products.id, product.id));
      
      console.log(`Updated ${product.name}: $${product.price} -> Rp${idrPrice.toLocaleString('id-ID')}`);
    }
    
    console.log('Price migration completed successfully!');
  } catch (error) {
    console.error('Error during price migration:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePricesToIDR();
}
