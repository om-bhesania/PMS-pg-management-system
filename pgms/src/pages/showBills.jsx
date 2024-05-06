import React, { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  Badge,
  Box,
  Flex,
  Skeleton,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import useFirestoreData from "../hooks/useFireStoreData";
import useGetData from "../hooks/getData";
import Title from "../components/utils/Title";
import { db } from "../firebase/firebase";
import Button from "../components/utils/Button";
import useAddData from "../hooks/addData";
import Notify from "./../components/notification/notify";
import { PropTypes } from "prop-types";
import NoDataCard from "../components/utils/noDataCard";

const ShowBills = ({ values }) => {
  const toast = useToast();
  const {
    eleBill,
    loading: eleBillLoading,
    error: eleBillError,
  } = useFirestoreData();
  const {
    tenants,
    loading: tenantsLoading,
    error: tenantsError,
  } = useGetData();
  const [roomTenants, setRoomTenants] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [category, setCategory] = useState();

  const handlePaymentStatusChange = async (billId, newStatus) => {
    setUpdating(true);
    console.log(billId + " " + newStatus);
    try {
      await updateDoc(doc(db, "eleBill", billId), {
        paymentStatus: newStatus ? "complete" : "pending",
      });

      toast({
        title: "Payment status updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast({
        title: "Error updating payment status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  ShowBills.propTypes = {
    values: PropTypes.array.isRequired,
  };

  useEffect(() => {
    setCategory(window.location.pathname.replace("/", " "));
  }, []);
  useEffect(() => {
    if (eleBillLoading || tenantsLoading) {
      return;
    }
    const groupedTenants = eleBill.reduce((acc, bill) => {
      const roomNumber = bill.roomNumber;
      const paymentStatus = bill.paymentStatus || "pending";
      if (!acc[roomNumber]) {
        acc[roomNumber] = {
          roomNumber,
          tenants: [],
          paymentStatus,
        };
      }

      return acc;
    }, {});

    tenants.forEach((tenant) => {
      const roomNumber = tenant.tenantRoom;
      if (groupedTenants[roomNumber]) {
        groupedTenants[roomNumber].tenants.push(tenant);
      }
    });

    setRoomTenants(Object.values(groupedTenants));
  }, [eleBillLoading, tenantsLoading, eleBill, tenants]);

  if (eleBillError || tenantsError) {
    return (
      <Box>
        <Text color="red.500">
          Error loading data: {eleBillError?.message || tenantsError?.message}
        </Text>
      </Box>
    );
  }

  if (eleBillLoading || tenantsLoading) {
    return <Skeleton>Loading...</Skeleton>;
  }

  const billId = eleBill.map((bill) => {
    return bill.bills.map((bills) => {
      return bills.id;
    });
  });
  const dividedBill = (roomNumber) => {
    // Ensure roomBillGroups is properly initialized
    if (!roomBillGroups || !roomBillGroups[roomNumber]) {
      return 0; // If the room number doesn't exist, return 0
    }

    const bills = roomBillGroups[roomNumber]; // Get bills for the specified room
    const totalAmount = bills.reduce(
      (acc, bill) => acc + (bill.billAmount || 0), // Sum bill amounts
      0
    );

    const tenantsInRoom = roomTenants.find((r) => r.roomNumber === roomNumber);

    const tenantsCount = tenantsInRoom ? tenantsInRoom.tenants.length : 1; // Default to 1 to avoid division by zero

    return totalAmount / tenantsCount; // Return the divided amount
  };

  const sendNotification = async (roomNumber, amount) => {
    try {
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      const notificationMessage = `Due amount for the month of ${currentMonth} is ₹${amount}`;
      const room = roomTenants.find((r) => r.roomNumber === roomNumber);

      if (!room) {
        throw new Error(`Room with number ${roomNumber} not found`);
      }

      const tenantNotifications = room.tenants.reduce((acc, tenant) => {
        const tenantKey = tenant.tenantName.split(" ")[0];
        if (!acc[tenantKey]) {
          acc[tenantKey] = {
            tenantContact: tenant.tenantContact,
            tenantEmail: tenant.tenantEmail,
            categories: {},
          };
        }
        return acc;
      }, {});

      // Ensure category is defined before using it
      if (typeof category === "undefined" || category === "") {
        throw new Error("Category is not defined or is empty.");
      }

      // Add or update the category with the message
      for (const [key, value] of Object.entries(tenantNotifications)) {
        if (!value.categories[category]) {
          value.categories[category] = []; // Initialize category if not present
        }
        value.categories[category].push(notificationMessage); // Add the message
      }

      const roomDocRef = doc(db, "notifications", room.roomNumber);
      const roomDocSnap = await getDoc(roomDocRef);

      if (roomDocSnap.exists()) {
        const existingData = roomDocSnap.data();

        // Update existing data with new tenant notifications
        for (const [key, newNotification] of Object.entries(
          tenantNotifications
        )) {
          if (existingData[key]) {
            const existingCategories = existingData[key].categories;

            // Append to existing category if it exists, else create a new one
            if (!existingCategories[category]) {
              existingCategories[category] = [];
            }
            existingCategories[category].push(notificationMessage);
          } else {
            // Add new tenant if they don't exist in the data
            existingData[key] = newNotification;
          }
        }

        await updateDoc(roomDocRef, existingData); // Update the document
      } else {
        await setDoc(roomDocRef, tenantNotifications); // Create new document
      }

      toast({
        title: "Success",
        description: "Notification(s) sent successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  // Group bills by room number
  const roomBillGroups = eleBill.reduce((acc, bill) => {
    if (!acc[bill.roomNumber]) {
      acc[bill.roomNumber] = [];
    }
    acc[bill.roomNumber].push(bill);
    return acc;
  }, {});

  return (
    <div>
      {values.length > 0 ? (
        <>
          {roomTenants.map(({ roomNumber, paymentStatus, tenants }) => (
            <React.Fragment key={`${roomNumber}-payment-status`}>
              {roomBillGroups[roomNumber].map((billGroup, index) => (
                <div
                  key={roomNumber}
                  className={`border p-2 px-6 my-3 block rounded-xl shadow-lg id-${roomNumber} `}
                >
                  <Title>
                    Room Number:
                    <span className="shadow-lg border-2 px-3 py-1 my-3 ms-2 inline-block rounded-md">
                      {roomNumber}
                    </span>
                  </Title>

                  <Skeleton isLoaded={!tenantsLoading} className="mt-3">
                    <div key={index} className="overflow-x-auto">
                      {/* Display individual bill details */}
                      {billGroup.bills.map((bill, billIndex) => (
                        <div
                          key={billIndex}
                          className="border p-2 mb-2 rounded-md"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Stack direction="row" alignItems="center">
                              <Title>
                                Total Bill:
                                <span
                                  key={index}
                                  className="shadow-lg border-2 border-secondary px-3 py-1 my-3 ms-2 inline-block rounded-md"
                                >
                                  ₹ {bill.billAmount || 0}
                                </span>
                              </Title>
                            </Stack>
                            <Stack
                              direction="row"
                              alignItems="center"
                              gap={5}
                              className="divide-x-2"
                            >
                              <Title className="block ps-3" ps>
                                Notify Tenants:
                                <Button
                                  role="button"
                                  icon="fa-solid fa-bell-ring"
                                  variant="secondary"
                                  customClass="!p-3 text-sm hover:shadow-xl"
                                  onClick={() =>
                                    sendNotification(
                                      roomNumber,
                                      bill.billAmount
                                    )
                                  }
                                />
                              </Title>
                            </Stack>
                          </Stack>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="text-center text-sm text-gray-500 pb-2">
                                  Tenant Name
                                </th>
                                <th className="text-center text-sm text-gray-500 pb-2">
                                  Tenant Contact
                                </th>
                                <th className="text-center text-sm text-gray-500 pb-2">
                                  Tenant Email
                                </th>
                                <th className="text-center text-sm text-gray-500 pb-2">
                                  Tenant Room
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2">
                              {tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                  <td className="text-center font-bold pt-2">
                                    {tenant.tenantName}
                                  </td>
                                  <td className="text-center font-medium pt-2">
                                    {tenant.tenantContact}
                                  </td>
                                  <td className="text-center font-medium pt-2">
                                    {tenant.tenantEmail}
                                  </td>
                                  <td className="text-center font-medium pt-2">
                                    {tenant.tenantRoom}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </Skeleton>
                </div>
              ))}
            </React.Fragment>
          ))}
        </>
      ) : (
        <>
          <NoDataCard message={'*No bill found. If not added yet please add it from above.'} />
        </>
      )}
    </div>
  );
};

export default ShowBills;
