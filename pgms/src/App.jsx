import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/sidebar/Sidebar";
import Users from "./pages/Users";
import Electricitybill from "./pages/Electricitybill";
import Rentdue from "./pages/Rentdue";
import Otherexpenses from "./pages/Otherexpenses";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Login/auth";
import { useState } from "react";
import Title from "./components/utils/Title";
import Button from "./components/utils/Button";
import Breadcrumbs from "./components/utils/breadcrumbs";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("role") || "Owner"
  );

  const handleLogin = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setIsLoggedIn(true);
    setCurrentUser(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
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
          <div className="flex flex-col gap-1 mb-5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <Title size={"xl"}>Pg Management Dashboard</Title>
                <div className="flex gap-1 capitalize text-xl text-gray-5  00 font-medium tracking-[-1.5px]">
                  <span className="inline-block">Welcome</span>
                  <span className="inline-block">{currentUser}</span>
                </div>
              </div>
              <button className="flex items-center justify-center p-3 rounded-lg  shadow-lg bg-slate-100 active:scale-[0.8] ease-in-out duration-300">
                <i className="fa-sharp fa-regular fa-bell "></i>
              </button>
            </div>
            <Breadcrumbs />
          </div>
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
