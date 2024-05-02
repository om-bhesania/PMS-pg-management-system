import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Badge,
  Button,
} from "@chakra-ui/react";

const Notify = ({ onlyNotification = false }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const date = new Date();
  date.setDate(date.getDate() + 7);
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Kolkata",
    };
    return date.toLocaleDateString(undefined, options);
  };
  // Fetch logged-in user from session storage
  useEffect(() => {
    const userData = sessionStorage.getItem("data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setLoggedInUser(parsedData.email);
    }
  }, []);

  // Fetch notifications and organize them by category
  useEffect(() => {
    if (!loggedInUser) return;

    const unsub = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const userNotifications = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          Object.entries(data).forEach(([tenantName, details]) => {
            if (details.tenantEmail === loggedInUser) {
              Object.entries(details.categories || {}).forEach(
                ([category, messages]) => {
                  if (!userNotifications[category]) {
                    userNotifications[category] = [];
                  }
                  messages.forEach((message) => {
                    userNotifications[category].push({
                      name: tenantName,
                      message,
                      read: message.read || false,
                    });
                  });
                }
              );
            }
          });
        });

        setNotifications(userNotifications);
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch notifications.");
        setLoading(false);
      }
    );

    return () => unsub(); // Clean up the listener
  }, [loggedInUser]);

  // Calculate unread messages count
  useEffect(() => {
    const unread = Object.values(notifications).reduce(
      (acc, categoryNotifs) =>
        acc +
        categoryNotifs.reduce((innerAcc, notif) => {
          if (!notif.read) {
            innerAcc++;
          }
          return innerAcc;
        }, 0),
      0
    );
    setUnreadCount(unread);
  }, [notifications]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const toggleReadStatus = async (category, notifIndex) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = { ...prevNotifications };
      const categoryNotifs = updatedNotifications[category];

      if (categoryNotifs && categoryNotifs[notifIndex]) {
        // Toggle the read status
        const updatedReadStatus = !categoryNotifs[notifIndex].read;
        categoryNotifs[notifIndex].read = updatedReadStatus;
      }

      return updatedNotifications;
    });
  };

  return (
    <>
      {!onlyNotification ? (
        <>
          <Menu>
            <MenuButton>
              <div className="relative">
                <a
                  type="button"
                  className="flex items-center justify-center p-3 rounded-lg text-lg shadow-lg bg-primary text-white hover:shadow-2xl hover:shadow-black active:scale-[0.8] ease-in-out duration-300"
                >
                  <i className="fa-sharp fa-regular fa-bell"></i>
                </a>

                {unreadCount > 0 && (
                  <span
                    className={` absolute h-5 w-5 flex items-center justify-center top-0 right-0 -mt-2 -mr-2 px-1 text-xs font-semibold text-white bg-red-500 rounded-full`}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </MenuButton>
            <MenuList className="p-3 max-h-[350px] overflow-y-auto space-y-1">
              {Object.entries(notifications).map(
                ([category, categoryNotifs]) => (
                  <div key={category} className="space-y-2">
                    <Text fontWeight="bold" color="blue.500">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    {categoryNotifs.map((notif, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => toggleReadStatus(category, index)}
                        className={` border border-primary/10 rounded-lg p-3 hover:bg-primary/10 transition-colors ease-in-out duration-300`}
                      >
                        <Flex direction={"column"}>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(date)}
                          </Text>
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            gap={15}
                          >
                            <Text>{notif.message}</Text>
                            {!notif.read && (
                              <Badge colorScheme="red">Unread</Badge>
                            )}
                          </Flex>
                        </Flex>
                      </MenuItem>
                    ))}
                  </div>
                )
              )}
            </MenuList>
          </Menu>
        </>
      ) : (
        <>
          {Object.entries(notifications).map(([category, categoryNotifs]) => (
            <div key={category} className="space-y-2">
              <Text fontWeight="bold" color="blue.500">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              {categoryNotifs.map((notif, index) => (
                <div
                  key={index}
                  onClick={() => toggleReadStatus(category, index)}
                  className={` border border-primary/10 rounded-lg p-3 hover:bg-primary/10 transition-colors ease-in-out duration-300`}
                >
                  <Flex direction={"column"}>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(date)}
                    </Text>
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      gap={15}
                    >
                      <Text>{notif.message}</Text>
                      {!notif.read && <Badge colorScheme="red">Unread</Badge>}
                    </Flex>
                  </Flex>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </>
  );
};
export default Notify;
