import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth";

function AboutPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);
  return (
    <section className="about-page">
      {/* Hero */}
      <div className="about-hero">
        <p className="eyebrow">Our story</p>
        <h1>Connecting Farms to Families</h1>
        <p className="hero-copy">
          HarvestHub is a modern agricultural marketplace that bridges the gap
          between local farmers and consumers. We empower growers to sell
          directly, helping communities access fresh, sustainable produce while
          supporting local agriculture.
        </p>
      </div>

      {/* Mission Cards */}
      <div className="about-mission">
        <div className="mission-card">
          <div className="mission-icon">🌱</div>
          <h3>Support Local Farmers</h3>
          <p>
            We give farmers a direct channel to reach buyers, eliminating
            middlemen and ensuring fair prices for their hard work.
          </p>
        </div>
        <div className="mission-card">
          <div className="mission-icon">🥬</div>
          <h3>Fresh & Sustainable</h3>
          <p>
            Access farm-fresh produce, organic goods, and seasonal harvests
            directly from the source with full transparency.
          </p>
        </div>
        <div className="mission-card">
          <div className="mission-icon">🤝</div>
          <h3>Build Community</h3>
          <p>
            Connect with local growers, share farming knowledge, and strengthen
            the agricultural community through our platform.
          </p>
        </div>
      </div>

      {/* Platform Features */}
      <div className="about-features-section">
        <div className="about-section-header">
          <p className="eyebrow">Platform features</p>
          <h2>Everything You Need</h2>
          <p>
            A complete ecosystem for buying, selling, and learning about
            agriculture.
          </p>
        </div>

        <div className="about-features-grid">
          <div className="feature-block">
            <div className="feature-block-header">
              <div className="feature-block-icon">🛒</div>
              <h3>Marketplace</h3>
            </div>
            <ul>
              <li>Browse vegetables, fruits, grains, seeds & equipment</li>
              <li>Filter by category, price, and location</li>
              <li>Secure shopping cart with easy checkout</li>
              <li>Multiple payment options (COD, Card, UPI)</li>
            </ul>
          </div>

          <div className="feature-block">
            <div className="feature-block-header">
              <div className="feature-block-icon">📦</div>
              <h3>Order Management</h3>
            </div>
            <ul>
              <li>Real-time order tracking and status updates</li>
              <li>Complete order history for buyers</li>
              <li>Sales dashboard for farmers</li>
              <li>Easy order cancellation and support</li>
            </ul>
          </div>

          <div className="feature-block">
            <div className="feature-block-header">
              <div className="feature-block-icon">📝</div>
              <h3>Articles & Tips</h3>
            </div>
            <ul>
              <li>Share and read farming tips & success stories</li>
              <li>Market trends and agricultural insights</li>
              <li>Equipment reviews and recommendations</li>
              <li>Engage with comments and discussions</li>
            </ul>
          </div>

          <div className="feature-block">
            <div className="feature-block-header">
              <div className="feature-block-icon">📰</div>
              <h3>Farming News</h3>
            </div>
            <ul>
              <li>Latest agriculture and farming news</li>
              <li>Crop updates and harvest information</li>
              <li>AgriTech innovations and trends</li>
              <li>Organic farming and sustainability news</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="about-how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Create Account</h4>
            <p>
              Sign up as a Farmer to sell or as a Buyer to shop fresh produce
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Browse or List</h4>
            <p>Farmers list products, buyers browse the marketplace</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Place Orders</h4>
            <p>Add items to cart and checkout with your preferred payment</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Get Delivered</h4>
            <p>Track your order and receive fresh produce at your doorstep</p>
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="about-roles">
        <div className="role-card farmer">
          <div className="role-header">
            <div className="role-icon">👨‍🌾</div>
            <h3>For Farmers</h3>
          </div>
          <p>
            Take control of your sales. List your produce, manage orders, and
            connect directly with customers.
          </p>
          <ul className="role-features">
            <li>Create and manage product listings with images</li>
            <li>Set your own prices and quantities</li>
            <li>Track and fulfill incoming orders</li>
            <li>Share farming tips and articles</li>
            <li>Build your reputation and customer base</li>
          </ul>
        </div>

        <div className="role-card buyer">
          <div className="role-header">
            <div className="role-icon">🛍️</div>
            <h3>For Buyers</h3>
          </div>
          <p>
            Discover fresh, local produce from verified farmers. Shop with
            confidence and support your community.
          </p>
          <ul className="role-features">
            <li>Browse a wide variety of fresh produce</li>
            <li>Easy cart and checkout experience</li>
            <li>Multiple payment options available</li>
            <li>Track orders from confirmation to delivery</li>
            <li>Read articles and stay updated on farming</li>
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="about-stats">
        <div className="stat-card">
          <p className="stat-value">6+</p>
          <p className="stat-label">Product Categories</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">4+</p>
          <p className="stat-label">Payment Methods</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">6+</p>
          <p className="stat-label">Article Categories</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">24/7</p>
          <p className="stat-label">Platform Access</p>
        </div>
      </div>

      {/* CTA - Only show when not logged in */}
      {!user && (
        <div className="about-cta">
          <h2>Ready to Get Started?</h2>
          <p>
            Join HarvestHub today and be part of a growing community connecting
            farmers and food lovers across the region.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-primary">
              Create Account
            </Link>
            <Link to="/shop" className="cta-secondary">
              Browse Products
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default AboutPage;
