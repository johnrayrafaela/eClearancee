import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/image/logo/eClearance.png";
import { typeScale, gradients, buttonStyles, injectKeyframes, colors } from "../style/CommonStyles";

const Landingpage = () => {
  useEffect(() => { injectKeyframes(); }, []);

  const outerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.8rem .9rem",
    background: gradients.background,
    fontFamily: "'Segoe UI', sans-serif"
  };

  const card = {
    background: "#fff",
    borderRadius: 18,
    width: "100%",
    maxWidth: 420,
    padding: "1.8rem 1.4rem 1.6rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 10px 38px -8px rgba(2,119,189,0.25),0 6px 20px -6px rgba(2,119,189,0.18)",
    animation: "fadeInUp .55s ease-out"
  };

  const title = {
    margin: ".45rem 0 .3rem",
    fontSize: typeScale.xxl,
    fontWeight: 800,
    letterSpacing: ".5px",
    color: colors.primary,
    lineHeight: 1.05
  };

  const tagline = {
    fontSize: typeScale.lg,
    color: "#444",
    lineHeight: 1.25,
    marginBottom: "1rem",
    fontWeight: 600
  };

  const actionCol = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
    marginTop: ".4rem"
  };

  const smallBtnBase = {
    ...buttonStyles.primary,
    width: "100%",
    padding: "10px 14px",
    fontSize: typeScale.xl,
    borderRadius: 10,
    fontWeight: 700,
    letterSpacing: ".4px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
  };

  const loginBtn = {
    ...smallBtnBase
  };

  const registerBtn = {
    ...smallBtnBase,
    background: gradients.warning,
    boxShadow: "0 4px 15px rgba(255,152,0,0.3)"
  };

  const footer = {
    marginTop: "1.2rem",
    fontSize: typeScale.base,
    color: colors.muted,
    letterSpacing: ".3px"
  };

  return (
    <div style={outerStyle}>
      <div style={card}>
        <img
          src={logo}
          alt="eClearance Logo"
          style={{
            width: 66,
            height: 66,
            borderRadius: "50%",
            boxShadow: "0 4px 18px rgba(2,119,189,0.25)",
            objectFit: "cover"
          }}
        />
        <h1 style={title}>eClearance</h1>
        <p style={tagline} aria-label="System Tagline">
          Automated School Clearance Processing
        </p>
        <div style={actionCol}>
          <Link to="/login" style={loginBtn}>Login</Link>
          <Link to="/register" style={registerBtn}>Register</Link>
        </div>
        <div style={footer}>
          © {new Date().getFullYear()} eClearance · All rights reserved
        </div>
      </div>
    </div>
  );
};

export default Landingpage;