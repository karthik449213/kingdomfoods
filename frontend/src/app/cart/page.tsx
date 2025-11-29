"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <p>Requirements: {item.requirements || "None"}</p>
            <button onClick={() => removeItem(index)}>Remove</button>
          </div>
        ))
      )}

      {cart.length > 0 && (
        <>
          <h3>Total: ₹{getTotal()}</h3>

          <a href="/checkout">
            <button>Proceed to Checkout</button>
          </a>
        </>
      )}
    </div>
  );
}
