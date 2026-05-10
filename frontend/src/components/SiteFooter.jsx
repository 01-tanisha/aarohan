import React from "react";
import "./SiteFooter.css";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-content">
        <p>
          Notified Under Section (3) of University Grants Commission Act.<br />
          @ 2007 Banasthali Vidyapith.
        </p>

        <div className="site-footer-links">
          <a href="/">Home</a>
          <span>|</span>
          <a href="/">Contact Us</a>
          <span>|</span>
          <a
            href="https://www.instagram.com/banasthali_vidyapith_official/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <span>|</span>
          <a
            href="https://www.facebook.com/banasthali.org"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
