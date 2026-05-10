import React from "react";
import "./HeaderBanner.css";
import headerImg from "../images/Banasthali_header_img.jpeg";

function HeaderBanner() {
  return (
    <>
      <div className="global-header-banner">
        <img src={headerImg} alt="Banasthali Header" className="global-header-banner-img" />
      </div>
      <div className="global-header-divider" />
    </>
  );
}

export default HeaderBanner;
