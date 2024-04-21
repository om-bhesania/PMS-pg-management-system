import React, { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Skeleton, Stack, Switch } from "@chakra-ui/react";
import useFirestoreData from "../hooks/useFireStoreData";
import useGetData from "../hooks/getData";
import Title from '../components/utils/Title';
import { db } from "../firebase/firebase";

const ShowBills = () => {
    const { eleBill, loading: eleBillLoading, error: eleBillError } = useFirestoreData();
    const { tenants, loading: tenantsLoading, error: tenantsError } = useGetData();
    const [roomTenants, setRoomTenants] = useState([]);

    const handlePaymentStatusChange = async (roomNumber, newStatus) => {
        try {
            const roomDocRef = doc(db, "eleBill", roomNumber);

            // Update the 'payment' field for the specified room
            await updateDoc(roomDocRef, {
                payment: newStatus ? "complete" : "pending",
            });

            console.log(`Updated payment status for room ${roomNumber} to ${newStatus ? "complete" : "pending"}`);
        } catch (error) {
            console.error("Error updating payment status:", error);
        }
    };

    useEffect(() => {
        if (eleBillLoading || tenantsLoading) {
            console.log("Data is still loading...");
            return;
        }

        const groupedTenants = {}; // Group tenants by room number
        tenants.forEach((tenant) => {
            const roomNumber = tenant.tenantRoom;
            if (!groupedTenants[roomNumber]) {
                groupedTenants[roomNumber] = [];
            }
            groupedTenants[roomNumber].push(tenant);
        });

        const updatedRoomTenants = Object.entries(groupedTenants).map(([roomNumber, tenants]) => ({
            roomNumber,
            tenants,
        }));

        setRoomTenants(updatedRoomTenants);
    }, [eleBillLoading, tenantsLoading, tenants]);

    if (eleBillError || tenantsError) {
        return <div>Error loading data: {eleBillError?.message || tenantsError?.message}</div>;
    }

    if (eleBillLoading || tenantsLoading) {
        return <Skeleton>Loading...</Skeleton>;
    }

    return (
        <div>
            {roomTenants.map(({ roomNumber, tenants }) => (
                <div key={roomNumber} className="border p-2 px-6 my-3 block rounded-xl shadow-lg">
                    <Stack direction="row">
                        <Title>
                            Room number:
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
                    <Skeleton isLoaded={!tenantsLoading}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="text-center">Tenant Name</th>
                                        <th className="text-center">Tenant Contact</th>
                                        <th className="text-center">Tenant Email</th>
                                        <th className="text-center">Tenant Room</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id}>
                                            <td className="text-center">{tenant.tenantName}</td>
                                            <td className="text-center">{tenant.tenantContact}</td>
                                            <td className="text-center">{tenant.tenantEmail}</td>
                                            <td className="text-center">{tenant.tenantRoom}</td>
                                            <td className="text-center">
                                                <Stack direction="column" align="center">
                                                    <Switch
                                                        colorScheme="teal"
                                                        isChecked={
                                                            eleBill.some(
                                                                (bill) => bill.roomNumber === roomNumber && bill.payment === "complete"
                                                            )
                                                        }
                                                        onChange={(e) => handlePaymentStatusChange(roomNumber, e.target.checked)}
                                                    />
                                                    <span>
                                                        {eleBill.some(
                                                            (bill) => bill.roomNumber === roomNumber && bill.payment === "complete"
                                                        )
                                                            ? "complete"
                                                            : "pending"}
                                                    </span>
                                                </Stack>
                                            </td>
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
