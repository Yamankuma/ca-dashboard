import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../services/api";

import toast, { Toaster } from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    password: "",

    role: "user",

   
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!passwordRegex.test(formData.password)) {
  toast.error(
    "Password must be at least 8 characters and include uppercase, lowercase, number and special character."
  );
  return;
}

    try {
      
      setLoading(true);

      const res = await API.post("/signup", formData);

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/verify-email" , {
    state: {
      email: formData.email,
    },
  });
      }, 1500);
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <Toaster position="top-right" />

      <form
        onSubmit={handleSignup}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-center mb-8">Create Account</h1>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
  type={showPassword ? "text" : "password"}
  name="password"
  placeholder="Enter Password"
  value={formData.password}
  onChange={handleChange}
  required
  className="w-full border p-4 rounded-xl"
/>

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="text-blue-600 text-sm mt-2 mb-4"
>
  {showPassword ? "Hide Password" : "Show Password"}
</button>
        <p className="text-sm text-gray-500 mb-4">
  Password must be at least 8 characters long.
</p>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-4 rounded-xl mb-6"
        >
          <option value="user">User</option>

          <option value="ca">CA</option>
        </select>

       

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold hover:bg-gray-800 transition"
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <p className="text-center mt-6">
          Already have account?{" "}
          <Link to="/" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
