import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../utils/Logo";
import Button from "../utils/Button";

const navitems = ["Dashboard", "Attendance", "Accounts"];

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
              <div className="relative">
                <Link
                  to={"/users"}
                  className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                  onClick={toggleDropdown}
                >
                  Tenents
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
                {/* Dropdown Menu */}
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
            </ul>

            {isLoggedIn ? (
              <Logout />
            ) : (
              <Button label={"Login"} url={"/login"} variant={"primary"} />
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="container">
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
      className="py-2 px-6 border-primary text-secondary border-2  hover:bg-primary hover:text-white ease-in-out rounded text-lg text-center transition duration-300 font-bold"
      onClick={() => {
        window.localStorage.clear();
        window.location.href = "/";
        window.location.reload();
      }}
    >
      <span className="inline-block me-3 ">Logout</span>
      <span className="inline-block">
        <i className="fa-regular fa-right-from-bracket"></i>
      </span>
    </button>
  );
};
