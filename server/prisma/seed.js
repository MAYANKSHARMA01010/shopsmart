const prisma = require('../src/configs/database.js');

async function main() {
  console.log('Seeding 50 products into the database...');
  
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Toys', 'Books'];
  const adjectives = ['Awesome', 'Sleek', 'Ergonomic', 'Rustic', 'Intelligent', 'Gorgeous', 'Handcrafted', 'Licensed', 'Refined', 'Unbranded'];
  const materials = ['Steel', 'Wooden', 'Concrete', 'Plastic', 'Cotton', 'Granite', 'Rubber', 'Metal', 'Soft', 'Fresh'];
  const items = ['Chair', 'Car', 'Computer', 'Keyboard', 'Mouse', 'Bike', 'Ball', 'Gloves', 'Pants', 'Shirt'];

  const productsData = [];

  for (let i = 1; i <= 50; i++) {
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${materials[Math.floor(Math.random() * materials.length)]} ${items[Math.floor(Math.random() * items.length)]}`;
    
    productsData.push({
      name,
      description: `This is a fantastic ${name.toLowerCase()} that provides exceptional value. Contains premium materials and state-of-the-art construction.`,
      price: Number((Math.random() * 500 + 10).toFixed(2)),
      stock: Math.floor(Math.random() * 200),
      category: categories[Math.floor(Math.random() * categories.length)],
      imageUrl: `https://picsum.photos/seed/${i}/400/400`,
    });
  }

  // Use createMany to efficiently bulk-insert
  const created = await prisma.product.createMany({
    data: productsData,
    skipDuplicates: true
  });

  console.log(`Successfully generated and inserted ${created.count} products.`);
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
