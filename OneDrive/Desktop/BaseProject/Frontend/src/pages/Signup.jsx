import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Inject neon blue glow styles globally
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .neon-input {
        background: rgba(30, 41, 59, 0.45);
        border: 1px solid rgba(56, 189, 248, 0.25);
        transition: 0.25s ease;
      }
      .neon-input:focus {
        border-color: #0EA5E9;
        box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
      }
      .neon-bottom-line {
        height: 2px;
        width: 100%;
        background: linear-gradient(to right, transparent, #38BDF8, transparent);
        opacity: 0.6;
        border-radius: 20px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!role) {
      setErrorMessage("⚠️ Please select a role before signing up.");
      setIsLoading(false);
      return;
    }

    const formattedRole = role.toLowerCase();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/signup`,
        { email, password, role: formattedRole },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response?.data?.message?.toLowerCase() === "signup successful!") {
        alert("✅ Account created! Go to the login page to log in.");
        navigate("/login");
      } else {
        setErrorMessage(response?.data?.message || "🚫 Signup failed. Try again.");
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        setErrorMessage("⚠️ Request timed out. Try again.");
      } else if (!error.response) {
        setErrorMessage("❌ Cannot connect to server. Ensure backend is running.");
      } else {
        setErrorMessage(error?.response?.data?.message || "⚠️ Signup failed.");
      }
    } finally {
      setIsLoading(false);
    }
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

  const titleVariant = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-black p-6 relative overflow-hidden">

      {/* Neon Glow Behind Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[70%] h-72 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] blur-[90px] opacity-20 rounded-full -translate-y-32"></div>
      </div>

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        <motion.h1
          variants={titleVariant}
          className="text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8]"
        >
          Create Account
        </motion.h1>

        <p className="text-center text-gray-300/80 mt-2">
          Join the MelodyStream community
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">

          {/* Email */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-blue-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input w-full p-3 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter your email"
            />
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Password */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-blue-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input w-full p-3 rounded-xl text-white placeholder-gray-400"
              placeholder="Create a password"
            />
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Role */}
          <motion.div variants={fieldVariant} className="relative">
            <label className="absolute left-4 -top-3 px-1 text-xs text-blue-300">
              Role
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="neon-input w-full p-3 rounded-xl text-white"
            >
              <option value="">Select your role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="neon-bottom-line absolute bottom-0 left-0"></div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fieldVariant}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-black font-semibold shadow-lg shadow-cyan-500/30"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </motion.button>
          </motion.div>
        </form>

        {/* Error Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [-6, 6, -4, 4, 0] }}
            transition={{ duration: 0.5 }}
            className="mt-5 p-3 rounded-lg bg-red-600 text-white text-center"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 text-gray-300"
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#38BDF8] cursor-pointer hover:underline"
          >
            Login
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}
