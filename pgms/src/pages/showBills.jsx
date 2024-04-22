import React, { useEffect, useState } from "react";
import { doc, updateDoc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { Box, Skeleton, Stack, Switch, Text, useToast } from "@chakra-ui/react";
import useFirestoreData from "../hooks/useFireStoreData";
import useGetData from "../hooks/getData";
import Title from '../components/utils/Title';
import { db } from "../firebase/firebase";
import Button from "../components/utils/Button";
import useAddData from "../hooks/addData";
import Notify from './../components/notification/notify';

const ShowBills = () => {
    const toast = useToast();
    const { sendNotify } = useAddData();
    const { eleBill, loading: eleBillLoading, error: eleBillError } = useFirestoreData();
    const { tenants, loading: tenantsLoading, error: tenantsError } = useGetData();
    const [roomTenants, setRoomTenants] = useState([]);
    const [updating, setUpdating] = useState(false);
    const handlePaymentStatusChange = async (roomNumber, newStatus) => {
        setUpdating(true);
        try {
            // Get the document for the specified room number
            const querySnapshot = await getDocs(collection(db, "eleBill"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const billToUpdate = data.find((bill) => bill.roomNumber === roomNumber);

            if (!billToUpdate) {
                throw new Error(`Bill for room ${roomNumber} not found`);
            }

            // Update payment status
            await updateDoc(doc(db, "eleBill", billToUpdate.id), {
                paymentStatus: newStatus ? "complete" : "pending",
            });
            toast({
                title: "Payment status updated",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: 'top',
            })
            console.log(`Updated payment status for room ${roomNumber} to ${newStatus ? "complete" : "pending"}`);
        } catch (err) {
            console.error("Error updating payment status:", err);
            toast({
                title: "Error updating payment status",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: 'top',
            })
        } finally {
            setUpdating(false);
        }
    };

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
                <Text color="red.500">Error loading data: {eleBillError?.message || tenantsError?.message}</Text>
            </Box>
        );
    }

    if (eleBillLoading || tenantsLoading) {
        return <Skeleton>Loading...</Skeleton>;
    }



    const dividedBill = (roomNumber) => {
        const room = roomTenants.find((r) => r.roomNumber === roomNumber);
        if (!room) {
            return 0;
        }

        const totalBill = eleBill
            .filter((bill) => bill.roomNumber === roomNumber)
            .map((bill) => bill.bills?.[0]?.billAmount)
            .reduce((acc, amount) => acc + amount, 0);

        return totalBill / room.tenants.length;
    }

    const sendNotification = async (roomNumber) => {

        try {
            const currentMonth = new Date().toLocaleString("default", { month: "long" });
            const notificationMessage = `Due amount for the month of ${currentMonth} is ₹${dividedBill(roomNumber)}`;
            const room = roomTenants.find((r) => r.roomNumber === roomNumber);
            if (!room) {
                throw new Error(`Room with number ${roomNumber} not found`);
            }
            const tenantNotifications = room.tenants.reduce((acc, tenant) => {
                const tenantKey = tenant.tenantName.split(" ")[0];
                acc[tenantKey] = {
                    tenantContact: tenant.tenantContact,
                    tenantEmail: tenant.tenantEmail,
                    messages: [notificationMessage],
                };
                return acc;
            }, {});
            const roomDocRef = doc(db, "notifications", room.roomNumber);
            const roomDocSnap = await getDoc(roomDocRef);

            if (roomDocSnap.exists()) {
                const existingData = roomDocSnap.data();
                const updatedData = { ...existingData };

                // Update or append new messages for each tenant
                for (const [key, value] of Object.entries(tenantNotifications)) {
                    if (updatedData[key]) {
                        // If the tenant exists, append the message to their array
                        updatedData[key].messages.push(...value.messages);
                    } else {
                        // If the tenant is new, add them with their messages
                        updatedData[key] = value;
                    }
                }

                // Update the document with the new data
                await updateDoc(roomDocRef, updatedData);
            } else {
                // If the document doesn't exist, create a new one with the tenant data
                await setDoc(roomDocRef, tenantNotifications);
            }

            toast({
                title: "Success",
                description: "Notification sent successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again later.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };



    return (
        <div>
            {roomTenants.map(({ roomNumber, paymentStatus, tenants }) => (
                <div key={roomNumber} className="border p-2 px-6 my-3 block rounded-xl shadow-lg">
                    <Stack direction="row" alignItems={'center'} justifyContent={'space-between'}>
                        <Stack direction="row" alignItems={'center'}>
                            <Title>
                                Room Number:
                                <span className="shadow-lg border-2 px-3 py-1 my-3 ms-2 inline-block rounded-md">{roomNumber}</span>
                            </Title>
                            <Title>
                                Total Bill:
                                {eleBill
                                    .filter((bill) => bill.roomNumber === roomNumber)
                                    .map((bill) => (
                                        <span
                                            key={bill.id}
                                            className="shadow-lg border-2 border-secondary px-3 py-1 my-3 ms-2 inline-block rounded-md"
                                        >
                                            ₹ {bill.bills?.[0]?.billAmount}
                                        </span>
                                    ))}
                            </Title>
                        </Stack>
                        <Stack direction="row" alignItems={'center'} gap={5} className="divide-x-2">
                            <Title>
                                <Stack direction="row" alignItems={'center'}>
                                    <Text>Payment Status: </Text>
                                    <Stack alignItems={'center'} >
                                        <Switch
                                            isChecked={paymentStatus === "complete"}
                                            isDisabled={updating}
                                            colorScheme="teal"
                                            onChange={(e) => handlePaymentStatusChange(roomNumber, e.target.checked)}
                                        />
                                        <Text className="text-xs text-gray-500 uppercase">
                                            {paymentStatus === "complete" ? "Complete" : "Pending"}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Title>
                            <Title customClass={'ps-3'}>
                                Notify Tenants:
                                <Button
                                    role={'button'}
                                    icon={'fa-solid fa-bell-ring'}
                                    variant={'secondary'}
                                    customClass={'!p-3 text-sm hover:shadow-xl active:scale-[0.5] focus-visible:outline-0'}
                                    onClick={() => sendNotification(roomNumber)}
                                />
                            </Title>
                        </Stack>
                    </Stack>

                    <Skeleton isLoaded={!tenantsLoading} className="mt-3">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead >
                                    <tr>
                                        <th className="text-center text-sm text-gray-500 pb-2">Tenant Name</th>
                                        <th className="text-center text-sm text-gray-500 pb-2">Tenant Contact</th>
                                        <th className="text-center text-sm text-gray-500 pb-2">Tenant Email</th>
                                        <th className="text-center text-sm text-gray-500 pb-2">Tenant Room</th>
                                        <th className="text-center text-sm text-gray-500 pb-2">Billing Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2">
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id}>
                                            <td className="text-center font-bold pt-2">{tenant.tenantName}</td>
                                            <td className="text-center font-medium pt-2">{tenant.tenantContact}</td>
                                            <td className="text-center font-medium pt-2">{tenant.tenantEmail}</td>
                                            <td className="text-center font-medium pt-2">{tenant.tenantRoom}</td>
                                            <td className="text-center font-bold pt-2 ">₹{dividedBill(roomNumber)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Skeleton>
                </div>
            ))} 
        </div>
    );
};

export default ShowBills;