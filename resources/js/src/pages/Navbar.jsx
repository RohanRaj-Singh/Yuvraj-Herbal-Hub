import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from "react-router-dom";
import styles from './nav.module.css';
import { 
  FaShoppingCart, 
  FaTimes, 
  FaTrash, 
  FaTruck, 
  FaBars, 
  FaHome, 
  FaBox,
  FaSpinner,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfo,
  FaMobile
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_BASE_URL || '';
const WHATSAPP_NUMBER = '923313600013';
const FREE_DELIVERY_THRESHOLD = 1500;
const DELIVERY_CHARGE = 250;
const API_TIMEOUT = 15000;

const INITIAL_FORM_STATE = {
  customer_name: '',
  contact_number: '',
  whatsapp_number: '',
  email: '',
  shipping_address: '',
  postal_code: '',
  order_notes: '',
};

export default function Navbar({ cartItems = [], updateQuantity, clearCart, removeFromCart }) {
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderDetails, setOrderDetails] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  const cartCalculations = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (parseFloat(item.price_per_item) * parseInt(item.quantity)), 0
    );
    
    const deliveryCharge = subtotal < FREE_DELIVERY_THRESHOLD && subtotal > 0 ? DELIVERY_CHARGE : 0;
    const total = subtotal + deliveryCharge;
    const itemCount = cartItems.reduce((count, item) => count + parseInt(item.quantity), 0);
    const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    
    return {
      subtotal: subtotal.toFixed(2),
      deliveryCharge: deliveryCharge.toFixed(2),
      total: total.toFixed(2),
      itemCount,
      amountForFreeDelivery: amountForFreeDelivery.toFixed(2),
      hasFreeDelivery: deliveryCharge === 0
    };
  }, [cartItems]);

  const closeAllPanels = useCallback(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  }, []);
  
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
    setIsMenuOpen(false);
    setIsCheckoutOpen(false);
  }, []);

  const handleCheckoutClick = useCallback(() => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [cartItems.length]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRemoveItem = useCallback((productId) => {
    removeFromCart?.(productId);
  }, [removeFromCart]);

  const resetCheckoutForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setPaymentMethod('cod');
    setFeedbackMessage({ type: '', text: '' });
  }, []);

  const generateWhatsAppMessage = useCallback((orderId = null) => {
    let message = `*New Order Request*\n\n`;
    
    if (orderId) {
      message += `Order ID: #${orderId}\n\n`;
    }

    message += `*Customer Details:*\n`;
    message += `Name: ${formData.customer_name}\n`;
    message += `Contact: ${formData.contact_number}\n`;
    
    if (formData.whatsapp_number) {
      message += `WhatsApp: ${formData.whatsapp_number}\n`;
    }
    if (formData.email) {
      message += `Email: ${formData.email}\n`;
    }
    
    message += `\n*Shipping Address:*\n${formData.shipping_address}\n`;
    
    if (formData.postal_code) {
      message += `Postal Code: ${formData.postal_code}\n`;
    }

    if (formData.order_notes) {
      message += `\n*Order Notes:*\n${formData.order_notes}\n`;
    }

    message += `\n*Order Items:*\n`;
    cartItems.forEach(item => {
      const itemTotal = (parseFloat(item.price_per_item) * parseInt(item.quantity)).toFixed(2);
      message += `• ${item.title} (x${item.quantity}) = Rs. ${itemTotal}\n`;
    });
    
    message += `\n*Subtotal: Rs. ${cartCalculations.subtotal}*\n`;
    message += `*Delivery Charges: Rs. ${cartCalculations.deliveryCharge}*${cartCalculations.hasFreeDelivery ? ' (FREE)' : ''}\n`;
    message += `*Total Amount: Rs. ${cartCalculations.total}*\n`;
    message += `\n*Payment Method:* ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}\n`;
    
    if (paymentMethod === 'online') {
      message += `\nI would like to proceed with online payment.`;
    }

    return message;
  }, [formData, cartItems, cartCalculations, paymentMethod]);

  const sendWhatsAppMessage = useCallback((orderId = null) => {
    const message = generateWhatsAppMessage(orderId);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [generateWhatsAppMessage]);

  const validateForm = useCallback(() => {
    if (!formData.customer_name?.trim()) {
      return 'Please enter your full name';
    }
    if (!formData.contact_number?.trim()) {
      return 'Please enter your contact number';
    }
    if (!/^03\d{9}$/.test(formData.contact_number.trim())) {
      return 'Contact number must be in format: 03XXXXXXXXX';
    }
    if (!formData.shipping_address?.trim()) {
      return 'Please enter your shipping address';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }, [formData]);

  const handleSubmitOrder = useCallback(async (e) => {
    e.preventDefault();
   
    setFeedbackMessage({ type: '', text: '' });

    const validationError = validateForm();
    if (validationError) {
      setFeedbackMessage({ type: 'error', text: validationError });
     
      return;
    }

    const paymentStatus = paymentMethod === 'cod' ? 'Unpaid' : 'Pending';
    const orderPayload = {
      customer_name: formData.customer_name.trim(),
      contact_number: formData.contact_number.trim(),
      shipping_address: formData.shipping_address.trim(),
      whatsapp_number: formData.whatsapp_number?.trim() || null,
      email: formData.email?.trim() || null,
      postal_code: formData.postal_code?.trim() || null,
      order_notes: formData.order_notes?.trim() || null,
      subtotal: parseFloat(cartCalculations.subtotal),
      delivery_charges: parseFloat(cartCalculations.deliveryCharge),
      total_amount: parseFloat(cartCalculations.total),
      order_status: 'Pending',
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        price_per_item: parseFloat(item.price_per_item),
      })),
    };

    try {
      const controller = new AbortController();
      setIsLoading(true);
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'Please check your information. ';
        if (errorData.errors) {
          const validationMessages = Object.values(errorData.errors).flat();
          errorMessage += validationMessages.slice(0, 2).join('; ');
        }
        setFeedbackMessage({ type: 'error', text: errorMessage });
       
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      const orderId = result.order_id || result.id;
      
      setOrderDetails({
        orderId: orderId,
        paymentMethod: paymentMethod,
        total: cartCalculations.total,
        customerName: formData.customer_name
      });

      if (paymentMethod === 'online') {
        sendWhatsAppMessage(orderId);
        if (result.payment_url) {
          setTimeout(() => {
            window.location.href = result.payment_url;
          }, 2000);
        }
      }
      
      clearCart();
      closeAllPanels();
      resetCheckoutForm();
      
      setShowThankYou(true);

    } catch (error) {
      console.error('API submission failed:', error);
      
      setFeedbackMessage({ 
        type: 'warning', 
        text: 'Server unavailable. Redirecting to WhatsApp for order confirmation...' 
      });
      
      setTimeout(() => {
        sendWhatsAppMessage();
        clearCart();
        closeAllPanels();
        resetCheckoutForm();
       
        setShowThankYou(true);
      }, 1500);
    }
  }, [
    validateForm, 
    paymentMethod, 
    formData, 
    cartCalculations, 
    cartItems, 
    clearCart, 
    closeAllPanels, 
    resetCheckoutForm,
    sendWhatsAppMessage
  ]);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }, []);

  if (showThankYou) {
    return (
      <div className={styles.thankYouContainer}>
        <div className={styles.thankYouCard}>
          <div className={styles.thankYouIcon}>
            <FaCheckCircle />
          </div>
          <h1 className={styles.thankYouTitle}>Thank You for Your Order!</h1>
          {orderDetails && (
            <>
              <p className={styles.thankYouMessage}>
                Dear <strong>{orderDetails.customerName}</strong>, your order has been placed successfully.
              </p>
              <div className={styles.orderInfo}>
                <p><strong>Order ID:</strong> #{orderDetails.orderId}</p>
                <p><strong>Total Amount:</strong> Rs. {orderDetails.total}</p>
                <p><strong>Payment Method:</strong> {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
              <p className={styles.thankYouNote}>
                You will receive a confirmation message on WhatsApp shortly.
                {orderDetails.paymentMethod === 'online' && ' You will be redirected to the payment page.'}
              </p>
            </>
          )}
          <div className={styles.thankYouButtons}>
            <button 
              className={styles.btnPrimary}
              onClick={() => {
                setShowThankYou(false);
                setOrderDetails(null);
                navigate('/');
              }}
            >
              <FaHome /> Go to Home
            </button>
            <button 
              className={styles.btnSecondary}
              onClick={() => {
                setShowThankYou(false);
                setOrderDetails(null);
                navigate('/products');
              }}
            >
              <FaBox /> Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <Link to="/" className={styles.logoLink}>Yuvraj Herbal Hub</Link>
        </div>
        <ul className={styles.navLinks}>
          <li className={styles.navItem}>
            <Link to='/' className={styles.linkText}>
              <FaHome className={styles.navIcon} /> Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to='/products' className={styles.linkText}>
              <FaBox className={styles.navIcon} /> Products
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to='/about' className={styles.linkText}>
            <FaInfo className={styles.navIcon} />  About
            </Link>
          </li>
           <li className={styles.navItem}>
            <Link to='/contact' className={styles.linkText}>
            
            <FaMobile className={styles.navIcon} /> Contact</Link>
          </li>
          
        </ul>
        <div className={styles.navActions}>
          <button 
            className={styles.cartButton} 
            onClick={toggleCart} 
            aria-label="Open Cart"
          >
            <FaShoppingCart className={styles.icon} />
            {cartCalculations.itemCount > 0 && (
              <span className={styles.cartBadge}>{cartCalculations.itemCount}</span>
            )}
          </button>
          <button 
            className={styles.menuToggle} 
            onClick={toggleMenu} 
            aria-label="Open Menu"
          >
            <FaBars className={styles.icon} />
          </button>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <button className={styles.closeBtn} onClick={toggleMenu}>
          <FaTimes className={styles.icon} />
        </button>
        <ul className={styles.mobileNavList}>
          <li><Link to="/" onClick={toggleMenu}><FaHome /> Home</Link></li>
          <li><Link to="/products" onClick={toggleMenu}><FaBox /> Products</Link></li>
          <li><Link to="/about" onClick={toggleMenu}><FaInfo/> About</Link></li>
          <li><Link to="/contact" onClick={toggleMenu}><FaMobile /> Contact</Link></li>
        </ul>
      </div>

      <div 
        className={`${styles.sidePanelOverlay} ${isCartOpen ? styles.open : ''}`} 
        onClick={toggleCart}
      />
      <div className={`${styles.sidePanel} ${styles.cartPanel} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.panelHeader}>
          <h3>Your Cart ({cartCalculations.itemCount})</h3>
          <button className={styles.closeBtn} onClick={toggleCart}>
            <FaTimes className={styles.icon} />
          </button>
        </div>
        
        <div className={styles.panelBody}>
          {cartItems.length > 0 ? (
            <div className={styles.cartItemsList}>
              {cartItems.map(item => (
                <div key={item.product_id} className={styles.cartItem}>
                  {item.image && (
                    <div className={styles.cartItemImage}>
                      <img src={getImageUrl(item.image)} alt={item.title} />
                    </div>
                  )}
                  <div className={styles.cartItemDetails}>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <p className={styles.cartItemPrice}>Rs. {parseFloat(item.price_per_item).toFixed(2)}</p>
                    <div className={styles.cartItemQuantity}>
                      <button 
                        onClick={() => updateQuantity(item.product_id, parseInt(item.quantity) - 1)}
                        className={styles.quantityBtn}
                        disabled={parseInt(item.quantity) <= 1}
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.product_id, Math.max(1, parseInt(e.target.value) || 1))} 
                        min="1"
                        className={styles.quantityInput}
                      />
                      <button 
                        onClick={() => updateQuantity(item.product_id, parseInt(item.quantity) + 1)}
                        className={styles.quantityBtn}
                      >+</button>
                    </div>
                  </div>
                  <div className={styles.cartItemActions}>
                    <p className={styles.cartItemTotal}>
                      Rs. {(parseFloat(item.price_per_item) * parseInt(item.quantity)).toFixed(2)}
                    </p>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => handleRemoveItem(item.product_id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.cartEmpty}>
              <FaShoppingCart className={styles.emptyCartIcon} />
              <p>Your cart is empty!</p>
              <Link to="/products" onClick={toggleCart} className={styles.btnShopNow}>
                Start Shopping
              </Link>
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className={styles.panelFooter}>
            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>Rs. {cartCalculations.subtotal}</span>
              </div>
              <div className={styles.summaryRow}>
                <span><FaTruck /> Delivery:</span>
                <span className={cartCalculations.hasFreeDelivery ? styles.freeDelivery : ''}>
                  {cartCalculations.hasFreeDelivery ? 'FREE' : `Rs. ${cartCalculations.deliveryCharge}`}
                </span>
              </div>
              {!cartCalculations.hasFreeDelivery && parseFloat(cartCalculations.subtotal) > 0 && (
                <div className={styles.deliveryNote}>
                  Add Rs. {cartCalculations.amountForFreeDelivery} for FREE delivery!
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span className={styles.totalValue}>Rs. {cartCalculations.total}</span>
              </div>
            </div>
            <button 
              className={styles.btnCheckout} 
              onClick={handleCheckoutClick}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <div 
        className={`${styles.sidePanelOverlay} ${isCheckoutOpen ? styles.open : ''}`} 
        onClick={() => setIsCheckoutOpen(false)}
      />
      <div className={`${styles.sidePanel} ${styles.checkoutPanel} ${isCheckoutOpen ? styles.open : ''}`}>
        <div className={styles.panelHeader}>
          <h3>Checkout</h3>
          <button className={styles.closeBtn} onClick={() => setIsCheckoutOpen(false)}>
            <FaTimes className={styles.icon} />
          </button>
        </div>
        
        <div className={styles.panelBody}>
          <form onSubmit={handleSubmitOrder} className={styles.checkoutForm}>
            
            <h4 className={styles.formSectionTitle}>Customer Details</h4>
            <div className={styles.formGroup}>
              <label htmlFor="customer_name">Full Name *</label>
              <input 
                type="text" 
                id="customer_name" 
                name="customer_name" 
                value={formData.customer_name} 
                onChange={handleInputChange} 
                required 
                className={styles.formInput}
                placeholder="Enter your full name"
               
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="contact_number">Contact Number *</label>
              <input 
                type="tel" 
                id="contact_number" 
                name="contact_number" 
                value={formData.contact_number} 
                onChange={handleInputChange} 
                required 
                className={styles.formInput}
                placeholder="03XXXXXXXXX"
               
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="whatsapp_number">WhatsApp (Optional)</label>
              <input 
                type="tel" 
                id="whatsapp_number" 
                name="whatsapp_number" 
                value={formData.whatsapp_number} 
                onChange={handleInputChange} 
                className={styles.formInput}
                placeholder="03XXXXXXXXX"
               
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email (Optional)</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className={styles.formInput}
                placeholder="your@email.com"
               
              />
            </div>

            <h4 className={styles.formSectionTitle}>Shipping Information</h4>
            <div className={styles.formGroup}>
              <label htmlFor="shipping_address">Shipping Address *</label>
              <textarea 
                id="shipping_address" 
                name="shipping_address" 
                value={formData.shipping_address} 
                onChange={handleInputChange} 
                required 
                className={styles.textareaField}
                rows="3" 
                placeholder="House#, Street, Area, City"
               
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="postal_code">Postal Code (Optional)</label>
              <input 
                type="text" 
                id="postal_code" 
                name="postal_code" 
                value={formData.postal_code} 
                onChange={handleInputChange} 
                className={styles.formInput}
                placeholder="Enter postal code"
               
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="order_notes">Order Notes (Optional)</label>
              <textarea 
                id="order_notes" 
                name="order_notes" 
                value={formData.order_notes} 
                onChange={handleInputChange} 
                className={styles.textareaField}
                rows="2" 
                placeholder="Any special instructions?"
               
              />
            </div>

            <div className={styles.orderSummaryCheckout}>
              <h4 className={styles.formSectionTitle}>Order Summary</h4>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>Rs. {cartCalculations.subtotal}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery:</span>
                <span className={cartCalculations.hasFreeDelivery ? styles.freeDelivery : ''}>
                  {cartCalculations.hasFreeDelivery ? 'FREE' : `Rs. ${cartCalculations.deliveryCharge}`}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span className={styles.totalValue}>Rs. {cartCalculations.total}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <h4 className={styles.formSectionTitle}>Payment Method</h4>
              <div className={styles.paymentOptions}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                   
                  />
                  <span>💰 Cash on Delivery</span>
                </label>

                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="online" 
                    checked={paymentMethod === 'online'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                   
                  />
                  <span><FaCreditCard /> Online Payment</span>
                </label>
              </div>
            </div>

            {feedbackMessage.text && (
              <div className={`${styles.feedbackMessage} ${styles[feedbackMessage.type]}`}>
                {feedbackMessage.type === 'success' && <FaCheckCircle />}
                {feedbackMessage.type === 'error' && <FaExclamationTriangle />}
                {feedbackMessage.type === 'warning' && <FaExclamationTriangle />}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <div className={styles.checkoutFooter}>
              <button 
                type="submit" 
                className={styles.btnConfirmOrder} 
                disabled={isLoading || cartItems.length === 0}
                
              >
                {isLoading ? (
                  <>
                    <FaSpinner className={styles.spinnerIcon} /> 
                    Processing...
                  </>
                ) : (
                  'Confirm Order'
                )}
              </button>
              <p className={styles.checkoutNote}>
                You'll receive confirmation via WhatsApp
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  cartItems: PropTypes.array.isRequired,
  updateQuantity: PropTypes.func.isRequired,
  clearCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func,
};