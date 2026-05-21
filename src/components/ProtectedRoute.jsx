import {
  Navigate,
} from "react-router-dom";

function ProtectedRoute({
  children,
}) {

  // Get Token

  const token =
    localStorage.getItem(
      "token"
    );

  // If no token

  if (!token) {

    return (
      <Navigate to="/" />
    );
  }

  // If token exists

  return children;
}

export default ProtectedRoute;