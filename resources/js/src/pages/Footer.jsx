import React from 'react';
import { Link } from 'react-router-dom';
import style from './foot.module.css';
import { FaTiktok, FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={style.footer}>
      <div className={style.container}>
        {/* Logo & Description */}
        <div className={style.section}>
          <h2 className={style.title}>Yuvraj Herbal Hub</h2>
          <p className={style.desc}>
            Your destination for quality products and exceptional service.
            Experience natural shopping redefined.
          </p>
          <div className={style.socialIcons}>
            <a 
              href="https://www.tiktok.com/@yuvrajherbalhub?_t=ZS-90T2rKW1I8a&_r=1" 
              aria-label="Tiktok" 
              className={style.socialLink}
              target="_blank"
              rel="noreferrer"
            >
              <FaTiktok />
            </a>
            <a 
              href="https://www.facebook.com/share/1Fo5pzdBf4/" 
              aria-label="Facebook" 
              className={style.socialLink}
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebook />
            </a>
            <a 
              href="https://www.instagram.com/yuvrajherbalhub?igsh=dTZ4ZjVlYmh2MHdl" 
              aria-label="Instagram" 
              className={style.socialLink}
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={style.section}>
          <h3 className={style.subtitle}>Quick Links</h3>
          <ul className={style.list}>
            <li className={style.listItem}>
              <Link to="/about" className={style.link}>
                About Us
              </Link>
            </li>
            <li className={style.listItem}>
              <Link to="/products" className={style.link}>
                Our Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className={style.section}>
          <h3 className={style.subtitle}>Customer Service</h3>
          <ul className={style.list}>
            <li className={style.listItem}>
              <Link to="/shipping-info" className={style.link}>
                Shipping Info
              </Link>
            </li>
            <li className={style.listItem}>
              <Link to="/returns-policy" className={style.link}>
                Returns Policy
              </Link>
            </li>
            <li className={style.listItem}>
              <Link to="/track-order" className={style.link}>
                Track Order
              </Link>
            </li>
            <li className={style.listItem}>
              <Link to="/privacy-policy" className={style.link}>
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={style.section}>
          <h3 className={style.subtitle}>Contact Us</h3>
          <div className={style.contactInfo}>
            <p className={style.contactItem}>
              <FaEnvelope />
              <a
                href="mailto:support@yuvrajherbalhub.com"
                className={style.contactLink}
              >
                support@yuvrajherbalhub.com
              </a>
            </p>
            <p className={style.contactItem}>
              <FaPhone /> +923245258505
            </p>
            <p className={style.contactItem}>
              <FaWhatsapp />
              <a
                href="https://wa.me/923245258505"
                target="_blank"
                rel="noreferrer"
                className={style.contactLink}
              >
                Chat on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={style.bottom}>
        <p>© 2025 Yuvraj Herbal Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}