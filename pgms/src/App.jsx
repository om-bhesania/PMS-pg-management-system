import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase"; // Ensure you've initialized Firebase
import Sidebar, { Logout } from "./components/sidebar/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Electricitybill from "./pages/Electricitybill";
import Rentdue from "./pages/Rentdue";
import Otherexpenses from "./pages/Otherexpenses";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Login/auth";
import { AuthProvider } from "./components/authProvider";
import Notify from "./components/notification/notify";
import TempPassGen from "./pages/tempPassGen";
import ShowBills from "./pages/showBills";
import ShowRentDue from "./pages/ShowRentDue";
import Profile from "./pages/Profile"; // New Profile component
import Button from "./components/utils/Button";
import Title from "./components/utils/Title";
import useGetData from "./hooks/getData";
import SpinnerComponent from "./components/Spinner";
import { Spinner } from "@chakra-ui/react";
import SmallScreenAlert from "./components/SmallScreenAlert";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const { email, password } = Login();
  const { tenantCreds, masterData, Role, mergeTenantData, loading, error } =
    useGetData();
  const [currentEmail, setCurrentEmail] = useState(
    sessionStorage.getItem("email")
  );
  const [tenantName, setTenantName] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchTenantName = async (email) => {
      try {
        // Query the tenants collection to find the name for the current email
        const q = query(
          collection(db, "tenants"),
          where("tenantEmail", "==", email)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("No tenant found with the provided email.");
        } else {
          const tenantDoc = querySnapshot.docs[0]; // Assuming only one tenant per email
          const tenantData = tenantDoc.data();
          setTenantName(tenantData.tenantName);
          setName(tenantData.tenantName.split(" ")[0]);
        }
      } catch (error) {
        console.error("Error fetching tenant name:", error);
      }
    };

    if (currentEmail) {
      fetchTenantName(currentEmail);
    }
  }, [currentEmail]);
  const [currentUser, setCurrentUser] = useState("");

  const getCurrentUserInfo = () => {
    const CurrentUserInfo = sessionStorage.getItem("email");
    setCurrentUser(CurrentUserInfo);
  };

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
          <SmallScreenAlert />
          <Sidebar>
            <div className="flex flex-col gap-1 mb-5  bg-slate-200 p-4 rounded-xl">
              <div className="flex justify-between items-start max-sm:flex-col-reverse max-sm:gap-6">
                <div className="flex flex-col">
                  <Title size={"xl"}>Pg Management Dashboard</Title>
                  <div className="flex gap-1 capitalize text-xl text-gray-5  00 font-medium tracking-[-1.5px]">
                    <span className="inline-block">Welcome</span>
                    <span className="inline-block">
                      {loading ? <Spinner size={"md"} /> : name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isLoggedIn ? (
                    <>
                      <Notify />
                      <Logout />
                      {name ? (
                        <>
                          <Link
                            className="flex items-center justify-center cursor-pointer p-3 rounded-lg text-lg font-bold hover:shadow-2xl hover:shadow-black shadow-lg bg-transparent border-2 border-primary h-[42px] w-[42px] text-primary active:scale-[0.8] ease-in-out duration-300"
                            to={`/profile/${name}`}
                          >
                            {loading ? (
                              <Spinner size={"md"} />
                            ) : (
                              name.split("")[0]
                            )}
                          </Link>
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
                  <Route
                    path="/profile/:name"
                    element={<ProtectedRoute component={Profile} />} // Dynamic route
                  />
                </>
              )}

              <Route path="/login" element={<Login />} />
              <Route path="/passgen" element={<TempPassGen />} />
            </Routes>
          </Sidebar>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
