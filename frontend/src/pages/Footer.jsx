import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-wrapper bg-dark text-light pt-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6>Banasthali Vidyapith</h6>
            <div>Notified Under Section (3) of University Grants Commission Act.</div>
                <div>@ 2007 Banasthali Vidyapith.</div>
          </div>

          <div className="col-md-4 mb-3">
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div className="col-md-4 mb-3">
            <i className="bi bi-linkedin me-3"></i>
            <i className="bi bi-github"></i>
          </div>
        </div>

        <hr className="border-secondary" />
        <p className="text-center mb-0">© 2026 AAROHAN</p>
      </div>
    </footer>
  );
}

export default Footer;
