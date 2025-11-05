const { Sequelize } = require('sequelize');
const config = require('../../config/config');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(config.development);

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    
    // Create users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        phone VARCHAR,
        role VARCHAR CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create categories table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create products table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
        stock INTEGER DEFAULT 0,
        warranty_months INTEGER DEFAULT 12,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create product_images table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
        image_url VARCHAR NOT NULL,
        alt_text VARCHAR,
        display_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create orders table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        total_price DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
        order_status VARCHAR CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
        shipping_address_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create order_items table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL
      );
    `);

    // Create cart_items table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);

    // Create warranties table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS warranties (
        warranty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
        purchase_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        serial_number VARCHAR UNIQUE,
        invoice_url VARCHAR,
        registration_type VARCHAR CHECK (registration_type IN ('auto', 'manual')) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create claims table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS claims (
        claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warranty_id UUID REFERENCES warranties(warranty_id) ON DELETE CASCADE,
        issue_description TEXT NOT NULL,
        image_url VARCHAR,
        status VARCHAR CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create password_reset_tokens table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        token VARCHAR UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(display_order);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_warranties_user_id ON warranties(user_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_warranties_product_id ON warranties(product_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_warranties_expiry_date ON warranties(expiry_date);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_warranties_serial_number ON warranties(serial_number);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_warranties_registration_type ON warranties(registration_type);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_claims_warranty_id ON claims(warranty_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`);

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function seedData() {
  try {
    console.log('🌱 Seeding data...');

    // Check if admin user already exists
    const existingAdmin = await sequelize.query(
      'SELECT user_id FROM users WHERE email = ?',
      { replacements: ['admin@ecommerce.com'], type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Insert admin user
      await sequelize.query(`
        INSERT INTO users (user_id, name, email, password_hash, phone, role, created_at, updated_at)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@ecommerce.com', ?, '+1234567890', 'admin', NOW(), NOW())
      `, { replacements: [hashedPassword] });

      // Insert sample customers
      const customerPassword = await bcrypt.hash('password123', 12);
      await sequelize.query(`
        INSERT INTO users (user_id, name, email, password_hash, phone, role, created_at, updated_at)
        VALUES 
          ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@example.com', ?, '+1234567891', 'customer', NOW(), NOW()),
          ('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'jane.smith@example.com', ?, '+1234567892', 'customer', NOW(), NOW())
      `, { replacements: [customerPassword, customerPassword] });
    }

    // Check if categories already exist
    const existingCategories = await sequelize.query(
      'SELECT COUNT(*) as count FROM categories',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingCategories[0].count === '0') {
      // Insert sample categories
      await sequelize.query(`
        INSERT INTO categories (category_id, name, description, is_active, created_at, updated_at)
        VALUES 
          ('770e8400-e29b-41d4-a716-446655440000', 'Electronics', 'Electronic devices and gadgets', true, NOW(), NOW()),
          ('770e8400-e29b-41d4-a716-446655440001', 'Computers', 'Laptops, desktops, and computer accessories', true, NOW(), NOW()),
          ('770e8400-e29b-41d4-a716-446655440002', 'Audio', 'Headphones, speakers, and audio equipment', true, NOW(), NOW()),
          ('770e8400-e29b-41d4-a716-446655440003', 'Gaming', 'Gaming consoles, games, and accessories', true, NOW(), NOW()),
          ('770e8400-e29b-41d4-a716-446655440004', 'Tablets', 'Tablets and tablet accessories', true, NOW(), NOW())
      `);
    }

    // Check if products already exist
    const existingProducts = await sequelize.query(
      'SELECT COUNT(*) as count FROM products',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingProducts[0].count === '0') {
      // Insert sample products
      await sequelize.query(`
        INSERT INTO products (product_id, name, description, price, category_id, stock, warranty_months, is_active, created_at)
        VALUES 
          ('660e8400-e29b-41d4-a716-446655440000', 'iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 999.99, '770e8400-e29b-41d4-a716-446655440000', 50, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440001', 'Samsung Galaxy S24', 'Premium Android smartphone with AI-powered features', 899.99, '770e8400-e29b-41d4-a716-446655440000', 30, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440002', 'MacBook Pro 16"', 'Powerful laptop with M3 Pro chip for professionals', 2499.99, '770e8400-e29b-41d4-a716-446655440001', 20, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440003', 'Dell XPS 13', 'Ultrabook with stunning display and long battery life', 1299.99, '770e8400-e29b-41d4-a716-446655440001', 25, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440004', 'Sony WH-1000XM5', 'Premium noise-canceling wireless headphones', 399.99, '770e8400-e29b-41d4-a716-446655440002', 40, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440005', 'AirPods Pro 2', 'Apple wireless earbuds with active noise cancellation', 249.99, '770e8400-e29b-41d4-a716-446655440002', 60, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440006', 'Nintendo Switch OLED', 'Gaming console with vibrant OLED display', 349.99, '770e8400-e29b-41d4-a716-446655440003', 35, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440007', 'PlayStation 5', 'Next-generation gaming console with ultra-fast SSD', 499.99, '770e8400-e29b-41d4-a716-446655440003', 15, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440008', 'iPad Air 5th Gen', 'Powerful tablet with M1 chip and Liquid Retina display', 599.99, '770e8400-e29b-41d4-a716-446655440004', 30, 12, true, NOW()),
          ('660e8400-e29b-41d4-a716-446655440009', 'Samsung Galaxy Tab S9', 'Premium Android tablet with S Pen included', 799.99, '770e8400-e29b-41d4-a716-446655440004', 20, 12, true, NOW())
      `);

      // Insert sample product images
      await sequelize.query(`
        INSERT INTO product_images (image_id, product_id, image_url, alt_text, display_order, is_primary, created_at)
        VALUES 
          ('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'https://example.com/iphone15pro1.jpg', 'iPhone 15 Pro Front View', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'https://example.com/iphone15pro2.jpg', 'iPhone 15 Pro Back View', 2, false, NOW()),
          ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'https://example.com/galaxys24_1.jpg', 'Samsung Galaxy S24 Front', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'https://example.com/galaxys24_2.jpg', 'Samsung Galaxy S24 Back', 2, false, NOW()),
          ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'https://example.com/macbookpro_1.jpg', 'MacBook Pro 16 inch', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'https://example.com/dellxps13_1.jpg', 'Dell XPS 13', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'https://example.com/sonyxm5_1.jpg', 'Sony WH-1000XM5 Headphones', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 'https://example.com/airpodspro2_1.jpg', 'AirPods Pro 2', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440006', 'https://example.com/switcholed_1.jpg', 'Nintendo Switch OLED', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440007', 'https://example.com/ps5_1.jpg', 'PlayStation 5 Console', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440008', 'https://example.com/ipadair5_1.jpg', 'iPad Air 5th Gen', 1, true, NOW()),
          ('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440009', 'https://example.com/galaxytabs9_1.jpg', 'Samsung Galaxy Tab S9', 1, true, NOW())
      `);
    }

    console.log('✅ Data seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    await runMigrations();
    await seedData();
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { runMigrations, seedData, setupDatabase };
