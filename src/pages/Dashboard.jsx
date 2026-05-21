import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [file, setFile] = useState(null);

  const [documentType, setDocumentType] = useState("pan");

  const [preview, setPreview] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);
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

      toast.error("Upload Failed");
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
  // ======================
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
          <h1 className="text-3xl font-bold mb-10">CA Panel</h1>

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
            {user?.role === "ca" ? "CA Dashboard" : "User Dashboard"}
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
            <h2 className="text-2xl font-bold mb-5">Document Overview</h2>

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
            <h2 className="text-2xl font-bold mb-5">Status Analytics</h2>

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
                  : "Select Aadhaar Card Image"}
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
                  {doc.documentType === "pan" ? "PAN Card" : "Aadhaar Card"} •{" "}
                  {doc.status}
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
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className={`p-5 rounded-2xl shadow hover:shadow-xl transition-all duration-300 ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                }`}
              >
                <div className="mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      doc.documentType === "pan"
                        ? "bg-blue-600"
                        : "bg-green-600"
                    }`}
                  >
                    {doc.documentType === "pan" ? "PAN CARD" : "AADHAAR CARD"}
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

                <p className="mb-1">
                  <b>PAN:</b> {doc.panNumber || "Not Found"}
                </p>

                <p>
                  <b>Aadhaar:</b> {doc.aadhaarNumber || "Not Found"}
                </p>

                <p className="mb-4">
                  <b>DOB:</b> {doc.dob}
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

                <textarea
                  placeholder="Add Comment..."
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
                />

                {/* BUTTONS */}

                <div className="flex gap-2 mt-5 flex-wrap">
                  {doc.file?.includes(".pdf") ? (
                    <a
                      href={`http://localhost:8080${doc.file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      View PDF
                    </a>
                  ) : (
                    <a
                      href={`http://localhost:8080${doc.file}`}
                      download
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      View Image
                    </a>
                  )}

                  {user?.role === "ca" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(doc._id, "approved", doc.comment)
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-xl"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(doc._id, "rejected", doc.comment)
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-xl"
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
                    </>
                  )}
                </div>
              </div>
            ))}
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
                  src={`http://localhost:8080${selectedDoc.file}`}
                  title="PDF Preview"
                  className="w-full h-[500px] rounded-2xl border"
                />
              ) : (
                <img
                  src={`http://localhost:8080${selectedDoc.file}`}
                  alt="Document"
                  className="w-full rounded-2xl border"
                />
              )}

              <div className="mt-6 space-y-3 text-lg">
                <p>
                  <b>PAN:</b> {selectedDoc.panNumber}
                </p>

                <p>
                  <b>DOB:</b> {selectedDoc.dob}
                </p>

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
                        : "bg-green-600"
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
