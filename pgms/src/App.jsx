import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar, { Logout } from "./components/sidebar/Sidebar";
import Users from "./pages/Users";
import Electricitybill from "./pages/Electricitybill";
import Rentdue from "./pages/Rentdue";
import Otherexpenses from "./pages/Otherexpenses";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Login/auth";
import { useEffect, useState } from "react";
import Title from "./components/utils/Title";
import Button from "./components/utils/Button";
import Breadcrumbs from "./components/utils/breadcrumbs";
import useGetData from "./hooks/getData";
import { AuthProvider } from "./components/authProvider";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("role")
  );
  const { email, password } = Login();
  const { tenantCreds, masterData } = useGetData();
  useEffect(() => {
    if (isLoggedIn) {
      setCurrentUser(localStorage.getItem("role"));
    }
  }, [isLoggedIn]);

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Sidebar>
            <div className="flex flex-col gap-1 mb-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <Title size={"xl"}>Pg Management Dashboard</Title>
                  <div className="flex gap-1 capitalize text-xl text-gray-5  00 font-medium tracking-[-1.5px]">
                    <span className="inline-block">Welcome</span>
                    <span className="inline-block">{currentUser}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center justify-center p-3 rounded-lg text-lg shadow-lg bg-primary text-white hover:shadow-2xl hover:shadow-black active:scale-[0.8] ease-in-out duration-300">
                    <i className="fa-sharp fa-regular fa-bell "></i>
                  </button>
                  {isLoggedIn ? (
                    <Logout />
                  ) : (
                    <Button label={"Login"} url={"/login"} variant={"primary"} />
                  )}
                  {isLoggedIn ? (
                    <>
                      {masterData.map((t, id) => (
                        <div key={id}>
                          {t.tenantName.split().map(tenantName => tenantName.charAt(0).toUpperCase())}
                        </div>
                      ))}
                    </>
                  ) : null}
                </div>
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
      </AuthProvider>
    </>
  );
}

export default App;
