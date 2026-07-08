import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", {
        email,
        password,
      });

      console.log(res.data);

      // Save Token

      localStorage.setItem("token", res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Login Successful");

      // Redirect

      if (res.data.user.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/dashboard");
}
    } catch (err) {
      console.log(err);

      setMessage(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-[400px]"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {message && (
          <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Email */}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-xl w-full mb-4"
        />

        {/* Password */}

        <input
  type={showPassword ? "text" : "password"}
  placeholder="Enter Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="border p-3 rounded-xl w-full"
/>

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="text-blue-600 text-sm mt-2 mb-4"
>
  {showPassword ? "Hide Password" : "Show Password"}
</button>

        {/* Button */}

        <button
          type="submit"
          className="bg-black text-white w-full py-3 rounded-xl hover:bg-gray-800"
        >
          Login
        </button>
        <p className="text-center mb-4">
  <span
    onClick={() => navigate("/forgot-password")}
    className="text-red-600 font-bold cursor-pointer hover:underline"
  >
    Forgot Password?
  </span>
</p>
        <p className="text-center mt-5">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-bold cursor-pointer"
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
