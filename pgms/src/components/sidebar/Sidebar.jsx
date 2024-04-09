import { useState } from "react";
import { Link } from "react-router-dom";

const navitems = ["Login", "Dashboard"];

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
    <>
      <div
        className={`flex flex-col md:flex-row bg-gray-200 ${customClass} h-[100vh]`}
      >
        <div className="w-full md:w-64 lg:w-80 bg-white shadow-xl border-e-2 border-primary">
          <div className="flex items-center justify-center mt-10 text-primary text-4xl font-bold">
            PMS {currentUser === "owner" ? "Owner" : currentUser}
          </div>
          <nav>
            <ul className="mt-10">
              {navitems.map((item, index) => (
                <div key={index}>
                  {item === "Login" ? (
                    <>
                      <Link
                        to={`/${item.toLowerCase().replace(/ /g, "")}`}
                        className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                      >
                        {isLoggedIn ? <Logout /> : "Login"}
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/${item.toLowerCase().replace(/ /g, "")}`}
                      className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                    >
                      {item}
                    </Link>
                  )}
                </div>
              ))}
              <div className="relative">
                <Link
                to={'/users'}
                  className="py-2 px-4 rounded flex justify-between items-center w-full hover:bg-primary hover:text-white transition duration-300 font-bold"
                  onClick={toggleDropdown}
                >
                  Users
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
          </nav>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto p-10">{children}</div>
      </div>
    </>
  );
};

export default Sidebar;

const Logout = () => {
  return (
    <button
      onClick={() => {
        window.localStorage.clear();
        window.location.href = "/";
        window.location.reload();
      }}
    >
      Logout
    </button>
  );
};
