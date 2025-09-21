import React, { useContext, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { userDataContext } from "../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "../assets/authBg.png";


const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { ServerUrl, setUserData } = useContext(userDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${ServerUrl}/api/auth/login`, { email, password });

      const { token, user } = data;
      if (!token) {
        setError("Login failed: token not received from server");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token); // ✅ Store token
      setUserData(user);

      navigate("/customize");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] max-w-[420px] bg-black/70 backdrop-blur-md shadow-2xl shadow-black p-8 rounded-2xl flex flex-col gap-6 text-white"
        onSubmit={handleSignIn}
      >
        <h1 className="text-2xl font-bold text-center">
          Sign In to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-blue-400"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:border-blue-400 pr-10 w-full"
            required
          />
          <span
            className="absolute right-3 top-3 cursor-pointer text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
