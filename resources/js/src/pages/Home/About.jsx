import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt, FaArrowRight, FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShippingFast, FaLeaf, FaCertificate, FaHeart, FaRegHeart, FaSearch, FaTimes, FaFilter, FaTiktok, FaWhatsapp } from 'react-icons/fa';

import style from './about.module.css';
import styles from './Home.module.css';
import { Link } from 'react-router-dom';
import Footer from '../Footer';

export default function About() {
  return (
    <div className={style.aboutContainer}>
      {/* Hero Section */}
      <section className={style.heroSection}>
        <div className={style.heroContent}>
          <span className={style.badge}>Our Story</span>
          <h1 className={style.heroTitle}>Crafted by Nature, <br/>Perfected by Passion</h1>
          <p className={style.heroSubtitle}>
            Discover the ancient wisdom of herbal remedies, reimagined for modern wellness. 
            Every drop tells a story of purity, tradition, and care.
          </p>
        </div>
        <div className={style.heroDecor}></div>
      </section>

      {/* Mission & Vision */}
      <section className={style.missionSection}>
        <div className={style.container}>
          <div className={style.missionGrid}>
            <div className={style.missionCard}>
              <div className={style.iconBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className={style.cardTitle}>Our Mission</h3>
              <p className={style.cardText}>
                To harness the power of nature's finest herbs and botanicals, delivering premium 
                hair and scalp care solutions that nurture, restore, and transform.
              </p>
            </div>
            <div className={style.missionCard}>
              <div className={style.iconBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className={style.cardTitle}>Our Vision</h3>
              <p className={style.cardText}>
                To become the world's most trusted name in herbal hair care, setting new 
                standards for purity, efficacy, and sustainable beauty practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Profile */}
      <section className={style.ownerSection}>
        <div className={style.container}>
          <div className={style.ownerGrid}>
            <div className={style.ownerImage}>
              
              <img className={style.imagePlaceholder} src='/owner.webp' />
                
                
             
              <div className={style.imageDecor}></div>
            </div>
            <div className={style.ownerContent}>
              <span className={style.ownerLabel}>Founder & Master Herbalist</span>
              <h2 className={style.ownerName}>PAVRAJ SINGH</h2>
              <p className={style.ownerBio}>
                With over 15 years of experience in Ayurvedic medicine and botanical sciences, 
               Pavraj singh has dedicated his life to reviving ancient herbal traditions. His 
                research in traditional formulations and modern extraction techniques has earned 
                international recognition.
              </p>
              <p className={style.ownerBio}>
                "I believe that true beauty comes from nurturing our hair with what nature intended. 
                Every formula we create is a testament to the healing power of herbs, crafted with 
                precision and love."
              </p>
              <div className={style.ownerStats}>
                <div className={style.statItem}>
                  <span className={style.statNumber}>15+</span>
                  <span className={style.statLabel}>Years Experience</span>
                </div>
                <div className={style.statItem}>
                  <span className={style.statNumber}>50K+</span>
                  <span className={style.statLabel}>Happy Customers</span>
                </div>
                <div className={style.statItem}>
                  <span className={style.statNumber}>100%</span>
                  <span className={style.statLabel}>Natural Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className={style.journeySection}>
        <div className={style.container}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>Our Journey</h2>
            <p className={style.sectionSubtitle}>
              From a small lab to homes worldwide, every milestone is a step towards natural wellness
            </p>
          </div>
          <div className={style.timeline}>
            <div className={style.timelineItem}>
              <div className={style.timelineYear}>2010</div>
              <div className={style.timelineContent}>
                <h4 className={style.timelineTitle}>The Beginning</h4>
                <p className={style.timelineText}>
                  Started with a small research lab, experimenting with traditional herbal formulations 
                  and modern extraction methods.
                </p>
              </div>
            </div>
            <div className={style.timelineItem}>
              <div className={style.timelineYear}>2014</div>
              <div className={style.timelineContent}>
                <h4 className={style.timelineTitle}>First Product Launch</h4>
                <p className={style.timelineText}>
                  Introduced our signature Amla & Bhringraj Oil, which quickly became a customer 
                  favorite and won multiple awards.
                </p>
              </div>
            </div>
            <div className={style.timelineItem}>
              <div className={style.timelineYear}>2018</div>
              <div className={style.timelineContent}>
                <h4 className={style.timelineTitle}>International Expansion</h4>
                <p className={style.timelineText}>
                  Expanded to 15 countries, bringing the power of Ayurvedic hair care to customers 
                  around the globe.
                </p>
              </div>
            </div>
            <div className={style.timelineItem}>
              <div className={style.timelineYear}>2025</div>
              <div className={style.timelineContent}>
                <h4 className={style.timelineTitle}>Innovation & Growth</h4>
                <p className={style.timelineText}>
                  Launched our complete range of herbal shampoos and treatments, serving over 50,000 
                  satisfied customers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={style.valuesSection}>
        <div className={style.container}>
          <h2 className={style.sectionTitle}>Our Core Values</h2>
          <div className={style.valuesGrid}>
            <div className={style.valueCard}>
              <div className={style.valueIcon}>🌿</div>
              <h4 className={style.valueTitle}>100% Natural</h4>
              <p className={style.valueText}>
                Only pure, organic herbs and botanicals. No synthetic chemicals or harmful additives.
              </p>
            </div>
            <div className={style.valueCard}>
              <div className={style.valueIcon}>✨</div>
              <h4 className={style.valueTitle}>Premium Quality</h4>
              <p className={style.valueText}>
                Rigorous testing and quality control ensure every bottle meets our highest standards.
              </p>
            </div>
            <div className={style.valueCard}>
              <div className={style.valueIcon}>🌍</div>
              <h4 className={style.valueTitle}>Sustainable</h4>
              <p className={style.valueText}>
                Eco-friendly packaging and ethical sourcing practices that protect our planet.
              </p>
            </div>
            <div className={style.valueCard}>
              <div className={style.valueIcon}>🧪</div>
              <h4 className={style.valueTitle}>Science-Backed</h4>
              <p className={style.valueText}>
                Traditional wisdom meets modern research for proven, effective formulations.
                
              </p>
            </div>
          </div>
        </div>
      </section>
<Footer/>
      
    </div>
  );
}