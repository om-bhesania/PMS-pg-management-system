import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  Skeleton,
  Badge,
  useToast,
  Button,
} from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { FaMoneyBill, FaBolt, FaBell, FaUser } from "react-icons/fa";
import { db } from "../firebase/firebase";
import Notify from "../components/notification/notify"; // Include the Notify component

const Profile = () => {
  const [tenantInfo, setTenantInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [rentDue, setRentDue] = useState([]);
  const [eleBill, setEleBill] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const currentEmail = sessionStorage.getItem("email");

      if (!currentEmail) {
        throw new Error("No email found in sessionStorage.");
      }

      const tenantQuery = query(
        collection(db, "tenants"),
        where("tenantEmail", "==", currentEmail)
      );
      const tenantSnapshot = await getDocs(tenantQuery);

      if (tenantSnapshot.empty) {
        throw new Error("No tenant found with the provided email.");
      }

      const tenantData = tenantSnapshot.docs[0].data();
      setTenantInfo(tenantData);

      const roomNumber = tenantData.tenantRoom;

      const rentDueQuery = query(
        collection(db, "rentdue"),
        where("roomNumber", "==", roomNumber)
      );
      const rentDueSnapshot = await getDocs(rentDueQuery);
      const filteredRentDue = rentDueSnapshot.docs
        .map((doc) => doc.data())
        .filter((rent) => isBillDue(rent.dueDate));

      setRentDue(filteredRentDue);

      const eleBillQuery = query(
        collection(db, "eleBill"),
        where("roomNumber", "==", roomNumber)
      );
      const eleBillSnapshot = await getDocs(eleBillQuery);
      const filteredEleBill = eleBillSnapshot.docs
        .map((doc) => doc.data())
        .filter((bill) => isBillDue(bill.dueDate));

      setEleBill(filteredEleBill);

      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error fetching profile data",
        description:
          error.message || "An error occurred while fetching profile data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  fetchProfileData();
}, [toast]);
  

  const isBillDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const differenceInTime = due.getTime() - today.getTime();
    const daysDifference = differenceInTime / (1000 * 3600 * 24);
    return daysDifference <= 7;
  };


  return (
    <Box p={6} className="bg-white rounded-lg shadow-lg">
      <Skeleton isLoaded={!isLoading}>
        {tenantInfo ? (
          <>
            <Flex direction="column" gap={6}>
              <Heading as="h1" size="xl" className="text-primary">
                Welcome, {tenantInfo.tenantName}
              </Heading>

              {/* Room Information */}
              <StatGroup className=" p-4 rounded-lg shadow-md">
                <Stat>
                  <StatLabel>Room Number</StatLabel>
                  <StatNumber>{tenantInfo.tenantRoom}</StatNumber>
                  {roomInfo && (
                    <StatHelpText>Total Beds: {roomInfo.beds}</StatHelpText>
                  )}
                </Stat>
              </StatGroup>

              {/* Current Rent Due Information */}
              <Heading as="h2" size="lg" className="text-primary">
                Rent Due
              </Heading>
              <List spacing={3} className=" p-4 rounded-lg shadow-md">
                {rentDue.length === 0 ? (
                  <ListItem>
                    <Badge
                      variant={"outline"}
                      colorScheme="blue"
                      px={"50px"}
                      py={"10px"}
                    >
                      No rent due
                    </Badge>
                  </ListItem>
                ) : (
                  rentDue.map((rent, index) => (
                    <ListItem key={index} className="flex items-center gap-3">
                      <FaMoneyBill className="text-primary" />
                      <Text>
                        ₹ {rent.amount} - Due on {rent.dueDate}
                      </Text>
                    </ListItem>
                  ))
                )}
              </List>

              {/* Historical Information */}
              <Flex direction="column" gap={6} mt={8}>
                {/* Electricity Bills */}
                <Heading as="h3" size="md" className="text-primary">
                  Electricity Bills
                </Heading>
                <List spacing={3} className=" p-4 rounded-lg shadow-md">
                  {eleBill.length === 0 ? (
                    <ListItem>
                      <Badge
                        variant={"outline"}
                        colorScheme="blue"
                        px={"50px"}
                        py={"10px"}
                      >
                        No electricity bills
                      </Badge>
                    </ListItem>
                  ) : (
                    eleBill.map((bill, index) => (
                      <ListItem key={index} className="flex items-center gap-3">
                        <FaBolt className="text-primary" />
                        <Text>
                          ₹ {bill.amount} - Due on {bill.dueDate}
                        </Text>
                      </ListItem>
                    ))
                  )}
                </List>
                {/* Notifications */}
                <Heading as="h3" size="md" className="text-primary">
                  Notifications
                </Heading>
                <Notify onlyNotification /> {/* Include the Notify component */}
              </Flex>

              {/* Logout Button */}
              <Flex justifyContent="flex-end" mt={6}>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    sessionStorage.clear();
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </Button>
              </Flex>
            </Flex>
          </>
        ) : (
          <Text>Error loading profile data</Text>
        )}
      </Skeleton>
    </Box>
  );
};

export default Profile;
