import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Store } from './models/Store.js';
import { Product } from './models/Product.js';

dotenv.config();

export const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zaalima_ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to MongoDB at', mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});

    // 1. Create Default Users (Customer, Vendor, Admin)
    const customer = await User.create({
      name: 'Harsh Shah (Customer)',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer'
    });

    const vendor = await User.create({
      name: 'Mydeal Vendor Partner',
      email: 'vendor@example.com',
      password: 'password123',
      role: 'vendor'
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // 2. Create Multi-Tenant Stores
    await Store.create({
      tenantId: 'tenant-megastore',
      name: 'Mydeal MegaStore',
      tagline: 'India’s Favorite Online Shopping Destination',
      themeColor: '#e40046',
      bannerTitle: 'Mega Shopping Festival',
      bannerSubtitle: 'Up to 80% OFF on Top Electronics, Fashion & Home',
      owner: vendor._id
    });

    await Store.create({
      tenantId: 'tenant-fashion',
      name: 'My Style & Fashion',
      tagline: 'Trendy & Affordable Fashion For Everyone',
      themeColor: '#d32f2f',
      bannerTitle: 'New Fashion Season Collection',
      bannerSubtitle: 'Flat 60% OFF on Ethnic Wear, Footwear & Accessories',
      owner: vendor._id
    });

    await Store.create({
      tenantId: 'tenant-techhub',
      name: 'TechHub Electronics Store',
      tagline: 'Next-Gen Gadgets & Smart Electronics',
      themeColor: '#1976d2',
      bannerTitle: 'Tech Revolution Sale',
      bannerSubtitle: 'Exclusive Discounts on Laptops, Audio & Smartwatches',
      owner: vendor._id
    });

    // 3. Create Products for Store 1 (tenant-megastore)
    await Product.insertMany([
      {
        tenantId: 'tenant-megastore',
        name: 'Boat Rockerz 450 Bluetooth Wireless On-Ear Headphones',
        brand: 'boAt',
        price: 1299,
        originalPrice: 3990,
        discount: '67% OFF',
        rating: 4.5,
        reviewsCount: 1240,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-megastore',
        name: 'HP 15s Intel Core i5 12th Gen Thin & Light Laptop',
        brand: 'HP',
        price: 49990,
        originalPrice: 65000,
        discount: '23% OFF',
        rating: 4.6,
        reviewsCount: 850,
        category: 'Laptops & Computers',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-megastore',
        name: 'Noise ColorFit Pulse Smartwatch with SpO2 & Heart Rate Monitor',
        brand: 'Noise',
        price: 1499,
        originalPrice: 4999,
        discount: '70% OFF',
        rating: 4.3,
        reviewsCount: 2310,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-megastore',
        name: "Men's Slim Fit Printed Cotton Casual Shirt",
        brand: 'Roadster',
        price: 699,
        originalPrice: 1999,
        discount: '65% OFF',
        rating: 4.2,
        reviewsCount: 430,
        category: "Men's Fashion",
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-megastore',
        name: 'Prestige Stainless Steel Non-Stick Cookware Set (3 Pcs)',
        brand: 'Prestige',
        price: 1899,
        originalPrice: 3999,
        discount: '52% OFF',
        rating: 4.4,
        reviewsCount: 560,
        category: 'Home & Kitchen',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-megastore',
        name: "Women's Anarkali Kurta Set with Chiffon Dupatta",
        brand: 'Biba',
        price: 1249,
        originalPrice: 3499,
        discount: '64% OFF',
        rating: 4.5,
        reviewsCount: 780,
        category: "Women's Fashion",
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },

      // Tenant 2: Zaalima Style & Fashion (tenant-fashion)
      {
        tenantId: 'tenant-fashion',
        name: "Women's Designer Embroidered Silk Saree with Blouse Piece",
        brand: 'Zaalima Couture',
        price: 1899,
        originalPrice: 4999,
        discount: '62% OFF',
        rating: 4.7,
        reviewsCount: 1560,
        category: "Women's Fashion",
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-fashion',
        name: "Men's Premium Denim Jacket with Vintage Wash",
        brand: 'Levis',
        price: 1499,
        originalPrice: 3999,
        discount: '62% OFF',
        rating: 4.4,
        reviewsCount: 620,
        category: "Men's Fashion",
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-fashion',
        name: "Women's Casual Floral A-Line Summer Dress",
        brand: 'Zara Style',
        price: 899,
        originalPrice: 2499,
        discount: '64% OFF',
        rating: 4.3,
        reviewsCount: 390,
        category: "Women's Fashion",
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-fashion',
        name: "Men's Genuine Leather Formal Oxford Shoes",
        brand: 'Red Tape',
        price: 1799,
        originalPrice: 4499,
        discount: '60% OFF',
        rating: 4.5,
        reviewsCount: 880,
        category: "Men's Fashion",
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-fashion',
        name: 'Designer Faux Leather Handbag for Women',
        brand: 'Lavie',
        price: 1199,
        originalPrice: 2999,
        discount: '60% OFF',
        rating: 4.6,
        reviewsCount: 1120,
        category: "Women's Fashion",
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },

      // Tenant 3: TechHub Electronics Store (tenant-techhub)
      {
        tenantId: 'tenant-techhub',
        name: 'Apple iPad Air (5th Gen) 10.9-inch Wi-Fi 64GB',
        brand: 'Apple',
        price: 54900,
        originalPrice: 59900,
        discount: '8% OFF',
        rating: 4.8,
        reviewsCount: 3200,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-techhub',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        brand: 'Sony',
        price: 26990,
        originalPrice: 34990,
        discount: '22% OFF',
        rating: 4.9,
        reviewsCount: 2150,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80',
        isDealOfTheDay: true,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-techhub',
        name: 'Samsung 27-inch 4K IPS Ultra-Slim Gaming Monitor',
        brand: 'Samsung',
        price: 24499,
        originalPrice: 32000,
        discount: '23% OFF',
        rating: 4.7,
        reviewsCount: 740,
        category: 'Laptops & Computers',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-techhub',
        name: 'Logitech MX Master 3S Performance Wireless Mouse',
        brand: 'Logitech',
        price: 7995,
        originalPrice: 10995,
        discount: '27% OFF',
        rating: 4.8,
        reviewsCount: 1890,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      },
      {
        tenantId: 'tenant-techhub',
        name: 'RGB Mechanical Gaming Keyboard with Tactile Switches',
        brand: 'Razer',
        price: 3499,
        originalPrice: 6999,
        discount: '50% OFF',
        rating: 4.5,
        reviewsCount: 940,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
        isDealOfTheDay: false,
        createdBy: vendor._id
      }
    ]);

    console.log('Seed: Database seeded successfully with Users, Stores, and 15 Products!');
  } catch (error) {
    console.error('Seed Error:', error);
  }
};

if (process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => mongoose.connection.close());
}
