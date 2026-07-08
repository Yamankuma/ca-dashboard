import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";

function VerifyOTP() {
  const navigate = useNavigate();

  const location = useLocation();

  const [email] = useState(location.state?.email || "");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/verify-email", {
        email,
        otp,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
  try {
    const res = await API.post("/resend-otp", {
      email,
    });

    toast.success(res.data.message);

    setTimer(60);
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed");
  }
};

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Toaster position="top-right" />

      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Verify Email
        </h1>

        <input
  type="email"
  placeholder="Enter Email"
  value={email}
  readOnly
  className="w-full border p-4 rounded-xl mb-4 bg-gray-100 cursor-not-allowed"
/>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border p-4 rounded-xl mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-4">
  <button
    type="button"
    onClick={handleResendOTP}
    className="text-blue-600 font-bold hover:underline"
  >
    Resend OTP
  </button>
</div>
      </form>
    </div>
  );
}

export default VerifyOTP;