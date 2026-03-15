import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Star, X, Shield, Truck, ChevronLeft, ChevronRight, Heart, Eye, Filter, SlidersHorizontal, TrendingUp, Sparkles } from 'lucide-react';
import style from './products.module.css';
import Footer from '../Footer';
import PremiumLoader from '../../components/ui/PremiumLoader';
import { buildAssetUrl } from '../../utils/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const getImageUrl = (path) => buildAssetUrl(path);
// --- StarRating Component ---
const StarRating = ({ rating = 0, size = 'sm', interactive = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const totalStars = 5;
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const sizeClass = {
    sm: style.starSizeSm,
    md: style.starSizeMd,
    lg: style.starSizeLg
  }[size];

  return (
    <div className={`${style.starContainer} ${sizeClass}`}>
      {[...Array(totalStars)].map((_, index) => (
        <motion.span
          key={index}
          whileHover={interactive ? { scale: 1.2 } : {}}
          onMouseEnter={() => interactive && setHoverRating(index + 1)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(index + 1)}
          className={`${style.star} ${index < Math.round(displayRating) ? style.starFilled : style.starEmpty} ${interactive ? style.starInteractive : ''}`}
        >
          <Star
            fill={index < Math.round(displayRating) ? 'currentColor' : 'none'}
            size={size === 'sm' ? 14 : size === 'md' ? 18 : 24}
          />
        </motion.span>
      ))}
    </div>
  );
};

// --- Enhanced ProductCard Component ---
const ProductCard = ({ product, onAddToCart, onViewProduct, index, isFavorited, onToggleFavorite }) => {
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = product.discount_percent > 0;
  
  const discountedPrice = hasDiscount
    ? (product.selling_price * (1 - product.discount_percent / 100)).toFixed(2)
    : product.selling_price.toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={style.productCard}
    >
      <div className={style.productCardImageWrapper}>
        <div 
          className={style.productImageContainer} 
          onClick={() => onViewProduct(product)}
        >
          <motion.img
            src={getImageUrl(product.image_url)}
            alt={product.title}
            className={style.productImage}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              className={style.productDiscountBadge}
            >
              <span className={style.discountText}>-{product.discount_percent}%</span>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.product_id);
            }}
            className={style.favoriteBtn}
          >
            <Heart 
              size={18} 
              fill={isFavorited ? 'currentColor' : 'none'}
              className={isFavorited ? style.favoriteBtnActive : ''}
            />
          </motion.button>
          <div className={style.productCardOverlay}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewProduct(product);
              }}
              className={style.quickViewBtn}
            >
              <Eye size={18} />
              <span>Quick View</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className={style.productCardContent}>
        <h3 className={style.productCardTitle} onClick={() => onViewProduct(product)}>
          {product.title}
        </h3>
        <p className={style.productCardDescription}>{product.description}</p>

        <div className={style.productCardRating}>
          <StarRating rating={product.avg_review_rating} size="sm" /> 
          <span className={style.productCardRatingText}>
            {product.avg_review_rating?.toFixed(1) || '0.0'}
          </span>
        </div>

        <div className={style.productCardPricing}>
          <div className={style.productCardPriceGroup}>
            <span className={style.productCardPrice}>
              Rs. {Number(discountedPrice ?? 0).toFixed(2)}
            </span>

            {hasDiscount && product?.selling_price != null && (
              <span className={style.productCardOriginalPrice}>
                Rs. {Number(product.selling_price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className={style.productCardFooter}>
          <div className={style.productCardQuantity}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={style.quantityBtn}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className={style.quantityInputField}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className={style.quantityBtn}
            >
              +
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddToCart(product, quantity)}
            className={style.productCardAddBtn}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={18} />
            <span className={style.addToCartText}>Add</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Products Component ---
export default function Products({ addToCart }) {
  const navigate = useNavigate();
  
  // API Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyDiscounts, setShowOnlyDiscounts] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/categories`),
        ]);

        setProducts(productsRes.data.data || productsRes.data || []);
        setCategories(categoriesRes.data.data || categoriesRes.data || []);
      } catch (err) {
        console.error("Error fetching products data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle navigation to product detail page
  const handleViewProduct = (product) => {
    navigate(`/products/${product.product_id}`);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products].filter(product => {
      const categoryMatch = selectedCategory === 'all' || product.category_id.toString() === selectedCategory;
      const searchMatch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const discountedPrice = product.discount_percent > 0
        ? (product.selling_price * (1 - product.discount_percent / 100))
        : product.selling_price;
      const priceMatch = discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
      const ratingMatch = (product.avg_review_rating || 0) >= minRating;
      const discountMatch = !showOnlyDiscounts || product.discount_percent > 0;
      
      return categoryMatch && searchMatch && priceMatch && ratingMatch && discountMatch;
    });

    // Sorting
    switch(sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.discount_percent > 0 ? a.selling_price * (1 - a.discount_percent / 100) : a.selling_price;
          const priceB = b.discount_percent > 0 ? b.selling_price * (1 - b.discount_percent / 100) : b.selling_price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.discount_percent > 0 ? a.selling_price * (1 - a.discount_percent / 100) : a.selling_price;
          const priceB = b.discount_percent > 0 ? b.selling_price * (1 - b.discount_percent / 100) : b.selling_price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => (b.avg_review_rating || 0) - (a.avg_review_rating || 0));
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, minRating, sortBy, showOnlyDiscounts]);

  const handleCategoryScroll = (direction) => {
    const container = document.getElementById('categoryContainer');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, categoryScrollPosition - scrollAmount)
        : categoryScrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setCategoryScrollPosition(newPosition);
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setMinRating(0);
    setShowOnlyDiscounts(false);
    setSortBy('featured');
    setSelectedCategory('all');
    setSearchTerm('');
  };

  // Loading State
  if (loading) {
    return (
      <PremiumLoader title="Loading premium products" subtitle="Curating your best picks" />
    );
  }

  // Error State
  if (error) {
    return (
      <div className={style.pageWrapper}>
        <div className={style.errorContainer}>
          <X size={64} className={style.errorIcon} />
          <h2 className={style.errorTitle}>Oops! Something went wrong</h2>
          <p className={style.errorMessage}>{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className={style.errorRetryBtn}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageWrapper}>
      {/* Hero Banner Section */}
      <section className={style.heroBannerSection}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={style.heroBannerContainer}
        >
          <div className={style.heroBannerContent}>
            <div className={style.heroBannerText}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={style.heroBannerBadge}
              >
                <Sparkles size={16} />
                <span>Nourish Hair, Naturally Beautiful</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={style.heroBannerTitle}
              >
                Yuvraj Herbal Hub
                <span className={style.heroBannerTitleAccent}> Redefined</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={style.heroBannerSubtitle}
              >
                Exclusive products curated for those who appreciate excellence
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className={style.heroBannerStats}
              >
                <div className={style.heroBannerStat}>
                  <span className={style.statNumber}>{products.length}+</span>
                  <span className={style.statLabel}>Premium Products</span>
                </div>
                <div className={style.heroBannerStat}>
                  <span className={style.statNumber}>{categories.length}+</span>
                  <span className={style.statLabel}>Categories</span>
                </div>
                <div className={style.heroBannerStat}>
                  <span className={style.statNumber}>
                    {products.filter(p => p.discount_percent > 0).length}+
                  </span>
                  <span className={style.statLabel}>Special Offers</span>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={style.heroBannerImage}
            >
              <div className={style.heroBannerImageGlow}></div>
              <TrendingUp size={120} className={style.heroBannerIcon} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Search Bar Section */}
      <section className={style.searchSection}>
        <div className={style.searchContainer}>
          <div className={style.searchWrapper}>
            <Search className={style.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search for premium products..."
              className={style.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchTerm('')}
                className={style.searchClearBtn}
              >
                <X size={18} />
              </motion.button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`${style.filterToggleBtn} ${showFilters ? style.filterToggleBtnActive : ''}`}
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </motion.button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={style.filtersPanel}
            >
              <div className={style.filtersPanelContent}>
                <div className={style.filterGroup}>
                  <label className={style.filterLabel}>
                    <Filter size={16} />
                    <span>Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={style.filterSelect}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Best Deals</option>
                  </select>
                </div>

                <div className={style.filterGroup}>
                  <label className={style.filterLabel}>
                    <span>Price Range: {priceRange[0]} to {priceRange[1]}</span>
                  </label>
                  <div className={style.priceRangeInputs}>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])}
                      className={style.priceInput}
                      placeholder="Min"
                    />
                    <span className={style.priceRangeSeparator}>to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.min(10000, parseInt(e.target.value) || 10000)])}
                      className={style.priceInput}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className={style.filterGroup}>
                  <label className={style.filterLabel}>
                    <Star size={16} />
                    <span>Minimum Rating</span>
                  </label>
                  <div className={style.ratingFilter}>
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <motion.button
                        key={rating}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMinRating(rating)}
                        className={`${style.ratingFilterBtn} ${minRating === rating ? style.ratingFilterBtnActive : ''}`}
                      >
                        {rating === 0 ? 'All' : `${rating}+ ★`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className={style.filterGroup}>
                  <label className={style.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={showOnlyDiscounts}
                      onChange={(e) => setShowOnlyDiscounts(e.target.checked)}
                      className={style.filterCheckboxInput}
                    />
                    <span className={style.filterCheckboxLabel}>
                      Show only products with discounts
                    </span>
                  </label>
                </div>

                <div className={style.filterActions}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className={style.filterClearBtn}
                  >
                    Clear All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(false)}
                    className={style.filterApplyBtn}
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Categories Section */}
      <section className={style.categoriesSection}>
        <div className={style.categoriesContainer}>
          <div className={style.categoriesHeader}>
            <h2 className={style.categoriesTitle}>Shop by Category</h2>
            <p className={style.categoriesSubtitle}>Discover our curated collections</p>
          </div>
          
          <div className={style.categoriesSliderWrapper}>
            <button
              onClick={() => handleCategoryScroll('left')}
              className={style.categoryScrollBtn}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className={style.categoriesSlider} id="categoryContainer">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('all')}
                className={`${style.categoryItem} ${selectedCategory === 'all' ? style.categoryItemActive : ''}`}
              >
                <div className={style.categoryContent}>
                  <span className={style.categoryName}>All Products</span>
                  <span className={style.categoryCount}>{products.length} items</span>
                </div>
              </motion.div>

              {categories.map((category) => {
                const categoryProducts = products.filter(p => p.category_id === category.category_id);
                return (
                  <motion.div
                    key={category.category_id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.category_id.toString())}
                    className={`${style.categoryItem} ${selectedCategory === category.category_id.toString() ? style.categoryItemActive : ''}`}
                  >
                    <div className={style.categoryContent}>
                      <span className={style.categoryName}>{category.title}</span>
                      <span className={style.categoryCount}>{categoryProducts.length} items</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={() => handleCategoryScroll('right')}
              className={style.categoryScrollBtn}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={style.productsSection}>
        <div className={style.productsContainer}>
          <div className={style.productsHeader}>
            <div>
              <h2 className={style.productsTitle}>
                {selectedCategory === 'all' 
                  ? 'Premium Collection' 
                  : categories.find(c => c.category_id.toString() === selectedCategory)?.title || 'Products'}
              </h2>
              <p className={style.productsCount}>{filteredProducts.length} exceptional items</p>
            </div>
            {favorites.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={style.favoritesBtn}
              >
                <Heart size={18} fill="currentColor" />
                <span>{favorites.length} Favorites</span>
              </motion.button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <motion.div layout className={style.productsGrid}>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAddToCart={addToCart}
                    onViewProduct={handleViewProduct}
                    index={index}
                    isFavorited={favorites.includes(product.product_id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={style.noProductsContainer}
            >
              <Search size={64} className={style.noProductsIcon} />
              <p className={style.noProductsMessage}>No products found matching your criteria.</p>
              <p className={style.noProductsSubtext}>Try adjusting your filters or search terms</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className={style.noProductsClearBtn}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer/>
    </div>
  );
}
