import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/image/logo/eClearance.png"; // Ensure this path is correct

const Landingpage = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(2,119,189,0.08)",
      padding: "3rem 2.5rem",
      maxWidth: 420,
      width: "100%",
      textAlign: "center"
    }}>
      <img src={logo} alt="eClearance Logo" style={{
        width: 80,height: 80,
        borderRadius: "50%",
        boxShadow: "0 2px 12px rgba(2,119,189,0.1)"
      }} />
      <h1 style={{ fontWeight: 900, color: "#0277bd", marginBottom: 8 }}>
        eClearance
      </h1>
      <div style={{ color: "#444", fontSize: 18, marginBottom: 24 }}>
        Automated School Clearance Processing System
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Link to="/login" style={{
          background: "#0288d1",
          color: "#fff",
          fontWeight: 700,
          padding: "0.9rem 0",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 18,
          letterSpacing: 0.5,
          transition: "background 0.2s"
        }}>
          Login
        </Link>
        <Link to="/register" style={{
          background: "#ffc107",
          color: "#222",
          fontWeight: 700,
          padding: "0.9rem 0",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 18,
          letterSpacing: 0.5,
          transition: "background 0.2s"
        }}>
          Register
        </Link>
      </div>
      <div style={{ marginTop: 32, color: "#90caf9", fontSize: 14 }}>
        &copy; {new Date().getFullYear()} eClearance | All rights reserved.
      </div>
    </div>
  </div>
);

export default Landingpage;