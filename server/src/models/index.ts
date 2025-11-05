import sequelize from '../config/database';
import User from './User';
import Product from './Product';
import ProductImage from './ProductImage';
import CartItem from './CartItem';
import Order from './Order';
import OrderItem from './OrderItem';
import Warranty from './Warranty';
import Claim from './Claim';
import PasswordResetToken from './PasswordResetToken';
import Membership from './Membership';

// Define associations
// User associations
User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Warranty, { foreignKey: 'user_id', as: 'warranties' });
User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });

// Product associations (no category relationship - using simple string category)
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(Warranty, { foreignKey: 'product_id', as: 'warranties' });

// ProductImage associations
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// CartItem associations
CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'orderItems' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Warranty associations
Warranty.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Warranty.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Warranty.hasMany(Claim, { foreignKey: 'warranty_id', as: 'claims' });

// Claim associations
Claim.belongsTo(Warranty, { foreignKey: 'warranty_id', as: 'warranty' });

// PasswordResetToken associations
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Sync database
const syncDatabase = async () => {
  try {
    // Check if database exists
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (results.length === 0) {
      // Database doesn't exist, create it fresh
      console.log('🔄 Creating fresh database...');
      await sequelize.sync({ force: true });
    } else {
      // Database exists, but we need to handle ENUM conflicts
      console.log('🔄 Database exists, checking for ENUM conflicts...');
      
      try {
        // Try to sync without altering first
        await sequelize.sync();
        console.log('✅ Database synced successfully');
      } catch (syncError) {
        console.log('⚠️ Sync failed, this might be due to ENUM conflicts.');
        console.log('💡 Please run: npm run db:reset to reset the database');
        console.log('   Or manually drop and recreate the database');
        throw syncError;
      }
    }
    
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Run: npm run db:reset (if available)');
    console.log('2. Or manually drop and recreate the database');
    console.log('3. Or run: node src/utils/setupDatabase.js');
    throw error;
  }
};

export {
  User,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem,
  Warranty,
  Claim,
  PasswordResetToken,
  Membership,
  syncDatabase,
};
