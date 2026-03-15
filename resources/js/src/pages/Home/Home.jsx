import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar, FaStarHalfAlt, FaArrowRight, FaHeart, FaRegHeart, FaSearch, FaTimes, FaFilter, FaShippingFast, FaLeaf, FaCertificate } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Footer from '../Footer';
import { buildAssetUrl } from '../../utils/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const getImageUrl = (path) => buildAssetUrl(path);

// Helper Functions
const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return price * (1 - discount / 100);
};

const isProductNew = (createdAtIsoString) => {
    const NEW_ARRIVAL_DAYS = 7;
    if (!createdAtIsoString) return false;
    const now = new Date();
    const productDate = new Date(createdAtIsoString);
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - NEW_ARRIVAL_DAYS);
    return productDate > cutoffDate;
};

// Star Rating Component
const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="half" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`empty-${i}`} />);
    
    return <div className={styles.starRating}>{stars}</div>;
};
StarRating.propTypes = { rating: PropTypes.number };

// Feature Cards Component
const FeatureCards = () => (
    <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
            <motion.div 
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.featureIcon}>
                    <FaShippingFast />
                </div>
                <h3>Fast Delivery</h3>
                <p>Free shipping on 1500 plus shopping over all pakistan</p>
            </motion.div>
            <motion.div 
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className={styles.featureIcon}>
                    <FaLeaf />
                </div>
                <h3>100% Natural</h3>
                <p>Organic & herbal ingredients</p>
            </motion.div>
            <motion.div 
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className={styles.featureIcon}>
                    <FaCertificate />
                </div>
                <h3>Certified Quality</h3>
                <p>Lab tested & verified products</p>
            </motion.div>
        </div>
    </section>
);

