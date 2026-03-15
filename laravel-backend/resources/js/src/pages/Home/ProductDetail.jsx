import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Shield, Truck, ArrowLeft, Heart, X, Sparkles } from 'lucide-react';
import style from './detail.module.css';
import Footer from '../Footer';
import PremiumLoader from '../../components/ui/PremiumLoader';
import { useNotifications } from '../../components/notifications/NotificationProvider';
import { buildAssetUrl } from '../../utils/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const getImageUrl = (path) => buildAssetUrl(path);

// StarRating Component
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

export default function ProductDetail({ addToCart }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotifications();
  
  // API Data States
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ reviewer_name: '', comment: '', rating: 5 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product details and reviews from API
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productRes = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
        const productData = productRes.data.data || productRes.data;
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        setProduct(productData);

        // Fetch reviews for this product
        try {
          const reviewsRes = await axios.get(`${API_BASE_URL}/api/products/${productId}/reviews`);
          setReviews(reviewsRes.data.data || reviewsRes.data || []);
        } catch (reviewError) {
          console.warn('Reviews not available:', reviewError);
          setReviews([]);
        }

        // Scroll to top when product loads
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Error fetching product data:", err);
        if (err.response?.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const handleReviewSubmit = async () => {
    if (!newReview.reviewer_name || !newReview.comment) {
      notifyError('Missing details', 'Please fill in your name and comment.');
      return;
    }

    try {
      setSubmittingReview(true);

      const reviewData = {
        product_id: parseInt(productId),
        reviewer_name: newReview.reviewer_name,
        rating: newReview.rating,
        comment: newReview.comment,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/review`,
        reviewData
      );

      const submittedReview = response.data.data || response.data;
      
      // Ensure the review has all required fields
      const reviewWithDefaults = {
        ...submittedReview,
        review_id: submittedReview.review_id || Date.now(),
        created_at: submittedReview.created_at || new Date().toISOString(),
        reviewer_name: submittedReview.reviewer_name || newReview.reviewer_name,
        rating: submittedReview.rating || newReview.rating,
        comment: submittedReview.comment || newReview.comment
      };
      
      // Add the new review to the list
      setReviews([reviewWithDefaults, ...reviews]);
      
      // Reset form
      setNewReview({ reviewer_name: "", comment: "", rating: 5 });
      setShowReviewForm(false);
      
      // Update product rating if available
      if (product) {
        const newReviewCount = (product.review_count || reviews.length) + 1;
        const currentTotal = (product.avg_review_rating || 0) * (product.review_count || reviews.length);
        const newAvgRating = (currentTotal + newReview.rating) / newReviewCount;
        
        setProduct({
          ...product,
          review_count: newReviewCount,
          avg_review_rating: newAvgRating
        });
      }
      
      success('Review submitted', 'Thanks for sharing your experience.');
    } catch (err) {
      console.error("Error submitting review:", err);
      notifyError('Submission failed', 'Please try again in a moment.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <PremiumLoader title="Loading product" subtitle="Preparing the details for you" />
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className={style.pageWrapper}>
        <div className={style.errorContainer}>
          <X size={64} className={style.errorIcon} />
          <h2 className={style.errorTitle}>{error || "Product not found"}</h2>
          <p className={style.errorMessage}>
            {error === "Product not found" 
              ? "The product you're looking for doesn't exist or has been removed."
              : "We couldn't load the product details. Please try again."}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className={style.errorRetryBtn}
          >
            Back to Products
          </motion.button>
        </div>
      </div>
    );
  }

  const hasDiscount = Number(product.discount_percent) > 0;
  const sellingPrice = Number(product.selling_price) || 0;
  const discountPercent = Number(product.discount_percent) || 0;
  const discountedPrice = hasDiscount
    ? (sellingPrice * (1 - discountPercent / 100)).toFixed(2)
    : sellingPrice.toFixed(2);

  return (
    <div className={style.pageWrapper}>
      {/* Back Button */}
      <div className={style.productDetailHeader}>
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/products')}
          className={style.backButton}
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </motion.button>
      </div>

      {/* Product Detail Section */}
      <section className={style.productDetailSection}>
        <div className={style.productDetailContainer}>
          <div className={style.productDetailGrid}>
            {/* Left: Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={style.productDetailImageSection}
            >
              <div className={style.productDetailImageWrapper}>
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.title}
                  className={style.productDetailImage}
                />
                {hasDiscount && (
                  <div className={style.productDetailDiscountBadge}>
                    <span className={style.discountPercent}>{product.discount_percent}%</span>
                    <span className={style.discountLabel}>OFF</span>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={style.productDetailFavoriteBtn}
                >
                  <Heart 
                    size={24} 
                    fill={isFavorite ? 'currentColor' : 'none'}
                    className={isFavorite ? style.favoriteBtnActive : ''}
                  />
                </motion.button>
              </div>
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={style.productDetailInfoSection}
            >
              <h1 className={style.productDetailTitle}>{product.title}</h1>
              
              <div className={style.productDetailRating}>
                <StarRating rating={product.avg_review_rating || 0} size="md" />
                <span className={style.ratingText}>
                  {(product.avg_review_rating || 0).toFixed(1)}
                </span>
                <span className={style.ratingCount}>
                  ({product.review_count || reviews.length} reviews)
                </span>
              </div>

              <div className={style.productDetailPriceSection}>
                <span className={style.currentPrice}>Rs. {discountedPrice}</span>
                {hasDiscount && (
                  <>
                    <span className={style.originalPrice}>Rs. {sellingPrice.toFixed(2)}</span>
                    <span className={style.savings}>
                      Save Rs. {(sellingPrice - parseFloat(discountedPrice)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              <p className={style.productDetailDescription}>
                {product.description || 'No description available'}
              </p>

              <div className={style.productDetailQuantitySection}>
                <label className={style.quantityLabel}>Quantity:</label>
                <div className={style.quantityControls}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={style.quantityBtn}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className={style.quantityInput}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={style.quantityBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addToCart(product, quantity);
                }}
                className={style.addToCartBtnLarge}
              >
                <ShoppingCart size={20} />
                <span>Add to Cart - Rs. {(parseFloat(discountedPrice) * quantity).toFixed(2)}</span>
              </motion.button>

              <div className={style.productDetailFeatures}>
                <div className={style.featureItem}>
                  <Truck size={20} />
                  <div>
                    <span className={style.featureTitle}>Free Shipping</span>
                    <span className={style.featureDesc}>On orders over Rs. 1500</span>
                  </div>
                </div>
                <div className={style.featureItem}>
                  <Shield size={20} />
                  <div>
                    <span className={style.featureTitle}>Secure Payment</span>
                    <span className={style.featureDesc}>100% secure transaction</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={style.productDetailReviewsSection}
          >
            <div className={style.reviewsHeader}>
              <h2 className={style.reviewsTitle}>Customer Reviews</h2>
              <div className={style.reviewSummary}>
                <span className={style.reviewScore}>
                  {(product.avg_review_rating || 0).toFixed(1)}
                </span>
                <StarRating rating={product.avg_review_rating || 0} size="md" />
                <span className={style.reviewCount}>
                  Based on {reviews.length} reviews
                </span>
              </div>
            </div>

            {!showReviewForm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReviewForm(true)}
                className={style.writeReviewBtn}
              >
                <Star size={18} />
                <span>Write a Review</span>
              </motion.button>
            )}

            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={style.reviewForm}
              >
                <div className={style.reviewFormHeader}>
                  <h3>Write Your Review</h3>
                  <button 
                    onClick={() => setShowReviewForm(false)} 
                    className={style.reviewFormClose}
                    disabled={submittingReview}
                  >
                    <X size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newReview.reviewer_name}
                  onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                  className={style.reviewInput}
                  disabled={submittingReview}
                />
                <textarea
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className={style.reviewTextarea}
                  rows="4"
                  disabled={submittingReview}
                />
                <div className={style.reviewRating}>
                  <span>Your Rating:</span>
                  <StarRating
                    rating={newReview.rating}
                    size="lg"
                    interactive={!submittingReview}
                    onRate={(rating) => setNewReview({ ...newReview, rating })}
                  />
                </div>
                <div className={style.reviewFormActions}>
                  <button 
                    onClick={() => setShowReviewForm(false)} 
                    className={style.cancelBtn}
                    disabled={submittingReview}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReviewSubmit} 
                    className={style.submitBtn}
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </motion.div>
            )}

            <div className={style.reviewsList}>
              {reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={review.review_id}
                    className={style.reviewItem}
                  >
                    <div className={style.reviewHeader}>
                      <div className={style.reviewerInfo}>
                        <div className={style.reviewerAvatar}>
                          {review.reviewer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className={style.reviewerName}>{review.reviewer_name}</span>
                          <span className={style.reviewDate}>
                            {new Date(review.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className={style.reviewText}>{review.comment}</p>
                  </motion.div>
                ))
              ) : (
                <div className={style.noReviews}>
                  <Star size={48} />
                  <p>No reviews yet</p>
                  <span>Be the first to share your experience!</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
