import { useSelector, type RootState } from "@/store/store";
import { Navigate } from "react-router-dom";
import Spinner from "@/components/shared/spinner/Spinner";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const authChecked = useSelector((s: RootState) => s.auth.authChecked);

  if (!authChecked) return <Spinner />;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default GuestRoute;
