"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/utils/api";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Not logged in");
      router.push("/admin/login");
      return;
    }

    axios
      .get(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log(res.data);
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Dashboard Error (full):", err);
        console.debug("Dashboard Error response:", err?.response?.data);
        alert("Unauthorized");
        router.push("/admin/login");
      });
  }, [router]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <a href="/admin/menu">Manage Menu</a>

      <p>{message || "Loading..."}</p>

    </div>
  );
}
