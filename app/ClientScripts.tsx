'use client';

import { useEffect } from 'react';

const CONTACT = {
  whatsappNumber: "+447423272138",
  phoneNumber: "+447423272138",
  phoneDisplay: "07423 272 138",
  email: "xdrivelogisticsltd@gmail.com"
};

export default function ClientScripts() {
  useEffect(() => {
    // Smooth anchors
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", id);
        }
      });
    });

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        const open = mobileMenu!.style.display !== "none";
        mobileMenu!.style.display = open ? "none" : "block";
      });
    }

    // Contact links
    const waLink = document.getElementById("waLink");
    const phoneLink = document.getElementById("phoneLink");
    const emailLink = document.getElementById("emailLink");

    if (waLink) {
      waLink.setAttribute('href', `https://wa.me/${CONTACT.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi XDrive Logistics LTD, I'd like a quote. Pickup: ___ | Drop-off: ___ | Date: ___ | Load: ___")}`);
    }
    if (phoneLink) {
      phoneLink.setAttribute('href', `tel:${CONTACT.phoneNumber}`);
    }
    if (emailLink) {
      emailLink.setAttribute('href', `mailto:${CONTACT.email}?subject=${encodeURIComponent("Quote Request — XDrive Logistics LTD")}&body=${encodeURIComponent("Hello XDrive Logistics LTD,%0D%0A%0D%0APickup:%0D%0ADrop-off:%0D%0AService:%0D%0AVehicle:%0D%0ADate:%0D%0ALoad details:%0D%0A%0D%0AContact:%0D%0A")}`);
    }

    // Show details text
    const waText = document.getElementById("waText");
    const phoneText = document.getElementById("phoneText");
    const emailText = document.getElementById("emailText");
    
    if (waText) waText.textContent = CONTACT.phoneDisplay;
    if (phoneText) phoneText.textContent = CONTACT.phoneDisplay;
    if (emailText) emailText.textContent = CONTACT.email;

    // Set year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
  }, []);

  return null;
}
