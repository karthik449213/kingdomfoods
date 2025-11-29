"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function MenuPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch menu items
  const loadMenu = async () => {
    try {
      const res = await axios.get("/menu", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenu(res.data);
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Handle input changes
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add dish
  const handleAdd = async () => {
    try {
      await axios.post("/menu/add", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Dish Added");
      loadMenu();
    } catch (err: any) {
      alert("Error Adding Dish");
      console.log(err);
    }
  };

  // Delete dish
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Dish Deleted");
      loadMenu();
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Menu Management</h2>

      {/* Add Menu Form */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add Dish</h3>

        <input
          type="text"
          name="name"
          placeholder="Dish Name"
          value={form.name}
          onChange={handleChange}
        /><br /><br />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        /><br /><br />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        /><br /><br />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        /><br /><br />

        <button onClick={handleAdd}>Add Dish</button>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Display All Menu Items */}
      <h3>Menu Items</h3>

      {menu.length === 0 ? (
        <p>No dishes added.</p>
      ) : (
        menu.map((item) => (
          <div key={item._id} style={{ marginBottom: "15px" }}>
            <strong>{item.name}</strong> — ₹{item.price}  
            <br />
            <small>{item.category}</small>
            <br />
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
