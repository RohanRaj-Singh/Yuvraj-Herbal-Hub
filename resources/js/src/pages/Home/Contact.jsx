import { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import styles from './contact.module.css';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Replace with your WhatsApp number (include country code without + or spaces)
    // Example: For +1 555-123-4567, use 15551234567
    const whatsappNumber = '15551234567';
    
    // Create WhatsApp message with form data
    const message = `Hello! I'm reaching out through your website.

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
*Subject:* ${formData.subject}

*Message:*
${formData.message}`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Show success message
    setSubmitted(true);
    
    // Open WhatsApp in new tab
    setTimeout(() => {
      window.open(whatsappURL, '_blank');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 2000);
    }, 500);
  };

  return (
    <div className={styles.contactContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Get In Touch</h1>
          <p className={styles.heroSubtitle}>We'd love to hear from you. Let's start a conversation.</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <Phone className={styles.icon} />
            </div>
            <h3 className={styles.infoTitle}>Phone</h3>
            <p className={styles.infoText}>+923245258505</p>
            <p className={styles.infoText}>+923313600013</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <Mail className={styles.icon} />
            </div>
            <h3 className={styles.infoTitle}>Email</h3>
            <p className={styles.infoText}>support@yuvrajherbalhub.com</p>
            <p className={styles.infoText}>-------------</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <MapPin className={styles.icon} />
            </div>
            <h3 className={styles.infoTitle}>Address</h3>
            <p className={styles.infoText}>-----------------</p>
            <p className={styles.infoText}>=================</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>
            <div className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="+923163820562"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button onClick={handleSubmit} className={styles.submitButton}>
                {submitted ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Opening WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send via WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>Find Us Here</h2>
            <div className={styles.mapContainer}>
              <iframe
                className={styles.map}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718453!2d-73.98823492346634!3d40.75889497138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1698765432109!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
              ></iframe>
            </div>

            {/* Social Media Section */}
            <div className={styles.socialSection}>
              <h3 className={styles.socialTitle}>Connect With Us</h3>
              <div className={styles.socialIcons}>
                <a 
                  href="https://www.tiktok.com/@yuvrajherbalhub?_t=ZS-90T2rKW1I8a&_r=1" 
                  aria-label="Tiktok" 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaTiktok/>
                </a>
                <a 
                  href="https://www.facebook.com/share/1Fo5pzdBf4/" 
                  aria-label="Facebook" 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaFacebook/>
                </a>
                <a 
                  href="https://www.instagram.com/yuvrajherbalhub?igsh=dTZ4ZjVlYmh2MHdl" 
                  aria-label="Instagram" 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram/>
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className={styles.hoursSection}>
              <h3 className={styles.hoursTitle}>Business Hours</h3>
              <div className={styles.hoursList}>
                <div className={styles.hoursItem}>
                  <span className={styles.day}>Monday - Friday</span>
                  <span className={styles.time}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={styles.hoursItem}>
                  <span className={styles.day}>Saturday</span>
                  <span className={styles.time}>10:00 AM - 4:00 PM</span>
                </div>
                <div className={styles.hoursItem}>
                  <span className={styles.day}>Sunday</span>
                  <span className={styles.time}>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}