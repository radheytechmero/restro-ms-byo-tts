import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
// import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()
// .$extends(withAccelerate())

async function main() {

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash("1234", saltRounds);

  // Create one Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Demo Resto",
      location: "123 Main St, Your City",
      phone: "14502347691",
      email: "info@demoresto.com",
      mid: 'S4YGQATK6ZJJ1',
      token : 'a6099297-56c0-509f-bf89-c79902263ddf',
      password: hashedPassword,
      opening_hours: "10:00-22:00",
      active: true,
    }
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Mc D",
      location: "Vadaodara",
      phone: "18578557617",
      email: "info@mcd.com",
      password: hashedPassword,
      opening_hours: "10:00-22:00",
      active: true,
    }
  });

    const restaurant3 = await prisma.restaurant.create({
    data: {
      name: "Super Admin",
      location: "Nowhere",
      phone: "9879998798",
      email: "superadmin@tm.com",
      role: "superadmin",
      password: hashedPassword,
      opening_hours: "10:00-22:00",
      active: true,
    }
  });

  await prisma.customer.create({
    data: {
      restaurantId: restaurant.id,
      name: "PTM",
      email: "test@gmail.com",
      phone: "19143407710",
      active: true,
    }
  })

  // Create Tables for both restaurants
  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: "1",
      capacity: 4,
      location: "Main Dining Area",
      status: "available"
    }
  });

  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: "2",
      capacity: 6,
      location: "Main Dining Area",
      status: "available"
    }
  });

  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: "3",
      capacity: 2,
      location: "Window Side",
      status: "available"
    }
  });

  await prisma.table.create({
    data: {
      restaurantId: restaurant2.id,
      tableNumber: "1",
      capacity: 4,
      location: "Main Dining Area",
      status: "available"
    }
  });

  await prisma.table.create({
    data: {
      restaurantId: restaurant2.id,
      tableNumber: "2",
      capacity: 6,
      location: "Main Dining Area",
      status: "available"
    }
  });

  // Create Categories
  const categoriesData = [
    { name: 'Pizza', description: 'Delicious pizzas', restaurantId: restaurant2.id },
    { name: 'Pizza', description: 'pizzas', restaurantId: restaurant.id },
    { name: 'Burger', description: 'Juicy burgers', restaurantId: restaurant.id },
    { name: 'Pasta', description: 'Tasty pastas', restaurantId: restaurant.id },
    { name: 'Salad', description: 'Healthy salads', restaurantId: restaurant.id },
    { name: 'Dessert', description: 'Sweet treats', restaurantId: restaurant.id },
    { name: 'Beverage', description: 'Refreshing drinks', restaurantId: restaurant.id },
  ];
  const categories = {};
  for (const catData of categoriesData) {
    const cat = await prisma.category.create({ data: catData });
    categories[cat.name] = cat.id;
  }

  // Insert Menu Items
  const menuItemsData = [
    {
      name: 'Margherita Pizza',
      categoryId: categories['Pizza'],
      price: 12.99,
      description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
      ingredients: 'Tomato sauce, mozzarella cheese, fresh basil, olive oil',
      servesPeople: '2',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      // similarItems: 'Cheese Pizza,Vegetarian Pizza',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant2.id
    },
    {
      name: 'Pepperoni Pizza',
      categoryId: categories['Pizza'],
      price: 15.99,
      description: 'Traditional pepperoni pizza with mozzarella cheese',
      ingredients: 'Tomato sauce, mozzarella cheese, pepperoni, oregano',
      servesPeople: '2',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten, Pork',
      isAvailable: true,
      similarItems: 'Margherita Pizza,Meat Lovers Pizza',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Meat Lovers Pizza',
      categoryId: categories['Pizza'],
      price: 18.99,
      description: 'Loaded with pepperoni, sausage, ham, and bacon',
      ingredients: 'Tomato sauce, mozzarella, pepperoni, sausage, ham, bacon',
      servesPeople: '3',
      spiceLevel: 'Medium',
      allergens: 'Dairy, Gluten, Pork',
      isAvailable: true,
      similarItems: 'Pepperoni Pizza,BBQ Chicken Pizza',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Vegetarian Supreme',
      categoryId: categories['Pizza'],
      price: 16.99,
      description: 'Fresh vegetables with mozzarella cheese',
      ingredients: 'Tomato sauce, mozzarella, bell peppers, mushrooms, onions, olives',
      servesPeople: '2',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      similarItems: 'Margherita Pizza,Mediterranean Pizza',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Classic Cheeseburger',
      categoryId: categories['Burger'],
      price: 10.99,
      description: 'Beef patty with cheese, lettuce, tomato, and pickles',
      ingredients: 'Beef patty, cheese, lettuce, tomato, pickles, mayo',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      similarItems: 'Bacon Cheeseburger,BBQ Burger',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Bacon Cheeseburger',
      categoryId: categories['Burger'],
      price: 12.99,
      description: 'Cheeseburger with crispy bacon',
      ingredients: 'Beef patty, cheese, bacon, lettuce, tomato, pickles',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten, Pork',
      isAvailable: true,
      similarItems: 'Classic Cheeseburger,Double Burger',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Chicken Burger',
      categoryId: categories['Burger'],
      price: 11.99,
      description: 'Grilled chicken breast with mayo and lettuce',
      ingredients: 'Chicken breast, mayo, lettuce, tomato, onion',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      similarItems: 'Turkey Burger,Fish Burger',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Spaghetti Carbonara',
      categoryId: categories['Pasta'],
      price: 14.99,
      description: 'Creamy pasta with bacon and parmesan',
      ingredients: 'Spaghetti, eggs, bacon, parmesan cheese, black pepper',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten, Eggs, Pork',
      isAvailable: true,
      similarItems: 'Fettuccine Alfredo,Pasta Bolognese',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Fettuccine Alfredo',
      categoryId: categories['Pasta'],
      price: 13.99,
      description: 'Rich and creamy fettuccine pasta',
      ingredients: 'Fettuccine, butter, cream, parmesan cheese, garlic',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      similarItems: 'Spaghetti Carbonara,Chicken Alfredo',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Pasta Bolognese',
      categoryId: categories['Pasta'],
      price: 15.99,
      description: 'Traditional meat sauce with spaghetti',
      ingredients: 'Spaghetti, ground beef, tomato sauce, onions, herbs',
      servesPeople: '1',
      spiceLevel: 'Medium',
      allergens: 'Gluten',
      isAvailable: true,
      similarItems: 'Spaghetti Carbonara,Meat Lasagna',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Caesar Salad',
      categoryId: categories['Salad'],
      price: 8.99,
      description: 'Fresh romaine lettuce with caesar dressing',
      ingredients: 'Romaine lettuce, caesar dressing, croutons, parmesan',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy, Gluten',
      isAvailable: true,
      similarItems: 'Garden Salad,Greek Salad',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Greek Salad',
      categoryId: categories['Salad'],
      price: 9.99,
      description: 'Mediterranean salad with feta cheese',
      ingredients: 'Mixed greens, feta cheese, olives, tomatoes, cucumber',
      servesPeople: '1',
      spiceLevel: 'Mild',
      allergens: 'Dairy',
      isAvailable: true,
      similarItems: 'Caesar Salad,Mediterranean Bowl',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Chocolate Cake',
      categoryId: categories['Dessert'],
      price: 6.99,
      description: 'Rich chocolate layer cake',
      ingredients: 'Chocolate, flour, eggs, butter, sugar',
      servesPeople: '2',
      spiceLevel: 'Sweet',
      allergens: 'Dairy, Gluten, Eggs',
      isAvailable: true,
      similarItems: 'Cheesecake,Tiramisu',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Cheesecake',
      categoryId: categories['Dessert'],
      price: 7.99,
      description: 'New York style cheesecake',
      ingredients: 'Cream cheese, graham crackers, eggs, sugar',
      servesPeople: '2',
      spiceLevel: 'Sweet',
      allergens: 'Dairy, Gluten, Eggs',
      isAvailable: true,
      similarItems: 'Chocolate Cake,Apple Pie',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Coca Cola',
      categoryId: categories['Beverage'],
      price: 2.99,
      description: 'Classic cola drink',
      ingredients: 'Carbonated water, sugar, caffeine',
      servesPeople: '1',
      spiceLevel: 'None',
      allergens: 'None',
      isAvailable: true,
      similarItems: 'Pepsi,Sprite',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
    {
      name: 'Fresh Orange Juice',
      categoryId: categories['Beverage'],
      price: 3.99,
      description: 'Freshly squeezed orange juice',
      ingredients: 'Fresh oranges',
      servesPeople: '1',
      spiceLevel: 'None',
      allergens: 'None',
      isAvailable: true,
      similarItems: 'Apple Juice,Lemonade',
      createdAt: new Date('2025-07-14T06:24:16'),
      restaurantId: restaurant.id
    },
  ]
  // await prisma.menuItem.createMany({ data: menuItemsData });
  
  //   for (const item of menuItemsData) {
  //     await prisma.menuItem.create({
  //       data: {
  //         name: item.name,
  //         price: item.price,
  //         description: item.description,
  //         ingredients: item.ingredients,
  //         servesPeople: item.servesPeople,
  //         spiceLevel: item.spiceLevel,
  //         allergens: item.allergens,
  //         similarItems: item.similarItems,
  //         restaurantId: restaurant.id,
  //         categoryId: item.categoryId,
  //         createdAt: new Date('2025-07-14T06:24:16'),
  //       },
  //     });
  //   }
  console.log('Dummy data seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect() })