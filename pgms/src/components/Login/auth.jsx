import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({component: Component}) => {
  const [LoggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let login = localStorage.getItem("token");
    if (!login) {
      navigate("/login");
    } else {
      navigate("/dashboard");
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
