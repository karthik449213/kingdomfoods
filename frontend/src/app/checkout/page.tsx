"use client";

import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const PHONE = "917075543886"; // <-- replace with restaurant phone

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Format WhatsApp Message
  const generateMessage = () => {
    let message = "🧾 *New Order from QR Menu*%0A%0A";

    cart.forEach((item, index) => {
      message += `🍽️ *${item.name}* - ₹${item.price}%0A`;
      message += `Qty: ${item.quantity}%0A`;
      message += `Requirements: ${item.requirements || "None"}%0A`;
      message += `%0A`;
    });

    message += `-------------------------%0A`;
    message += `💰 *Total:* ₹${getTotal()}%0A`;
    message += `-------------------------%0A`;

    return message;
  };

  // WhatsApp Redirect
  const handleWhatsAppOrder = () => {
    const message = generateMessage();
    window.location.href = `https://wa.me/${PHONE}?text=${message}`;
  };

  // Call Button
  const handleCall = () => {
    window.location.href = `tel:${PHONE}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <h3>Order Summary</h3>

          {cart.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "6px",
              }}
            >
              <strong>{item.name}</strong> — ₹{item.price}
              <br />
              Qty: {item.quantity}
              <br />
              Requirements: {item.requirements || "None"}
            </div>
          ))}

          <h3>Total: ₹{getTotal()}</h3>

          <br />

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppOrder}
            style={{
              background: "green",
              color: "white",
              padding: "12px 20px",
              marginRight: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send Order via WhatsApp
          </button>

          {/* Call Button */}
          <button
            onClick={handleCall}
            style={{
              background: "blue",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Call Restaurant
          </button>
        </>
      )}
    </div>
  );
}
