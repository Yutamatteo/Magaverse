import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import MagaverseHub from "./pages/MagaverseHub";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32 text-center" data-testid="not-found-page">
      <h1 className="font-serif-display text-5xl">404</h1>
      <p className="mt-3 text-muted-foreground">Page not found · Pagina non trovata</p>
      <a href="/" className="mt-6 inline-block underline text-primary">← Magaverse</a>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Magaverse hub at root (no Nello Layout) */}
          <Route path="/" element={<MagaverseHub />} />

          {/* Nello Ocean Beach mounted under /oceanbeach/* with Nello layout */}
          <Route path="/oceanbeach" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="booking" element={<Booking />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
