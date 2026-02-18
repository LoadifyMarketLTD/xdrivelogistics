'use client';

import { FormEvent } from 'react';

const CONTACT = {
  whatsappNumber: "+447423272138",
  phoneNumber: "+447423272138",
  phoneDisplay: "07423 272 138",
  email: "xdrivelogisticsltd@gmail.com"
};

export default function ContactForm() {
  const buildMessage = (data: Record<string, string>) => {
    return [
      "Quote Request — XDrive Logistics LTD",
      "",
      `Pickup: ${data.pickup || ""}`,
      `Drop-off: ${data.dropoff || ""}`,
      `Service: ${data.service || ""}`,
      `Vehicle: ${data.vehicle || ""}`,
      `Date: ${data.date || ""}`,
      `Contact: ${data.contact || ""}`,
      "",
      `Load details:`,
      `${data.details || ""}`
    ].join("\n");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const body = buildMessage(data);

    const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Quote Request — XDrive Logistics LTD")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Opening your email app…";
      toast.style.display = "block";
      setTimeout(() => (toast.style.display = "none"), 2600);
    }
  };

  const handleCopy = async () => {
    const form = document.getElementById("quoteForm") as HTMLFormElement;
    if (!form) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const text = buildMessage(data);

    try {
      await navigator.clipboard.writeText(text);
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "Message copied to clipboard ✅";
        toast.style.display = "block";
        setTimeout(() => (toast.style.display = "none"), 2600);
      }
    } catch {
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "Copy failed — your browser blocked clipboard.";
        toast.style.display = "block";
        setTimeout(() => (toast.style.display = "none"), 2600);
      }
    }
  };

  return (
    <form id="quoteForm" onSubmit={handleSubmit}>
      <div className="row">
        <div>
          <label>Pickup (City / Postcode)
            <input name="pickup" placeholder="e.g. BB1, Blackburn" required />
          </label>
        </div>
        <div>
          <label>Drop-off (City / Postcode)
            <input name="dropoff" placeholder="e.g. M1, Manchester" required />
          </label>
        </div>
      </div>

      <div className="row">
        <div>
          <label>Service type
            <select name="service" required>
              <option value="" disabled>Select…</option>
              <option>Same-day courier</option>
              <option>Next-day delivery</option>
              <option>Dedicated van</option>
              <option>Pallet transport</option>
              <option>Multi-drop route</option>
              <option>EU transport</option>
            </select>
          </label>
        </div>
        <div>
          <label>Vehicle
            <select name="vehicle" required>
              <option value="" disabled>Select…</option>
              <option>Small van</option>
              <option>Medium van</option>
              <option>Large van / Luton</option>
              <option>7.5t (on request)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="row">
        <div>
          <label>Date
            <input name="date" type="date" required />
          </label>
        </div>
        <div>
          <label>Contact (phone / email)
            <input name="contact" placeholder="e.g. 07423 272138 / email" required />
          </label>
        </div>
      </div>

      <div>
        <label>Load details
          <textarea name="details" placeholder="Weight/size, pallets, collection time window, special notes…" required></textarea>
        </label>
      </div>

      <div className="formActions">
        <button className="btn primary" type="submit">Send Request</button>
        <button className="btn" type="button" onClick={handleCopy}>Copy Message</button>
        <span className="hint">Opens email compose (or copy message) — no backend needed.</span>
      </div>
    </form>
  );
}
