import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/forgot-password", {
        email,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email,
          },
        });
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Toaster position="top-right" />

      <form
        onSubmit={handleForgotPassword}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-4 rounded-xl mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;