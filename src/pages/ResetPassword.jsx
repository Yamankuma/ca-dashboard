import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e) => {
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

      const res = await API.post("/reset-password", {
        email,
        otp,
        password,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Reset Password Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Toaster position="top-right" />

      <form
        onSubmit={handleResetPassword}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Reset Password
        </h1>

        <input
          type="email"
          value={email}
          readOnly
          className="w-full border p-4 rounded-xl mb-4 bg-gray-100"
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border p-4 rounded-xl mb-4"
        />

        <input
  type={showPassword ? "text" : "password"}
  placeholder="Enter New Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  className="w-full border p-4 rounded-xl"
/>

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="text-blue-600 text-sm mt-2 mb-6"
>
  {showPassword ? "Hide Password" : "Show Password"}
</button>
        <p className="text-sm text-gray-500 mb-4">
  Password must be at least 8 characters long.
</p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;