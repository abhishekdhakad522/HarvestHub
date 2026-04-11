import { useState } from "react";

function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previousValue) => ({
      ...previousValue,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setFormState({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="contact-page">
      <div className="contact-hero">
        <p className="eyebrow">Contact us</p>
        <h1>Let us grow together.</h1>
        <p className="hero-copy">
          Have a question about orders, products, or partnerships? Send us a
          message and the HarvestHub team will get back to you.
        </p>
      </div>

      <div className="contact-grid">
        <aside className="contact-info-card" aria-label="Contact details">
          <h2>Reach HarvestHub</h2>
          <p>
            We are available Monday to Saturday, from 8:00 AM to 7:00 PM.
          </p>

          <ul className="contact-info-list">
            <li>
              <span className="contact-info-label">Phone</span>
              <a href="tel:+919876543210">+91 98765 43210</a>
            </li>
            <li>
              <span className="contact-info-label">Email</span>
              <a href="mailto:support@harvesthub.in">support@harvesthub.in</a>
            </li>
            <li>
              <span className="contact-info-label">Address</span>
              <p>3rd Floor, Green Valley Plaza, Pune, Maharashtra</p>
            </li>
          </ul>

          <div className="contact-help-note">
            For urgent delivery concerns, include your order ID in the message
            subject.
          </div>
        </aside>

        <form className="contact-form-card" onSubmit={handleSubmit}>
          <h2>Send a message</h2>
          <div className="contact-form-grid">
            <label className="contact-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </label>

            <label className="contact-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="contact-field contact-field-full">
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                value={formState.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
              />
            </label>

            <label className="contact-field contact-field-full">
              <span>Message</span>
              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us what you need"
                required
              />
            </label>
          </div>

          <button className="action-button contact-submit" type="submit">
            Send message
          </button>

          {submitted && (
            <p className="contact-success" role="status">
              Thanks for reaching out. We will contact you shortly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default ContactPage;