// Banner Component
const Banner = ({ banners }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setTimeout(() => {
            setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearTimeout(timer);
    }, [current, banners]);

    if (!banners || banners.length === 0) return null;

    const currentBannerData = banners[current];


    const bannerStyle = {
        '--banner-desktop': currentBannerData ? `url(${getImageUrl(currentBannerData.image_url)})` : 'none',
        '--banner-mobile': currentBannerData ? `url(${getImageUrl(currentBannerData.mobile_image_url)})` : 'none',
    };

    return (
        <section className={styles.bannerSection}>
            <AnimatePresence mode="wait">
                {currentBannerData && (
                    <motion.div
                        key={currentBannerData.banner_id}
                        className={styles.bannerSlide}
                        style={bannerStyle}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.8 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                        <div className={styles.bannerOverlay}></div>
                        <div className={styles.bannerContent}>
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                            >
                                {currentBannerData.title}
                            </motion.h1>
                            <motion.p 
                                initial={{ y: 20, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
                            >
                                {currentBannerData.description}
                            </motion.p>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1, transition: { delay: 0.6 } }}
                            >
                                <Link to="/products" className={styles.ctaButton}>
                                    Shop Now <FaArrowRight />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={styles.bannerDots}>
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${current === index ? styles.active : ''}`}
                        onClick={() => setCurrent(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};
Banner.propTypes = { banners: PropTypes.array.isRequired };

// Product Filters Component
const ProductFilters = ({ activeFilter, setActiveFilter, searchTerm, setSearchTerm, showMobileFilters, setShowMobileFilters }) => (
    <div className={styles.filterWrapper}>
        <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />
            {searchTerm && (
                <FaTimes 
                    className={styles.clearSearch} 
                    onClick={() => setSearchTerm('')}
                />
            )}
        </div>
        
        <button 
            className={styles.mobileFilterToggle}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
            <FaFilter /> Filters
        </button>

        <div className={`${styles.filterContainer} ${showMobileFilters ? styles.showMobileFilters : ''}`}>
            <button
                className={`${styles.filterButton} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('all')}
            >
                All Products
            </button>
            <button
                className={`${styles.filterButton} ${activeFilter === 'new' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('new')}
            >
                New Arrivals
            </button>
            <button
                className={`${styles.filterButton} ${activeFilter === 'sale' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('sale')}
            >
                On Sale
            </button>
            <button
                className={`${styles.filterButton} ${activeFilter === 'popular' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('popular')}
            >
                Most Popular
            </button>
        </div>
    </div>
);

ProductFilters.propTypes = {
    activeFilter: PropTypes.string.isRequired,
    setActiveFilter: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    showMobileFilters: PropTypes.bool.isRequired,
    setShowMobileFilters: PropTypes.func.isRequired,
};

// Product Grid Component
const ProductGrid = ({ products, addToCart, handleOpenReviews, wishlist, toggleWishlist }) => (
    <div className={styles.productsGrid}>
        {products.map((product, i) => {
            const originalPrice = parseFloat(product.selling_price) || 0;
            const discount = parseFloat(product.discount_percent) || 0;
            const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
            const isNew = isProductNew(product.created_at);
            const isWishlisted = wishlist.includes(product.product_id);

            return (
                <motion.div
                    key={product.product_id}
                    className={styles.productCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                    <div className={styles.productImageWrapper}>
                        <Link to={`/products`} className={styles.productImageLink}>
                            <div className={styles.productImageContainer}>
                                <img 
                                    src={getImageUrl(product.image_url)} 
                                    alt={product.title}
                                    className={styles.productImage}
                                />
                                <div className={styles.imageOverlay}>
                                    <span className={styles.quickView}>Quick View</span>
                                </div>
                            </div>
                        </Link>
                        
                        <div className={styles.productBadges}>
                            {isNew && <div className={styles.newBadge}>NEW</div>}
                            {discount > 0 && (
                                <div className={styles.discountBadge}>-{Math.round(discount)}%</div>
                            )}
                        </div>

                        <button 
                            className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                            onClick={() => toggleWishlist(product.product_id)}
                            aria-label="Add to wishlist"
                        >
                            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>

                    <div className={styles.productInfo}>
                        <Link to={`/products`} className={styles.productTitleLink}>
                            <h3 className={styles.productTitle}>{product.title}</h3>
                        </Link>
                    
                        <div className={styles.productReviews}>
                            <StarRating rating={product.avg_review_rating || 0} />
                            <button 
                                onClick={() => handleOpenReviews(product)} 
                                className={styles.reviewsLink}
                            >
                                {product.review_count || 0} reviews
                            </button>
                        </div>

                        <div className={styles.productPrice}>
                            <span className={styles.currentPrice}>
                                Rs. {discountedPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                                <span className={styles.originalPrice}>
                                    Rs. {originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <motion.button
                            onClick={() => addToCart(product)}
                            className={styles.addToCartBtn}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Add to Cart
                        </motion.button>
                    </div>
                </motion.div>
            );
        })}
    </div>
);

ProductGrid.propTypes = {
    products: PropTypes.array.isRequired,
    addToCart: PropTypes.func.isRequired,
    handleOpenReviews: PropTypes.func.isRequired,
    wishlist: PropTypes.array.isRequired,
    toggleWishlist: PropTypes.func.isRequired,
};

// Testimonials Section
const TestimonialsSection = () => {
    const testimonials = [
        {
            id: 1,
            name: "Hanya",
            rating: 5,
            comment: "Amazing quality products! My hairs has never looked better. The herbal oil & shampo are absolutely fantastic.",
            image: "https://placehold.co/80x80/A0AEC0/FFFFFF?text=HS"
        },
        {
            id: 2,
            name: "Bushra",
            rating: 5,
            comment: "Fast delivery and excellent customer service. The oil supplements have really helped with my hair lose.",
            image: "https://placehold.co/80x80/718096/FFFFFF?text=KS"
        },
        {
            id: 3,
            name: "Numan",
            rating: 4,
            comment: "Love the natural ingredients! Been using the herbal oil for a month now and I feel so much more silky hairs.",
            image: "https://placehold.co/80x80/A0AEC0/FFFFFF?text=ER"
        }
    ];

    return (
        <section className={styles.testimonialsSection}>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <div className={styles.testimonialsGrid}>
                {testimonials.map((testimonial, i) => (
                    <motion.div
                        key={testimonial.id}
                        className={styles.testimonialCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className={styles.testimonialHeader}>
                            <img 
                                src={testimonial.image} 
                                alt={testimonial.name}
                                className={styles.testimonialImage}
                            />
                            <div>
                                <h4>{testimonial.name}</h4>
                                <StarRating rating={testimonial.rating} />
                            </div>
                        </div>
                        <p className={styles.testimonialComment}>"{testimonial.comment}"</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

// Main Home Component
export default function Home({ addToCart }) {
    const [wishlist, setWishlist] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviews, setReviews] = useState([]);

    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, categoryRes, productRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/banners`),
                    axios.get(`${API_BASE_URL}/api/categories`),
                    axios.get(`${API_BASE_URL}/api/products`),
                ]);

                setBanners(bannerRes.data.data || bannerRes.data || []);
                setCategories(categoryRes.data.data || categoryRes.data || []);
                setProducts(productRes.data.data || productRes.data || []);
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            }
        };

        fetchData();
    }, []);

    // Wishlist toggle function
    const toggleWishlist = useCallback((productId) => {
        setWishlist(prev => {
            const newWishlist = prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId];
            return newWishlist;
        });
    }, []);

    // Enhanced filtered products with search
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply category filter
        switch (activeFilter) {
            case 'new':
                filtered = filtered.filter(product => isProductNew(product.created_at));
                break;
            case 'sale':
                filtered = filtered.filter(product => parseFloat(product.discount_percent) > 0);
                break;
            case 'popular':
                filtered = filtered.sort((a, b) => 
                    (b.avg_review_rating || 0) - (a.avg_review_rating || 0)
                );
                break;
            default:
                break;
        }

        return filtered;
    }, [products, activeFilter, searchTerm]);

    // Review Modal Logic
    const handleOpenReviews = (product) => {
        setSelectedProduct(product);
        setReviewModalOpen(true);
        // You can fetch real reviews here
        setReviews([]);
    };
    
    const handleCloseReviews = () => {
        setReviewModalOpen(false);
        setSelectedProduct(null);
        setReviews([]);
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    return (
        <motion.div
            className={styles.homeContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {banners.length > 0 && <Banner banners={banners} />}

            <FeatureCards />

            <section className={styles.categoriesSection}>
                <h2 className={styles.sectionTitle}>Shop by Category</h2>
                <div className={styles.categoriesGrid}>
                    {categories.map((category, i) => (
                        <motion.div 
                            key={category.category_id} 
                            onClick={() => handleCategoryClick(category.category_id)}
                            className={styles.categoryCard}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className={styles.categoryImageWrapper}>
                                <img 
                                    src={getImageUrl(category.image_url)} 
                                    alt={category.title}
                                    className={styles.categoryImage}
                                />
                                <div className={styles.categoryOverlay}>
                                    <span className={styles.categoryViewMore}>{category.title}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className={styles.productsSection}>
                <h2 className={styles.sectionTitle}>Featured Products</h2>
                <ProductFilters 
                    activeFilter={activeFilter} 
                    setActiveFilter={setActiveFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showMobileFilters={showMobileFilters}
                    setShowMobileFilters={setShowMobileFilters}
                />
                {filteredProducts.length > 0 ? (
                    <ProductGrid 
                        products={filteredProducts} 
                        addToCart={addToCart} 
                        handleOpenReviews={handleOpenReviews}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                    />
                ) : (
                    <div className={styles.noProducts}>
                        <p>No products found matching your criteria.</p>
                    </div>
                )}
            </section>

            <TestimonialsSection />
            
            {/* Review Modal */}
            <AnimatePresence>
                {isReviewModalOpen && selectedProduct && (
                    <motion.div 
                        className={styles.modalOverlay} 
                        initial={{opacity: 0}} 
                        animate={{opacity: 1}} 
                        exit={{opacity: 0}} 
                        onClick={handleCloseReviews}
                    >
                        <motion.div 
                            className={styles.modalContent} 
                            initial={{y: -50, opacity: 0}} 
                            animate={{y: 0, opacity: 1}} 
                            exit={{y: -50, opacity: 0}} 
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                className={styles.closeModalBtn} 
                                onClick={handleCloseReviews}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </button>
                            
                            <h3 className={styles.modalTitle}>
                                Reviews for {selectedProduct.title}
                            </h3>
                            
                            <div className={styles.reviewsList}>
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.review_id} className={styles.reviewItem}>
                                            <div className={styles.reviewHeader}>
                                                <strong>{review.reviewer_name}</strong>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <p className={styles.reviewComment}>"{review.comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noReviews}>No reviews yet. Be the first!</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className={styles.ownerSection}>
                <div className={styles.ownerCard}>
                    <motion.div
                        className={styles.ownerImageWrapper}
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 120, duration: 0.8 }}
                    >
                        <img 
                            src="/owner.webp" 
                            alt="Yuvraj - Owner"
                            className={styles.ownerImage}
                        />
                    </motion.div>
                    <div className={styles.ownerDetails}>
                        <h2>From the Founder</h2>
                        <h3>Pavraj Singh</h3>
                        <p>"Welcome to Yuvraj Herbal Hub, where ancient wisdom meets modern wellness. We are passionate about providing you with the purest, most effective herbal products to support your journey to a healthier, more balanced life. Every product is crafted with care and a commitment to quality."</p>
                        <div className={styles.ownerSignature}>
                            <span>— Pavraj Singh, Founder</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.articlesSection}>
                <h2 className={styles.sectionTitle}>Ingredients & Insights</h2>
                <div className={styles.articlesGrid}>
                    <motion.div 
                        className={styles.articleCard} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className={styles.articleImageWrapper}>
                            <img 
                                src="/04.webp" 
                                alt="OIL"
                                className={styles.articleImage}
                            />
                            <div className={styles.articleOverlay}></div>
                        </div>
                        <div className={styles.articleContent}>
                            <h4>OUR HERBAL OIL</h4>
                            <p>Learn about the anti-inflammatory benefits of this golden spice and how it can transform your health.</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className={styles.articleCard} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className={styles.articleImageWrapper}>
                            <img 
                                src="/02.webp" 
                                alt="COMBINATION"
                                className={styles.articleImage}
                            />
                            <div className={styles.articleOverlay}></div>
                        </div>
                        <div className={styles.articleContent}>
                            <h4>OIL & SHAMPO</h4>
                            <p>Discover how to use aromatherapy for relaxation, focus, and overall wellbeing.</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className={styles.articleCard} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className={styles.articleImageWrapper}>
                            <img 
                                src="/07.webp" 
                                alt="SHAMPO"
                                className={styles.articleImage}
                            />
                            <div className={styles.articleOverlay}></div>
                        </div>
                        <div className={styles.articleContent}>
                            <h4>SHAMPO</h4>
                            <p>Find the perfect blend to help you unwind and rest peacefully every night.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <motion.div 
                    className={styles.ctaContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Start Your Wellness Journey Today</h2>
                    <p>Join thousands of satisfied customers experiencing the power of natural healing</p>
                    <Link to="/products" className={styles.ctaPrimaryButton}>
                        Explore Our Products <FaArrowRight />
                    </Link>
                </motion.div>
            </section>
            
            <Footer />
        </motion.div>
    );
}

Home.propTypes = {
    addToCart: PropTypes.func.isRequired,
};
