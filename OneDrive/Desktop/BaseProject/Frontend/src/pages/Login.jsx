import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VideoStyleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add neon CSS styles dynamically
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .neon-input {
        background: rgba(0, 0, 0, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: 0.25s ease;
      }
      .neon-input:focus {
        border-color: #00f2ff;
        box-shadow: 0 0 20px rgba(0, 242, 255, 0.15);
      }
      .neon-bottom-line {
        height: 2px;
        width: 100%;
        background: linear-gradient(to right, transparent, #00f2ff, transparent);
        opacity: 0.6;
        border-radius: 20px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Actual backend login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !role) {
      setError("⚠️ Please fill all fields and select a role.");
      setLoading(false);
      return;
    }

    const formattedRole = role.toLowerCase();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/login`,
        { email, password, role: formattedRole },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response?.data?.message?.toLowerCase() === "login successful!") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", email.toLowerCase());
        localStorage.setItem("role", formattedRole);

        if (formattedRole === "admin") navigate("/admin-dashboard");
        else navigate("/");
      } else {
        setError(response.data.message || "🚫 Invalid credentials.");
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        setError("⚠️ Server timeout. Try again.");
      } else if (!error.response) {
        setError("❌ Cannot connect to server.");
      } else {
        setError(error.response.data.message || "⚠️ Login failed.");
      }
    }

    setLoading(false);
  };

  // Animations
  const containerVariant = {
    hidden: { opacity: 0, scale: 0.92, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { when: "beforeChildren", staggerChildren: 0.15 },
    },
  };

  const fieldVariant = {
    hidden: { opacity: 0, x: -45 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 110, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030405] via-[#071018] to-black p-6 relative overflow-hidden">
      
      {/* Glow Light */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[70%] h-72 bg-gradient-to-r from-cyan-500 to-purple-500 blur-[75px] opacity-20 rounded-full -translate-y-32"></div>
      </div>

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        <motion.h1
          variants={fieldVariant}
          className="text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300"
        >
          Login
        </motion.h1>

        <p className="text-center text-gray-300/80 mt-2">
          Welcome back to MelodyStream
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          
          {/* Email */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-cyan-300">Email</label>
            <input
              type="email"
              className="neon-input w-full p-3 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Password */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-cyan-300">Password</label>
            <input
              type="password"
              className="neon-input w-full p-3 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Role Select */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-cyan-300">Role</label>
            <select
              className="neon-input w-full p-3 rounded-xl text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select your role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={fieldVariant}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 text-black font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [-8, 8, -6, 6, 0] }}
            transition={{ duration: 0.5 }}
            className="mt-5 p-3 rounded-lg bg-red-600 text-white text-center"
          >
            {error}
          </motion.div>
        )}

        <p className="text-center mt-6 text-gray-300">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-cyan-300 cursor-pointer hover:underline"
          >
            Signup
          </span>
        </p>
      </motion.div>
    </div>
  );
}
