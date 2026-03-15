import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNotifications } from './components/notifications/NotificationProvider';

// ✅ Keep Navbar eager (it’s global & small)
import Navbar from "./pages/Navbar";
import Contact from './pages/Home/Contact';

// Lazy load main pages (code splitting)
import Home from "./pages/Home/Home";
import Products from "./pages/Home/Products";
import Admin from "./pages/admin/Admin";
import About from "./pages/Home/About";
import ProductDetail from './pages/Home/ProductDetail';



// 🛒 Cart Hook (same logic but with light optimization)
const useCart = (notify) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppingCart');
      if (stored) {
        return JSON.parse(stored).map(item => ({
          ...item,
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10)
        }));
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantityToAdd = 1) => {
    if (quantityToAdd < 1) return;
    const productId = parseInt(product.product_id, 10);
    if (isNaN(productId)) return;

    setCartItems(prev => {
      const exists = prev.find(i => i.product_id === productId);
      const price = product.discount_percent > 0
        ? product.selling_price * (1 - product.discount_percent / 100)
        : product.selling_price;

      return exists
        ? prev.map(i =>
            i.product_id === productId
              ? { ...i, quantity: i.quantity + quantityToAdd }
              : i
          )
        : [
            ...prev,
            {
              ...product,
              product_id: productId,
              quantity: quantityToAdd,
              price_per_item: parseFloat(price.toFixed(2))
            }
          ];
    });
    if (notify) {
      notify({
        type: 'success',
        title: 'Added to cart',
        message: `${quantityToAdd} x "${product.title}" added to your cart.`,
      });
    }
  }, [notify]);

  const updateQuantity = useCallback((id, q) => {
    const pid = parseInt(id, 10);
    const quantity = parseInt(q, 10);
    setCartItems(prev =>
      quantity < 1
        ? prev.filter(i => i.product_id !== pid)
        : prev.map(i =>
            i.product_id === pid ? { ...i, quantity } : i
          )
    );
  }, []);

  const removeFromCart = useCallback(pid => {
    const id = parseInt(pid, 10);
    setCartItems(prev => prev.filter(i => i.product_id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  return { cartItems, addToCart, updateQuantity, clearCart, removeFromCart };
};

export default function App() {
  const { notify } = useNotifications();
  const { cartItems, addToCart, updateQuantity, clearCart, removeFromCart } = useCart(notify);



  return (
    <BrowserRouter>
      {/* Navbar is eager for instant render */}
      <Navbar
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        removeFromCart={removeFromCart}
      />

      {/* Suspense wrapper for lazy pages */}

        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path='/products/:productId' element={<ProductDetail addToCart={addToCart} />}/>
          <Route path="/about" element={<About />} />
          <Route path="/pavraj1632" element={<Admin />} />
          <Route path="/contact" element={<Contact/>}/>
        </Routes>

    </BrowserRouter>
  );
}
