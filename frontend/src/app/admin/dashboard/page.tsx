"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Not logged in");
      window.location.href = "/admin/login";
      return;
    }

    axios
      .get("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log(res.data);
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Dashboard Error:", err.response?.data);
        alert("Unauthorized");
        window.location.href = "/admin/login";
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <a href="/admin/menu">Manage Menu</a>

      <p>{message || "Loading..."}</p>

    </div>
  );
}
