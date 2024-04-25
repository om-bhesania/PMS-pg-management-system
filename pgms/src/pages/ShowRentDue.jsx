import React, { useEffect, useState } from "react";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import {
  Box,
  Skeleton,
  Stack,
  Switch,
  Text,
  useToast,
  IconButton,
  Badge,
} from "@chakra-ui/react";

import { db } from "../firebase/firebase";
import Title from "../components/utils/Title";
import useFirestoreData from "../hooks/useFireStoreData";
import useGetData from "../hooks/getData";
import Button from "../components/utils/Button";

const sendNotification = async (roomNumber, rentPeriod) => {
  // Placeholder for sending notifications, replace with your implementation
  try {
    console.log(
      `Sending notification to room ${roomNumber} for rent period ${rentPeriod.start} - ${rentPeriod.end}`
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
};

const ShowRentDue = () => {
  const toast = useToast();
  const {
    rentDue,
    loading: rentDueLoading,
    error: rentDueError,
  } = useFirestoreData();
  const {
    tenants,
    loading: tenantsLoading,
    error: tenantsError,
  } = useGetData();
  const [roomRents, setRoomRents] = useState([]);
  const [updating, setUpdating] = useState(false);

  const handleSendNotification = async (roomNumber, rentPeriod) => {
    const { success, error } = await sendNotification(roomNumber, rentPeriod);
    if (success) {
      toast({
        title: "Notification sent",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Error sending notification",
        description: error?.message || "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePaymentStatusChange = async (
    roomNumber,
    rentPeriod,
    newStatus
  ) => {
    setUpdating(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rentdue"));
      const rentDueToUpdate = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((rent) => rent.rents.some((r) => r.roomNumber === roomNumber));

      if (!rentDueToUpdate) {
        throw new Error(`Rent due for room ${roomNumber} not found`);
      }

      const rentPeriodToUpdate = rentDueToUpdate.rents.find(
        (rent) =>
          rent.roomNumber === roomNumber &&
          rent.rentPeriodStart === rentPeriod.start &&
          rent.rentPeriodEnd === rentPeriod.end
      );

      if (!rentPeriodToUpdate) {
        throw new Error(`Rent period not found for room ${roomNumber}`);
      }

      rentPeriodToUpdate.paymentStatus = newStatus ? "complete" : "pending";

      await updateDoc(doc(db, "rentdue", rentDueToUpdate.id), {
        rents: rentDueToUpdate.rents,
      });

      toast({
        title: "Payment status updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating payment status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (rentDueLoading || tenantsLoading) return;

    const groupedRents = {};

    rentDue.forEach((rentDoc) => {
      rentDoc.rents.forEach((rent) => {
        const roomNumber = rent.roomNumber; // Extract room number from the rents array
        if (!groupedRents[roomNumber]) {
          groupedRents[roomNumber] = {
            roomNumber,
            rents: [],
            tenants: [],
          };
        }
        groupedRents[roomNumber].rents.push(rent); // Group rents by room number
      });
    });

    tenants.forEach((tenant) => {
      const roomNumber = tenant.tenantRoom;
      if (groupedRents[roomNumber]) {
        groupedRents[roomNumber].tenants.push(tenant); // Group tenants by room number
      }
    });

    setRoomRents(Object.values(groupedRents));
  }, [rentDue, tenants]);

  if (rentDueLoading || tenantsLoading) {
    return <Skeleton height="200px">Loading...</Skeleton>;
  }

  if (rentDueError || tenantsError) {
    return (
      <Box>
        <Text color="red.500">
          Error loading data: {rentDueError?.message || tenantsError?.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {roomRents.map(({ roomNumber, rents, tenants }) => (
        <Box
          key={roomNumber}
          p={4}
          borderWidth={1}
          rounded="md"
          boxShadow="md"
          my={4}
        >
          {rents.map((rent) => (
            <>
              <Stack direction="row" justify="space-between" alignItems="center" >
                <Stack isInline spacing={6} className="divide-x-2  flex items-center gap-5">
                  <Title>
                    Room Number:
                    <Text
                      as="span"
                      px={3}
                      py={1}
                      borderWidth={2}
                      borderRadius="md"
                    >
                      {roomNumber}
                    </Text>
                  </Title>
                  <Stack
                    Stack
                    key={rent.rentPeriodStart}
                    direction="row"
                    align="center"
                    justify="space-between"
                    gap={4}
                    className="mr-4 divide-x-2 pl-5"
                  >
                    <Title customClass={"flex items-center gap-2"}>
                      Rent Amount:
                      <Text
                        as="span"
                        px={3}
                        py={1}
                        borderWidth={2}
                        borderRadius="md"
                      >
                        ₹ {rent.rentAmount}
                      </Text>
                    </Title>
                  </Stack>
                </Stack>

                <div className="pl-3 flex items-center gap-5 divide-x-2    ">
                  <Stack direction="row" align="center" className="pl-2">
                    <Title>Payment Status: </Title>
                    <Stack direction={"column"} gap={1} alignItems={"center"}>
                      <Switch
                        isChecked={rent.paymentStatus === "complete"}
                        isDisabled={updating}
                        colorScheme="teal"
                        onChange={(e) =>
                          handlePaymentStatusChange(
                            roomNumber,
                            {
                              start: rent.rentPeriodStart,
                              end: rent.rentPeriodEnd,
                            },
                            e.target.checked
                          )
                        }
                      />
                      <Text fontSize="sm">
                        {rent.paymentStatus === "complete" ? (
                          <>
                            <Badge colorScheme="green">Complete</Badge>
                          </>
                        ) : (
                          <>
                            <Badge colorScheme="red">Pending</Badge>
                          </>
                        )}
                      </Text>
                    </Stack>
                  </Stack>

                  <Title customClass={"flex items-center gap-2 pl-5"}>
                    Notify Tenant:
                    <Button
                      role={"button"}
                      icon={"fa-solid fa-bell-ring"}
                      variant={"secondary"}
                      customClass={
                        "!p-3 text-sm hover:shadow-xl active:scale-[0.5] focus-visible:outline-0"
                      }
                      onClick={() => {
                        const latestRentPeriod = rents[rents.length - 1];
                        handleSendNotification(roomNumber, {
                          start: latestRentPeriod.rentPeriodStart,
                          end: latestRentPeriod.rentPeriodEnd,
                        });
                      }}
                    />
                  </Title>
                </div>
              </Stack>
            </>
          ))}
          <Box overflowX="auto" className="py-4">
            <table className="min-w-full divide-gray-200 divide-y-2 border-t-2 pt-2">
              <thead>
                <tr>
                  <th className="text-center text-sm text-gray-500">
                    Tenant Name
                  </th>
                  <th className="text-center text-sm text-gray-500">
                    Tenant Contact
                  </th>
                  <th className="text-sm text-center text-gray-500">
                    Tenant Email
                  </th>
                  <th className="text-sm text-center text-gray-500">
                    Tenant Room
                  </th>
                </tr>
              </thead>
              <tbody className="">
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
          </Box>
          {rents.map((rent) => (
            <>
              <Title customClass={"flex gap-2 items-center"}>
                Rent Period:
                <Text as="span" px={3} py={1} borderWidth={2} borderRadius="md">
                  {`${rent.rentPeriodStart} - ${rent.rentPeriodEnd}`}
                </Text>
              </Title>
            </>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ShowRentDue;
