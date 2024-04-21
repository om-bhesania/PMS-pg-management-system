import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../utils/Logo";
import Button from "../utils/Button";
import useGetData from "../../hooks/getData";

const navitems = ["Dashboard"];

const userItems = {
  Users: ["Electricity Bill", "Rent Due", "Other Expenses"],
};

const Sidebar = ({
  isLoggedIn,
  onLogout,
  currentUser,
  customClass,
  children,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { Role } = useGetData();
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <section className="font-primary">
      <div
        className={`flex flex-col md:flex-row ${
          customClass ? customClass : ""
        } px-[16px] `}
      >
        <div className="w-full md:w-64 lg:w-80 ">
          <div className="flex items-center justify-start mt-5 text-primary text-4xl font-bold">
            <Logo customClass={"self-start"} />
          </div>
          <nav className="flex justify-between flex-col h-full">
            <ul className="mt-10">
              {navitems.map((item, index) => (
                <div key={index}>
                  <Link
                    to={`/${item.toLowerCase().replace(/ /g, "")}`}
                    className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                  >
                    {item}
                  </Link>
                </div>
              ))}

              {/* Dropdown Menu */}
              {Role && Role === "owner" ? (
                <>
                  <div className="relative">
                    <Link
                      to={"/users"}
                      className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                      onClick={toggleDropdown}
                    >
                      tenants
                      {!isDropdownOpen ? (
                        <img
                          src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png"
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      ) : (
                        <img
                          src="https://img.icons8.com/ios/50/000000/collapse-arrow--v1.png"
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      )}
                    </Link>
                    {isDropdownOpen && (
                      <div className="mt-2 ps-4 ">
                        {userItems.Users.map((item, index) => (
                          <Link
                            key={index}
                            to={`/${item.toLowerCase().replace(/ /g, "")}`}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm font-medium w-full"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="container ms-0 max-w-[1460px]">
          <div className="md:mt-5 md:ms-10">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;

export const Logout = () => {
  return (
    <button
      className="flex items-center justify-center p-3 rounded-lg text-lg hover:shadow-2xl hover:shadow-black shadow-lg bg-primary text-white active:scale-[0.8] ease-in-out duration-300"
      onClick={() => {
        window.localStorage.clear();
        window.location.href = "/";
        window.location.reload();
        window.sessionStorage.clear();
      }}
    >
      <i className="fa-regular fa-right-from-bracket"></i>
    </button>
  );
};
