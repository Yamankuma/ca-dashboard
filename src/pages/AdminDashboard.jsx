import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [pendingCA, setPendingCA] = useState([]);


  const [stats, setStats] = useState({
  totalUsers: 0,
  totalCA: 0,
  pendingCA: 0,
  approvedCA: 0,
  rejectedCA: 0,
  totalDocuments: 0,
});
  const fetchPendingCA = async () => {
    try {
      const res = await API.get("/pending-ca");
      setPendingCA(res.data.pendingCA);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStats = async () => {
  try {
    const res = await API.get("/admin-stats");
    setStats(res.data.stats);
  } catch (err) {
    console.log(err);
  }
};
  
  const approveCA = async (id) => {
  try {
    await API.put(`/approve-ca/${id}`);

    alert("CA Approved Successfully");

    fetchPendingCA();
  } catch (err) {
    console.log(err);
  }
};

const rejectCA = async (id) => {
  try {
    await API.put(`/reject-ca/${id}`);

    alert("CA Rejected Successfully");

    fetchPendingCA();
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchPendingCA();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
  <div className="bg-blue-600 text-white p-5 rounded-xl shadow">
    <h2>Total Users</h2>
    <p className="text-3xl font-bold">{stats.totalUsers}</p>
  </div>

  <div className="bg-green-600 text-white p-5 rounded-xl shadow">
    <h2>Total CAs</h2>
    <p className="text-3xl font-bold">{stats.totalCA}</p>
  </div>

  <div className="bg-yellow-500 text-white p-5 rounded-xl shadow">
    <h2>Pending</h2>
    <p className="text-3xl font-bold">{stats.pendingCA}</p>
  </div>

  <div className="bg-emerald-600 text-white p-5 rounded-xl shadow">
    <h2>Approved</h2>
    <p className="text-3xl font-bold">{stats.approvedCA}</p>
  </div>

  <div className="bg-red-600 text-white p-5 rounded-xl shadow">
    <h2>Rejected</h2>
    <p className="text-3xl font-bold">{stats.rejectedCA}</p>
  </div>

  <div className="bg-purple-600 text-white p-5 rounded-xl shadow">
    <h2>Total Documents</h2>
    <p className="text-3xl font-bold">{stats.totalDocuments}</p>
  </div>
</div>

      {pendingCA.length === 0 ? (
        <h2 className="text-xl font-semibold">
          No Pending CA Requests
        </h2>
      ) : (
        pendingCA.map((ca) => (
          <div
            key={ca._id}
            className="bg-white p-6 rounded-xl shadow mb-5"
          >
            <h2 className="text-2xl font-bold">{ca.name}</h2>

            <p>{ca.email}</p>

            <p>Status : {ca.caStatus}</p>
            <div className="flex gap-3 mt-4">
  <button
    onClick={() => approveCA(ca._id)}
    className="bg-green-600 text-white px-4 py-2 rounded-xl"
  >
    Approve
  </button>

  <button
    onClick={() => rejectCA(ca._id)}
    className="bg-red-600 text-white px-4 py-2 rounded-xl"
  >
    Reject
  </button>
</div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;