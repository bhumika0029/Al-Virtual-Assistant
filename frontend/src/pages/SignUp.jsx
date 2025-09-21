import React, { useContext, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import bg from "../assets/authBg.png";
import { userDataContext } from "../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { ServerUrl, setUserData } = useContext(userDataContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${ServerUrl}/api/auth/signup`, {
        name,
        email,
        password,
      });

      const { token, user } = result.data;

      // ✅ Save token
      localStorage.setItem("token", token);

      // ✅ Save user data in context
      setUserData(user);

      setSuccess("Signup successful! 🎉");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setLoading(false);

      // ✅ Redirect to Customize page
      navigate("/customize");
    } catch (err) {
      console.error("❌ Signup Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Signup failed. Try again.");
      setLoading(false);
      setUserData(null);
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] max-w-[420px] bg-black/70 backdrop-blur-md shadow-2xl shadow-black p-8 rounded-2xl flex flex-col gap-6 text-white"
        onSubmit={handleSignUp}
      >
        <h1 className="text-2xl font-bold text-center text-white">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <div className="flex flex-col w-full">
          <label className="text-sm mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-blue-400"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="text-sm mb-1">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col w-full relative">
          <label className="text-sm mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-blue-400 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[42px] cursor-pointer text-gray-400 hover:text-white"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-300">
          Already have an account?{" "}
          <a href="/SignIn" className="text-blue-400 hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
