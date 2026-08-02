import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useRequireAuth = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Boolean(user || token);

  const requireAuth = (callbackAction, targetPath) => {
    if (!user && !token) {
      const destination = targetPath || (location.pathname !== "/login" ? location.pathname : "/");
      navigate("/login", {
        state: {
          from: destination,
        },
      });
      return false;
    }
    if (callbackAction) {
      callbackAction();
    } else if (targetPath) {
      navigate(targetPath);
    }
    return true;
  };

  return { isAuthenticated, requireAuth };
};

export default useRequireAuth;
