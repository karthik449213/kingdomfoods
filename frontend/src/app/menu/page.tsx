"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load menu
  const loadMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/menu");
      setMenu(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Add to cart
  const addToCart = (dish: any) => {
    const comment = prompt(
      "Any requirements? (e.g., No sugar, Extra spicy, Less salt)"
    );

    const cartItem = {
      ...dish,
      requirements: comment || "",
      quantity: 1,
    };

    const existing = localStorage.getItem("cart");
    const cart = existing ? JSON.parse(existing) : [];

    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart!");
  };

  if (loading) return <p>Loading menu...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Restaurant Menu</h2>

      {menu.length === 0 ? (
        <p>No dishes available right now.</p>
      ) : (
        menu.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <small>{item.category}</small>
            <p>{item.description}</p>

            <button onClick={() => addToCart(item)}>
              Add to Cart
            </button>
          </div>
        ))
      )}

      <br />
      <a href="/cart">
        <button>Go to Cart</button>
      </a>
    </div>
  );
}
