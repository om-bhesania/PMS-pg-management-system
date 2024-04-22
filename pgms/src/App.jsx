import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import useGetData from "./hooks/getData";
import { AuthProvider } from "./components/authProvider";
import Notify from './components/notification/notify';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState("");

  const getCurrentUserInfo = () => {
    const CurrentUserInfo = sessionStorage.getItem("email");
    setCurrentUser(CurrentUserInfo);
  };
  const { email, password } = Login();
  const { tenantCreds, masterData, Role } = useGetData();
  useEffect(() => {
    if (isLoggedIn) {
      setCurrentUser(sessionStorage.getItem("role"));
    }
    getCurrentUserInfo();
  }, [isLoggedIn]);

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Sidebar>
            <div className="flex flex-col gap-1 mb-5  bg-slate-200 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <Title size={"xl"}>Pg Management Dashboard</Title>
                  <div className="flex gap-1 capitalize text-xl text-gray-5  00 font-medium tracking-[-1.5px]">
                    <span className="inline-block">Welcome</span>
                    <span className="inline-block">{currentUser}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isLoggedIn ? (
                    <>
                     <Notify/>
                      <Logout />
                      {currentUser ? (
                        <>
                          <div
                            className="flex items-center justify-center cursor-pointer p-3 rounded-lg text-lg hover:shadow-2xl hover:shadow-black shadow-lg bg-transparent border-2 border-primary h-[42px] w-[42px] text-primary active:scale-[0.8] ease-in-out duration-300"
                            onClick={() => {
                              window.localStorage.clear();
                              window.location.href = "/";
                              window.location.reload();
                              window.sessionStorage.clear();
                            }}
                          >
                            {currentUser
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase())}
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Button
                        label={"Login"}
                        url={"/login"}
                        variant={"primary"}
                      />
                    </>
                  )}
                </div>
              </div>
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
              {Role && Role === "user" ? null : (
                <>
                  <Route
                    path="/users"
                    element={<ProtectedRoute component={Users} />}
                  />
                  {/* <Route path="/users" element={<Users />} /> */}
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
                </>
              )}

              <Route path="/login" element={<Login />} />
            </Routes>
          </Sidebar>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
