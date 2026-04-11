import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-copy">
          © 2026{" "}
          <a
            href="/"
            className="site-footer-link"
            target="_blank"
            rel="noreferrer"
          >
            HarvestHub
          </a>
          . All Rights Reserved.
        </span>
        <ul className="site-footer-links" aria-label="Footer navigation">
          <li className="site-footer-item">
            <Link to="/about" className="site-footer-link">
              About
            </Link>
          </li>
          <li className="site-footer-item">
            <a href="#" className="site-footer-link">
              Privacy Policy
            </a>
          </li>
          <li className="site-footer-item">
            <a href="#" className="site-footer-link">
              Licensing
            </a>
          </li>
          <li className="site-footer-item">
            <Link to="/contact" className="site-footer-link">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
