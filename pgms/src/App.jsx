import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/sidebar/Sidebar";
import Users from "./pages/Users";
import Electricitybill from "./pages/Electricitybill";
import Rentdue from "./pages/Rentdue";
import Otherexpenses from "./pages/Otherexpenses";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Login/auth";
import { useState } from "react";

function App() {
   const [isLoggedIn, setIsLoggedIn] = useState(
     !!localStorage.getItem("token")
   );
   const [currentUser, setCurrentUser] = useState(
     localStorage.getItem("role") || "Guest"
   );

   const handleLogin = (token, role) => {
     localStorage.setItem("token", token);
     localStorage.setItem("role", role);
     setIsLoggedIn(true);
     setCurrentUser(role);
   };

   const handleLogout = () => {
     localStorage.clear();
     setIsLoggedIn(false);
     setCurrentUser("Guest");
   };

  return (
    <>
      <BrowserRouter>
        <Sidebar
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          currentUser={currentUser}
        >
          <Routes>
            <Route
              path="/"
              element={<ProtectedRoute component={Dashboard} />}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute component={Dashboard} />}
            />
            <Route
              path="/users"
              element={<ProtectedRoute component={Users} />}
            />
            <Route
              path="/electricitybill"
              element={<ProtectedRoute component={Electricitybill} />}
            />
            <Route
              path="/rentdue"
              element={<ProtectedRoute component={Rentdue} />}
            />
            <Route
              path="/otherexpenses"
              element={<ProtectedRoute component={Otherexpenses} />}
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Sidebar>
      </BrowserRouter>
    </>
  );
}

export default App;
