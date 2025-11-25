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

// Sync database with retry logic
const syncDatabase = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Test connection first
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      
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
          await sequelize.sync({ alter: false });
          console.log('✅ Database synced successfully');
        } catch (syncError: any) {
          console.log('⚠️ Sync failed, this might be due to ENUM conflicts.');
          console.log('💡 Attempting to sync with alter mode...');
          try {
            await sequelize.sync({ alter: true });
            console.log('✅ Database synced with alter mode');
          } catch (alterError) {
            console.log('⚠️ Sync with alter also failed. Tables may need manual migration.');
            // Don't throw - allow server to start
            console.log('⚠️ Server will continue, but database may need manual setup');
          }
        }
      }
      
      console.log('✅ Database synchronized successfully');
      return;
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      
      if (error.code === 'ECONNREFUSED' || error.name === 'SequelizeConnectionRefusedError') {
        if (isLastAttempt) {
          console.error('❌ Database connection failed after', retries, 'attempts');
          console.error('❌ Error:', error.message);
          console.log('\n⚠️  Server will start, but database features will not work');
          console.log('🔧 Please ensure:');
          console.log('   1. Database service is running');
          console.log('   2. DATABASE_URL or DB_* environment variables are set correctly');
          console.log('   3. Database is accessible from this host');
          // Don't throw - allow server to start without database
          return;
        } else {
          console.log(`⚠️  Database connection failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
        // Hostname resolution failed (common with Railway's postgres.railway.internal)
        if (isLastAttempt) {
          console.error('❌ Database hostname resolution failed after', retries, 'attempts');
          console.error('❌ Error:', error.message);
          console.log('\n⚠️  Server will start, but database features will not work');
          console.log('🔧 Railway-specific troubleshooting:');
          console.log('   1. Go to your Railway project dashboard');
          console.log('   2. Ensure PostgreSQL service exists and is running');
          console.log('   3. Check that both services are in the SAME Railway project');
          console.log('   4. Verify DATABASE_URL is set in your app service variables');
          console.log('   5. If postgres.railway.internal fails:');
          console.log('      → Go to PostgreSQL service → Connect tab');
          console.log('      → Copy the connection string and set as DATABASE_URL');
          // Don't throw - allow server to start without database
          return;
        } else {
          console.log(`⚠️  Database hostname resolution failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Other database errors
        console.error('❌ Database synchronization failed:', error.message);
        if (isLastAttempt) {
          console.log('⚠️  Server will start, but database features may not work');
          return;
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
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
