import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./nav.module.css";
import { useNotifications } from "../components/notifications/NotificationProvider";
import {
  FaShoppingCart,
  FaTimes,
  FaTrash,
  FaTruck,
  FaBars,
  FaHome,
  FaBox,
  FaCreditCard,
  FaPhoneAlt,
  FaQuestionCircle,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function Navbar({
  cartItems = [],
  updateQuantity,
  clearCart,
  removeFromCart,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: notifyError, warning, info } = useNotifications();

  const [formData, setFormData] = useState({
    customer_name: "",
    contact_number: "",
    whatsapp_number: "",
    email: "",
    shipping_address: "",
    postal_code: "",
    order_notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.price_per_item) * parseInt(item.quantity),
    0
  );
  const deliveryCharge = subtotal < 1500 && subtotal > 0 ? 250 : 0;
  const cartTotal = (subtotal + deliveryCharge).toFixed(2);
  const cartItemCount = cartItems.reduce((count, item) => count + parseInt(item.quantity), 0);
  const deliveryNoteAmount = (1500 - subtotal).toFixed(2);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
    if (isCheckoutOpen) setIsCheckoutOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isCheckoutOpen) setIsCheckoutOpen(false);
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveItem = (productId) => {
    if (removeFromCart) {
      removeFromCart(productId);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath;
  };

  /** 🔹 Generate WhatsApp message (used for online payments) */
  const generateWhatsAppMessage = () => {
    let message = `*New Order Request (Online Payment)*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${formData.customer_name}\n`;
    message += `Contact: ${formData.contact_number}\n`;
    if (formData.whatsapp_number) message += `WhatsApp: ${formData.whatsapp_number}\n`;
    if (formData.email) message += `Email: ${formData.email}\n`;
    message += `\n*Address:*\n${formData.shipping_address}\n`;
    if (formData.postal_code) message += `Postal Code: ${formData.postal_code}\n`;

    message += `\n*Order Items:*\n`;
    cartItems.forEach((item) => {
      message += `• ${item.title} (x${item.quantity}) = Rs. ${(item.price_per_item * item.quantity).toFixed(2)}\n`;
    });
    message += `\nSubtotal: Rs. ${subtotal.toFixed(2)}\nDelivery: Rs. ${deliveryCharge.toFixed(2)}\n`;
    message += `*Total: Rs. ${cartTotal}*\n`;
    message += `\nPayment Method: Online Payment 💳`;
    return message;
  };

  /** 🔹 Handle order submission */
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.contact_number || !formData.shipping_address) {
      warning("Missing details", "Please fill all required fields (Name, Contact, Address).");
      return;
    }

    if (cartItems.length === 0) {
      warning("Cart is empty", "Please add items before checking out.");
      return;
    }

    // 🔸 If online payment → go to WhatsApp
    if (paymentMethod === "online") {
      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/923245258505?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      clearCart();
      setIsCheckoutOpen(false);
      info("WhatsApp opened", "Complete your payment in WhatsApp.");
      navigate("/");
      return;
    }

    // 🔸 Otherwise (COD) → send to backend
    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer_name: formData.customer_name,
        contact_number: formData.contact_number,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        shipping_address: formData.shipping_address,
        postal_code: formData.postal_code,
        total_amount: cartTotal,
        order_status: "Pending",
        payment_status: "Unpaid",
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_per_item: item.price_per_item,
        })),
      };

      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderPayload);

      if (response.status === 201 || response.status === 200) {
        success("Order placed", "We will contact you shortly to confirm.");
        clearCart();
        setIsCheckoutOpen(false);
        navigate("/");
      } else {
        warning("Order not placed", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      notifyError("Order failed", "Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <Link to="/" className={styles.logoLink}>Yuvraj Herbal Hub</Link>
        </div>
        <ul className={styles.navLinks}>
          <li><Link to="/" className={styles.linkText}><FaHome /> Home</Link></li>
          <li><Link to="/products" className={styles.linkText}><FaBox /> Products</Link></li>
          <li><Link to="/about" className={styles.linkText}><FaQuestionCircle /> About</Link></li>
          <li><Link to="/contact" className={styles.linkText}><FaPhoneAlt /> Contact</Link></li>
        </ul>
        <div className={styles.navActions}>
          <button className={styles.cartButton} onClick={toggleCart}>
            <FaShoppingCart />
            {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
          </button>
          <button className={styles.menuToggle} onClick={toggleMenu}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* 🟢 Cart Panel */}
      <div className={`${styles.sidePanelOverlay} ${isCartOpen ? styles.open : ""}`} onClick={toggleCart}></div>
      <div className={`${styles.sidePanel} ${styles.cartPanel} ${isCartOpen ? styles.open : ""}`}>
        <div className={styles.panelHeader}>
          <h3>Your Cart ({cartItemCount})</h3>
          <button onClick={toggleCart}><FaTimes /></button>
        </div>
        <div className={styles.panelBody}>
          {cartItems.length > 0 ? (
            <div className={styles.cartItemsList}>
              {cartItems.map((item) => (
                <div key={item.product_id} className={styles.cartItem}>
                  {item.image && <img src={getImageUrl(item.image)} alt={item.title} />}
                  <div>
                    <h4>{item.title}</h4>
                    <p>Rs. {parseFloat(item.price_per_item).toFixed(2)}</p>
                    <div className={styles.cartItemQuantity}>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product_id, parseInt(e.target.value) || 1)
                        }
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div>
                    <p>Total: Rs. {(item.price_per_item * item.quantity).toFixed(2)}</p>
                    <button onClick={() => handleRemoveItem(item.product_id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.cartEmpty}>
              <FaShoppingCart />
              <p>Your cart is empty</p>
              <Link to="/products" onClick={toggleCart}>Start Shopping</Link>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className={styles.panelFooter}>
            <div>
              <p>Subtotal: Rs. {subtotal.toFixed(2)}</p>
              <p>
                Delivery:{" "}
                {deliveryCharge === 0 ? (
                  <span className={styles.freeDelivery}>FREE</span>
                ) : (
                  `Rs. ${deliveryCharge.toFixed(2)}`
                )}
              </p>
              <p className={styles.totalRow}>Total: Rs. {cartTotal}</p>
            </div>
            <button className={styles.btnCheckout} onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* 🟢 Checkout Panel */}
      <div className={`${styles.sidePanelOverlay} ${isCheckoutOpen ? styles.open : ""}`} onClick={() => setIsCheckoutOpen(false)}></div>
      <div className={`${styles.sidePanel} ${styles.checkoutPanel} ${isCheckoutOpen ? styles.open : ""}`}>
        <div className={styles.panelHeader}>
          <h3>Final Checkout</h3>
          <button onClick={() => setIsCheckoutOpen(false)}><FaTimes /></button>
        </div>
        <div className={styles.panelBody}>
          <form onSubmit={handleSubmitOrder}>
            <h4>Customer Details</h4>
            <input
              type="text"
              name="customer_name"
              placeholder="Full Name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="whatsapp_number"
              placeholder="WhatsApp Number"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={handleInputChange}
            />
            <textarea
              name="shipping_address"
              placeholder="Shipping Address"
              value={formData.shipping_address}
              onChange={handleInputChange}
              required
            ></textarea>
            <input
              type="text"
              name="postal_code"
              placeholder="Postal Code"
              value={formData.postal_code}
              onChange={handleInputChange}
            />

            <h4>Payment Method</h4>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <FaCreditCard /> Online Payment
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Placing Order..." : paymentMethod === "online" ? "Pay via WhatsApp" : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      price_per_item: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string,
    })
  ).isRequired,
  updateQuantity: PropTypes.func.isRequired,
  clearCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func,
};
