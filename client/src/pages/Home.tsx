import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, getProductImageUrl } from '../utils/helpers';
import { RootState } from '../redux/store';
import { fetchFeaturedProductsStart } from '../redux/slices/productSlice';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { featuredProducts, isLoading } = useSelector((state: RootState) => state.products);
  const isAdmin = useSelector((state: RootState) => state.auth.user?.role === 'admin');

  useEffect(() => {
    dispatch(fetchFeaturedProductsStart());
  }, [dispatch]);


  return (
    <div className="min-h-screen">
      {/* Hero Section - Apple Style */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white"
      >
        <div className="max-w-7xl mx-auto px-8 py-32 md:py-48">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-light tracking-tight">
              Power meets
            </h1>
            <h2 className="text-6xl md:text-8xl font-light tracking-tight text-blue-400">
              precision.
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mt-8">
              Discover products engineered with perfection. Minimal design. Maximum performance.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12"
            >
              <Link
                to="/products"
                className="inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all duration-300"
              >
                Explore Products
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </motion.section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Curated selection of premium products
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {featuredProducts.map((product) => {
              const imageUrl = getProductImageUrl(product);
              return (
                <motion.div
                  key={product.product_id}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link to={`/products/${product.product_id}`}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
                      <div className="relative bg-gray-50 h-80 overflow-hidden">
                        {imageUrl ? (
                          <img
                            alt={product.name}
                            src={imageUrl}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              console.error('Image load error:', imageUrl);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400">No Image</span></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-medium mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-2xl font-light text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {isAdmin && (
                            <span className="text-xs text-gray-400">
                              {`${product.stock || 0} in stock`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Features Section - Apple Style */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-32 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-light mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your orders delivered quickly and safely to your doorstep.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-light mb-3">Secure Payment</h3>
              <p className="text-gray-600">
                Your payment information is protected with industry-standard security.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-2xl font-light mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is always here to help you.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
