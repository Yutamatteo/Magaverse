import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyCTA from "./StickyCTA";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20" data-testid="page-main">
        {children}
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
}
