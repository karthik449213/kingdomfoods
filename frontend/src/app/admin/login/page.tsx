"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");

    } catch (error: any) {
      console.error("LOGIN ERROR:", error.response?.data);
      alert("Login Failed!");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin Login (Test Only)</h2>

      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
