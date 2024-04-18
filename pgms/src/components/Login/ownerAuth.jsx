//Never and not in use

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const OwnerRoute = ({ component: Component }) => {
  const [role, setRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState("user");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const currentRole = sessionStorage.getItem("Role");
    const isLoggedIn = localStorage.getItem("token");
    setRole(currentRole);
    setIsLoggedIn(isLoggedIn);
  }, []);

  useEffect(() => {
    // Check authentication and role
    if (!isLoggedIn || role !== "owner") {
      navigate("/login");
      toast({
        title: "Unauthorized Access",
        description: "You are not authorized as an owner.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [navigate, toast, role, isLoggedIn]);

  return <Component />;
};

export default OwnerRoute;

// deprecated and not in use
