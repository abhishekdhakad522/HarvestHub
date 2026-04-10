import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-copy">
          © 2023{" "}
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
            <a href="/about" className="site-footer-link">
              About
            </a>
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
            <a href="#" className="site-footer-link">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
