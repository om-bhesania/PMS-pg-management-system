import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Tag,
  CloseButton,
} from "@chakra-ui/react";
import Title from "../utils/Title";

const Notify = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [read, setRead] = useState(false);

  // Fetch logged-in user from session storage
  useEffect(() => {
    const userData = sessionStorage.getItem("data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setLoggedInUser(parsedData.email);
    }
  }, []);

  // Fetch notifications in real time using onSnapshot
  useEffect(() => {
    if (!loggedInUser) return;

    const unsub = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const userNotifications = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          Object.entries(data).forEach(([key, value]) => {
            const emailKey = value.tenantEmail;
            if (emailKey === loggedInUser) {
              userNotifications.push({
                name: key,
                messages: value.messages,
              });
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

    // Clean up the snapshot listener
    return () => unsub();
  }, [loggedInUser]);

  useEffect(() => {
    const unreadCount = notifications.reduce(
      (acc, notif) => acc + notif.messages.filter((msg) => !msg.read).length,
      0
    );
    setRead(unreadCount);
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
  const toggleReadStatus = async (notificationId, messageIndex) => {
    // Toggle the read status of a message
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => {
        if (notif.id === notificationId) {
          return {
            ...notif,
            messages: notif.messages.map((msg, idx) => {
              if (idx === messageIndex) {
                return { ...msg, read: !msg.read };
              }
              return msg;
            }),
          };
        }
        return notif;
      })
    );
  };

return (
  <Menu variant={"solid"}>
    <div className="">
      <MenuButton as={"button"} className="">
        <div className="relative">
          <a
            type="button"
            className="flex items-center justify-center p-3 rounded-lg text-lg shadow-lg bg-primary text-white hover:shadow-2xl hover:shadow-black active:scale-[0.8] ease-in-out duration-300"
          >
            <i className="fa-sharp fa-regular fa-bell "></i>
          </a>

         
                <div>
                    <span className="absolute h-5 w-5 flex items-center justify-center top-0 right-0 -mt-2 -mr-2 px-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {read}
                    </span> 
                </div> 
        </div>
      </MenuButton>
      <MenuList className="w-full p-4">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index}>
              <Text className="text-lg font-bold text-primary pb-2 mb-2 border-b-2">
                Messages ({notification.messages.length})
              </Text>
              {notification.messages.map((msg, idx) => (
                <React.Fragment key={idx}>
                  <MenuItem onClick={toggleReadStatus}>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      gap={5}
                    >
                      <Text className="text-sm font-medium flex-shrink-0">
                        {msg}
                      </Text>
                    </Flex>
                  </MenuItem>
                </React.Fragment>
              ))}
            </div>
          ))
        ) : (
          <MenuItem>
            <Text className="text-danger font-bold">
              No notifications found
            </Text>
          </MenuItem>
        )}
      </MenuList>
    </div>
  </Menu>
);
};

export default Notify;
