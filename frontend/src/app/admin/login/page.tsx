"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/utils/api";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        username,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Redirect to admin dashboard after successful login
      router.push("/admin/dashboard");

    } catch (error: any) {
      console.error("LOGIN ERROR (full):", error);
      console.debug("LOGIN ERROR response data:", error?.response?.data);
      alert("Login Failed!");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin Login (Test Only)</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
