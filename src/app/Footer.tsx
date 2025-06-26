import React from "react";

const Footer = () => (
  <footer style={{
    width: "100%",
    textAlign: "center",
    padding: "1.2rem 0",
    background: "#f1f1f1",
    color: "#000",
    fontSize: "1.25rem",
    borderTop: "1px solid #eaeaea",
    position: "fixed",
    bottom: 0,
    left: 0,
    zIndex: 1000
  }}>
    &copy; {new Date().getFullYear()} Raj Vidya Kender, proudly built by RVK IT Team
  </footer>
);

export default Footer;
