import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";

import html2canvas from "html2canvas";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const reportRef = useRef(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [file, setFile] = useState(null);

  const [documentType, setDocumentType] = useState("pan");

  const [preview, setPreview] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);

  const rejectReasons = [
    "Blurry Image",
    "Wrong Document",
    "Cropped Document",
    "DOB Missing",
    "PAN Number Not Detected",
    "Fake / Suspicious Document",
  ];

  const [selectedReason, setSelectedReason] = useState("");
  // ======================
  // AUTH CHECK
  // ======================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // ======================
  // FETCH DOCUMENTS
  // ======================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setUser(storedUser);
  }, []);
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await API.get("/document");

      setDocuments(res.data.documents);
    } catch (err) {
      console.log(err);

      toast.error("Failed To Fetch Documents");
    } finally {
      setLoading(false);
    }
  };
  // ======================
  // MESSAGE
  // ======================

  // ======================
  // LOGOUT
  // ======================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    toast.success("Logout Successful");

    navigate("/");
  };

  // ======================
  // FILE UPLOAD
  // ======================

  const uploadFile = async () => {
    if (!file) {
      return toast.error("Please Select File");
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append("documentType", documentType);

      console.log(documentType);

      await API.post("/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setUploadProgress(percent);
        },
      });

      toast.success("File Uploaded Successfully");

      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

      setFile(null);

      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchDocuments();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Upload Failed");
      // RESET FILE + PREVIEW

      setFile(null);

      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  // ======================
  // UPDATE STATUS
  // ======================

  const updateStatus = async (id, status, comment) => {
    try {
      await API.put(`/document/${id}`, { status, comment });

      toast.success(`Document ${status}`);

      fetchDocuments();
    } catch (err) {
      console.log(err);

      console.log(err.response.data);
      toast.error("Status Update Failed");
    }
  };

  // ======================
  // DELETE DOCUMENT
  // ======================

  const deleteDocument = async (id) => {
    try {
      await API.delete(`/document/${id}`);

      toast.success("Document Deleted");

      fetchDocuments();
    } catch (err) {
      console.log(err);

      toast.error("Delete Failed");
    }
  };

  const downloadPDF = async (reportId) => {
    try {
      const input = document.getElementById(reportId);

      const charts = input.querySelectorAll("svg");

      if (!input) {
        toast.error("Report Not Found");

        return;
      }

      const canvas = await html2canvas(input, {
        scale: 1,

        useCORS: true,

        backgroundColor: "#ffffff",

        logging: false,

        removeContainer: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      if (!imgData) {
        toast.error("Image Capture Failed");

        return;
      }
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save("Financial_Report.pdf");

      toast.success("PDF Downloaded");
    } catch (err) {
      console.log(err);

      toast.error("PDF Failed");
    }
  };
  // STATUS STYLE
  // ======================

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  // ======================
  // FILTER
  // ======================

  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = doc.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : doc.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ======================
  // STATS
  // ======================

  const totalDocs = documents.length;

  const approvedDocs = documents.filter(
    (doc) => doc.status === "approved",
  ).length;

  const pendingDocs = documents.filter(
    (doc) => doc.status === "pending",
  ).length;

  const rejectedDocs = documents.filter(
    (doc) => doc.status === "rejected",
  ).length;

  // ======================
  // CHART DATA
  // ======================

  const pieData = [
    {
      name: "Approved",
      value: approvedDocs,
    },

    {
      name: "Pending",
      value: pendingDocs,
    },

    {
      name: "Rejected",
      value: rejectedDocs,
    },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  const barData = [
    {
      name: "Approved",
      value: approvedDocs,
    },

    {
      name: "Pending",
      value: pendingDocs,
    },

    {
      name: "Rejected",
      value: rejectedDocs,
    },
  ];

  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <Toaster position="top-right" />
      {/* SIDEBAR */}

      <div
        className={`w-[260px] p-6 hidden md:flex flex-col justify-between transition-all duration-300 ${
          darkMode ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold mb-10">CA Smart Finace AI</h1>

          <div className="space-y-4">
            <button className="w-full text-left bg-white/10 p-3 rounded-xl">
              Dashboard
            </button>

            <button className="w-full text-left hover:bg-white/10 p-3 rounded-xl transition">
              Pending Docs
            </button>

            <button className="w-full text-left hover:bg-white/10 p-3 rounded-xl transition">
              Approved Docs
            </button>

            <button className="w-full text-left hover:bg-white/10 p-3 rounded-xl transition">
              Rejected Docs
            </button>
          </div>
        </div>

        <button onClick={handleLogout} className="bg-red-600 py-3 rounded-xl">
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 p-6">
        {/* TOP BAR */}

        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold">
            {user?.role === "ca"
              ? "CA Smart Finace AI"
              : "Smart Finace Dashboard"}
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition md:hidden"
          >
            Logout
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div
            className={`p-5 rounded-2xl shadow transition-all duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-gray-500">Total Docs</h2>

            <p className="text-3xl font-bold">{totalDocs}</p>
          </div>

          <div className="bg-green-100 p-5 rounded-2xl shadow">
            <h2>Approved</h2>

            <p className="text-3xl font-bold">{approvedDocs}</p>
          </div>

          <div className="bg-yellow-100 p-5 rounded-2xl shadow">
            <h2>Pending</h2>

            <p className="text-3xl font-bold">{pendingDocs}</p>
          </div>

          <div className="bg-red-100 p-5 rounded-2xl shadow">
            <h2>Rejected</h2>

            <p className="text-3xl font-bold">{rejectedDocs}</p>
          </div>
        </div>

        {/* CHARTS */}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* PIE CHART */}

          <div
            className={`p-6 rounded-2xl shadow transition-all duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-2xl font-bold mb-5">
              Finance Analytics Overview
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}

          <div
            className={`p-6 rounded-2xl shadow transition-all duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-2xl font-bold mb-5">
              Document Verification Analytics
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  <Cell fill="#22c55e" />

                  <Cell fill="#eab308" />

                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MESSAGE */}

        {/* UPLOAD */}

        <div
          className={`p-6 rounded-2xl shadow mb-8 transition-all duration-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDocumentType("pan")}
              className={`px-4 py-2 rounded-xl ${
                documentType === "pan"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              PAN Card
            </button>

            <button
              type="button"
              onClick={() => setDocumentType("aadhaar")}
              className={`px-4 py-2 rounded-xl ${
                documentType === "aadhaar"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Aadhaar Card
            </button>

            <button
              type="button"
              onClick={() => setDocumentType("bank_statement")}
              className={`px-4 py-2 rounded-xl ${
                documentType === "bank_statement"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Bank Statement
            </button>

            <button
              type="button"
              onClick={() => setDocumentType("form16")}
              className={`px-4 py-2 rounded-xl ${
                documentType === "form16"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Form 16
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();

              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();

              setDragActive(false);

              const droppedFile = e.dataTransfer.files[0];

              if (droppedFile) {
                setFile(droppedFile);

                setPreview(URL.createObjectURL(droppedFile));
              }
            }}
            className={`flex flex-col md:flex-row gap-4 items-center border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"
            }`}
          >
            <div className="text-center">
              <p className="text-lg font-semibold">📂 Drag & Drop File Here</p>

              <p className="text-sm text-gray-500 mt-1">
                OR Click Below To Upload
              </p>

              <p className="text-sm font-medium mt-3">
                {documentType === "pan"
                  ? "Select PAN Card Image"
                  : documentType === "aadhaar"
                    ? "Select Aadhaar Card Image"
                    : documentType === "form16"
                      ? "Select Form 16 PDF"
                      : "Select Bank Statement PDF / Image"}
              </p>
            </div>

            <input
              hidden
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files[0];

                setFile(selectedFile);

                if (selectedFile) {
                  setPreview(URL.createObjectURL(selectedFile));
                }
              }}
              className="border p-3 rounded-xl w-full"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="bg-white border px-5 py-3 rounded-xl shadow"
            >
              Choose File
            </button>
            <button
              type="button"
              onClick={uploadFile}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}
          </div>
          {uploading && (
            <div className="w-full">
              <div className="bg-gray-300 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>

              <p className="text-sm mt-2">Uploading: {uploadProgress}%</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold animate-pulse">
              ✅ File Uploaded Successfully
            </div>
          )}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-40 rounded-xl border mt-4"
            />
          )}
        </div>

        <div
          className={`p-6 rounded-2xl shadow mb-8 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-2xl font-bold mb-5">Recent Activity</h2>

          <div className="space-y-4">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc._id} className="border-b pb-3">
                <p className="font-semibold">{doc.name}</p>

                <p className="text-sm text-gray-500">
                  {doc.documentType === "pan"
                    ? "PAN Card"
                    : doc.documentType === "aadhaar"
                      ? "Aadhaar Card"
                      : doc.documentType === "form16"
                        ? "Form 16"
                        : "Bank Statement"}{" "}
                  • {doc.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH */}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-xl w-full"
          />

          <div className="flex gap-3 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl capitalize transition ${
                  statusFilter === status
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* DOCUMENTS */}

        {loading ? (
          <h1 className="text-2xl font-bold">Loading...</h1>
        ) : filteredDocuments.length === 0 ? (
          <div
            className={`p-6 rounded-2xl shadow transition-all duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            No Documents Found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => {
              const chartData = [
                {
                  name: "UPI",
                  value: doc.upiSpend || 0,
                },

                {
                  name: "ATM",
                  value: doc.atmWithdrawals || 0,
                },

                {
                  name: "Credit",
                  value: doc.totalCredit || 0,
                },
              ];

              const monthlyTrendData = [
                {
                  month: "May",
                  spending: doc.upiSpend || 0,
                },
              ];
              return (
                <div
                  key={doc._id}
                  id={`report-${doc._id}`}
                  className={`p-5 rounded-2xl shadow hover:shadow-xl transition-all duration-300 ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                  }`}
                >
                  <div className="mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        doc.documentType === "pan"
                          ? "bg-blue-600"
                          : doc.documentType === "aadhaar"
                            ? "bg-green-600"
                            : doc.documentType === "form16"
                              ? "bg-orange-600"
                              : "bg-purple-600"
                      }`}
                    >
                      {" "}
                      {doc.documentType === "pan"
                        ? "PAN CARD"
                        : doc.documentType === "aadhaar"
                          ? "AADHAAR CARD"
                          : doc.documentType === "form16"
                            ? "FORM 16"
                            : "BANK STATEMENT"}{" "}
                    </span>
                  </div>
                  {doc.fraudWarning && (
                    <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl mb-3 font-semibold">
                      ⚠️ Suspicious Document
                    </div>
                  )}

                  <h2 className="text-2xl font-bold mb-3 break-words">
                    {doc.name}
                  </h2>

                  {doc.documentType === "pan" && (
                    <>
                      <p>
                        <b>Name:</b> {doc.name}
                      </p>
                      <p>
                        <b>PAN:</b> {doc.panNumber || "Not Found"}
                      </p>

                      <p>
                        <b>DOB:</b> {doc.dob || "Not Found"}
                      </p>
                    </>
                  )}

                  {doc.documentType === "aadhaar" && (
                    <>
                      <p>
                        <b>Name:</b> {doc.name}
                      </p>
                      <p>
                        <b>Aadhaar:</b> {doc.aadhaarNumber || "Not Found"}
                      </p>

                      <p>
                        <b>DOB:</b> {doc.dob || "Not Found"}
                      </p>
                    </>
                  )}

                  {doc.documentType === "bank_statement" && (
                    <>
                      <p>
                        <b>Bank:</b> {doc.bankName}
                      </p>

                      <p>
                        <b>Account:</b> {doc.accountNumber}
                      </p>

                      <p>
                        <b>Opening:</b> ₹{doc.openingBalance}
                      </p>

                      <p>
                        <b>Closing:</b> ₹{doc.closingBalance}
                      </p>

                      <p>
                        <b>Transactions:</b> {doc.transactionCount || 0}
                      </p>

                      <p>
                        <b>Total Credit:</b> ₹{doc.totalCredit || 0}
                      </p>

                      <p>
                        <b>Total Debit:</b> ₹{doc.totalDebit || 0}
                      </p>

                      <p>
                        <b>Risk:</b>{" "}
                        <span
                          className={`font-bold ${
                            doc.riskLevel === "High"
                              ? "text-red-600"
                              : doc.riskLevel === "Medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {doc.riskLevel}
                        </span>
                      </p>

                      <div className="mt-3">
                        <p>
                          <b>Fraud Score:</b>{" "}
                          <span
                            className={`font-bold ${
                              doc.fraudScore > 70
                                ? "text-red-600"
                                : doc.fraudScore > 40
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {doc.fraudScore || 0}%
                          </span>
                        </p>

                        <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                          <div
                            className={`h-3 rounded-full ${
                              selectedDoc?.fraudScore > 70
                                ? "bg-red-600"
                                : selectedDoc?.fraudScore > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-600"
                            }`}
                            style={{
                              width: `${selectedDoc?.fraudScore || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      {doc.riskReasons?.length > 0 && (
                        <div className="mt-2">
                          <b>Reasons:</b>

                          <ul className="list-disc ml-5">
                            {doc.riskReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-3">
                        {doc.aiSummary?.length > 0 && (
                          <div className="mt-3">
                            <b>AI Summary:</b>

                            <ul className="list-disc ml-5 mt-1">
                              {doc.aiSummary.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4">
                          <div
                            style={{
                              width: "100%",
                              height: 250,
                            }}
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  dataKey="value"
                                  nameKey="name"
                                  outerRadius={80}
                                  isAnimationActive={true}
                                  animationDuration={1500}
                                  label
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell
                                      key={index}
                                      fill={
                                        index === 0
                                          ? "#8b5cf6"
                                          : index === 1
                                            ? "#22c55e"
                                            : "#3b82f6"
                                      }
                                    />
                                  ))}
                                </Pie>

                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-6">
                            <div
                              style={{
                                width: "100%",
                                height: 250,
                              }}
                            >
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyTrendData}>
                                  <CartesianGrid strokeDasharray="3 3" />

                                  <XAxis dataKey="month" />

                                  <YAxis />

                                  <Tooltip />

                                  <Line
                                    type="monotone"
                                    dataKey="spending"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>

                      {doc.suspiciousTransactions?.length > 0 && (
                        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl mt-3 font-semibold">
                          ⚠️ Suspicious Transactions Found
                        </div>
                      )}
                    </>
                  )}

                  {doc.documentType === "form16" && (
                    <>
                      <p><b>Employee:</b> {doc.employeeName || doc.name}</p>
                      <p>
                        <b>FY:</b> {doc.financialYear}
                      </p>
                      <p><b>AY:</b> {doc.assessmentYear || "Not Found"}</p>
                      <p><b>PAN:</b> {doc.panNumber || "Not Found"}</p>
                      <p><b>TAN:</b> {doc.tanNumber || "Not Found"}</p>
                      <p><b>Certificate No:</b> {doc.certificateNumber || "Not Found"}</p>
                      <hr className="my-2"/>
                      <p>
                        <b>Gross Salary:</b> ₹{doc.grossSalary}
                      </p>

                      <p>
                        <b>Taxable Income:</b> ₹{doc.taxableIncome || 0}
                      </p>
                      <p><b>Total Deduction:</b> ₹{doc.totalDeduction || 0}</p>
                      <p><b>TDS Deducted:</b> ₹{doc.tds || 0}</p>
                      <p>
                        <b>Tax Payable:</b> ₹{doc.taxPayable || 0}
                      </p>
                    </>
                  )}
                  <p className="mb-4">
                    <b>OCR Confidence:</b>{" "}
                    <span
                      className={`font-bold ${
                        doc.confidence > 80
                          ? "text-green-600"
                          : doc.confidence > 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {doc.confidence || 0}%
                    </span>
                  </p>

                  <span
                    className={`px-4 py-2 rounded-full text-sm ${getStatusStyle(
                      doc.status,
                    )}`}
                  >
                    {doc.status}
                  </span>

                  {doc.isVerified ? (
                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded-xl mt-3 font-bold">
                      ✅ Verified
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl mt-3 font-bold">
                      ❌ Not Verified
                    </div>
                  )}

                  <select
                    value={doc.comment || ""}
                    onChange={(e) => {
                      const updatedDocs = documents.map((d) =>
                        d._id === doc._id
                          ? {
                              ...d,
                              comment: e.target.value,
                            }
                          : d,
                      );

                      setDocuments(updatedDocs);
                    }}
                    className="w-full border rounded-xl p-3 mb-4 text-black"
                  >
                    <option value="">Select Reject Reason</option>

                    {rejectReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>

                  {/* BUTTONS */}

                  <div className="flex gap-2 mt-5 flex-wrap">
                    {doc.file?.includes(".pdf") ? (
                      <a
                        href={`${window.location.origin}${doc.file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                      >
                        View PDF
                      </a>
                    ) : (
                      <a
                        href={`${window.location.origin}${doc.file}`}
                        download
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                      >
                        View Image
                      </a>
                    )}

                    {user?.role === "ca" && (
                      <>
                        <button
                          disabled={doc.status === "rejected"}
                          onClick={() =>
                            updateStatus(doc._id, "approved", doc.comment)
                          }
                          className={`px-4 py-2 rounded-xl text-white ${
                            doc.status === "rejected"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600"
                          }`}
                        >
                          Approve
                        </button>

                        <button
                          disabled={doc.status === "approved"}
                          onClick={() =>
                            updateStatus(doc._id, "rejected", doc.comment)
                          }
                          className={`px-4 py-2 rounded-xl text-white ${
                            doc.status === "approved"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600"
                          }`}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              "Are you sure you want to delete this document?",
                            );

                            if (confirmDelete) {
                              deleteDocument(doc._id);
                            }
                          }}
                          className="bg-black text-white px-4 py-2 rounded-xl"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => downloadPDF(`report-${doc._id}`)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                        >
                          Download PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}

        {selectedDoc && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div
              className={`rounded-3xl p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
            >
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute top-4 right-4 text-2xl"
              >
                ✖
              </button>

              <h2 className="text-3xl font-bold mb-6 break-words">
                {selectedDoc.name}
              </h2>

              {selectedDoc.file?.includes(".pdf") ? (
                <iframe
                  src={`${window.location.origin}${selectedDoc.file}`}
                  title="PDF Preview"
                  className="w-full h-[500px] rounded-2xl border"
                />
              ) : (
                <img
                  src={`${window.location.origin}${selectedDoc.file}`}
                  alt="Document"
                  className="w-full rounded-2xl border"
                />
              )}

              <div className="mt-6 space-y-3 text-lg">
                {selectedDoc.documentType === "bank_statement" && (
                  <div className="bg-gray-100 text-black p-4 rounded-2xl mb-4">
                    <h2 className="text-xl font-bold mb-3">
                      AI Financial Summary
                    </h2>

                    <div className="space-y-2 text-sm">
                      <p>
                        <b>Bank:</b> {selectedDoc.bankName || "Not Found"}
                      </p>

                      <p>
                        <b>Account:</b>{" "}
                        {selectedDoc.accountNumber || "Not Found"}
                      </p>

                      <p>
                        <b>Opening:</b> ₹{selectedDoc.openingBalance || "0"}
                      </p>

                      <p>
                        <b>Closing:</b> ₹{selectedDoc.closingBalance || "0"}
                      </p>

                      <p>
                        <b>Transactions:</b> {selectedDoc.transactionCount || 0}
                      </p>

                      <p>
                        <b>Risk:</b>{" "}
                        {selectedDoc.suspiciousTransactions?.length > 0
                          ? "Suspicious"
                          : "Safe"}
                      </p>
                      <div className="mt-3">
                        <p>
                          <b>Fraud Score:</b>{" "}
                          <span
                            className={`font-bold ${
                              selectedDoc?.fraudScore > 70
                                ? "text-red-600"
                                : selectedDoc?.fraudScore > 40
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {selectedDoc?.fraudScore || 0}%
                          </span>
                        </p>

                        <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                          <div
                            className={`h-3 rounded-full ${
                              doc.fraudScore > 70
                                ? "bg-red-600"
                                : doc.fraudScore > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-600"
                            }`}
                            style={{
                              width: `${doc.fraudScore || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p>
                  <b>PAN:</b> {selectedDoc.panNumber}
                </p>

                <p>
                  <b>DOB:</b> {selectedDoc.dob}
                </p>

                {selectedDoc.bankName && (
                  <p>
                    <b>Bank:</b> {selectedDoc.bankName}
                  </p>
                )}

                <p>
                  <b>Status:</b>
                  {selectedDoc.comment && (
                    <p className="mt-3">
                      <b>Comment:</b> {selectedDoc.comment}
                    </p>
                  )}{" "}
                  <span
                    className={`px-4 py-2 rounded-full text-sm ${getStatusStyle(
                      selectedDoc.status,
                    )}`}
                  >
                    {selectedDoc.status}
                  </span>
                </p>

                <p className="mb-2">
                  <b>Type:</b>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white ${
                      selectedDoc.documentType === "pan"
                        ? "bg-blue-600"
                        : selectedDoc.documentType === "aadhaar"
                          ? "bg-green-600"
                          : "bg-purple-600"
                    }`}
                  >
                    {selectedDoc.documentType}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
