import {
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";

import Signup from "./pages/Signup";


import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (

    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard */}

      <Route
        path="/dashboard"
        element={

          <ProtectedRoute>

            <Dashboard />

          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;


