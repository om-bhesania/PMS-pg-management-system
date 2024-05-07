import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ component: Component }) => {
  const [LoggedIn, setLoggedIn] = useState(false);
  const [Role, setRole] = useState("");

  const getRole = () => {
    const currentRole = sessionStorage.getItem("role");
    setRole(currentRole);
  };

  const navigate = useNavigate();
  useEffect(() => { 
    getRole();
    let login = localStorage.getItem("token");
    if (!login) {
      navigate("/login");
    } else {
      setLoggedIn(true);
    }
  }, []);
  return (
    <>
      <Component />
    </>
  );
};

export default ProtectedRoute;
