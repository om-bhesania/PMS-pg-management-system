// ElectricityBill.js
import { useEffect, useState } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import useFirestoreData from '../hooks/useFireStoreData';
import { useToast, FormControl, FormLabel, Input, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import Button from "../components/utils/Button";
import { addDoc, collection, updateDoc, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import useGetData from '../hooks/getData';
import Breadcrumbs from '../components/utils/breadcrumbs';
import ShowBills from './showBills';

const ElectricityBill = () => {
  const { eleBill } = useFirestoreData();
  const { tenants } = useGetData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const toast = useToast();

  const validationSchema = Yup.object().shape({
    billAmount: Yup.number().required("Bill amount is required").min(0),
    billPeriodStart: Yup.date().required("Bill period start is required"),
    billPeriodEnd: Yup.date().required("Bill period end is required"),
  });
  const totalBill = eleBill.map(bill => bill.bills.length > 0 ? true : false);
  const formik = useFormik({
    initialValues: {
      billAmount: "2000",
      billPeriodStart: "",
      billPeriodEnd: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { billAmount, billPeriodStart, billPeriodEnd } = values;

        // Check if a bill already exists for the selected room
        const existingBill = eleBill.find(bill => bill.roomNumber === selectedRoom);

        // Check if the same bill period already exists for the selected room
        if (existingBill && existingBill.bills.some(b => b.billPeriodEnd === billPeriodEnd && b.billPeriodStart === billPeriodStart)) {
          setIsModalOpen(true);
          return;
        }

        const electricityBillData = { 
          billPeriodStart,
          billPeriodEnd,
          billAmount,
          paymentStatus: 'pending',
          id: Math.random().toString(36).substr(2, 9), 
        };

        // If the bill for the room exists, update it
        if (existingBill) {
          existingBill.bills.push(electricityBillData);
          await updateDoc(doc(db, "eleBill", existingBill.id), {
            bills: existingBill.bills,
          });
        } else {
          // Add new bill entry for the room
          const newBillData = {
            roomNumber: selectedRoom,
            bills: [electricityBillData],

          };
          await addDoc(collection(db, "eleBill"), newBillData);
        }

        toast({
          title: "Success",
          description: "Electricity bill added successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        resetForm();
      } catch (error) {
        console.error("Error adding electricity bill:", error);
        toast({
          title: "Error",
          description: "Failed to add electricity bill. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });
  const handleModify = async () => {
    try {
      const existingBill = eleBill.find(bill => bill.roomNumber === selectedRoom);
      const { billAmount, billPeriodStart, billPeriodEnd } = formik.values;
      if (existingBill) {
        const billToUpdate = existingBill.bills.find(bill =>
          bill.billPeriodStart === billPeriodStart && bill.billPeriodEnd === billPeriodEnd
        );

        if (billToUpdate) {
          billToUpdate.billAmount = billAmount;

          await updateDoc(doc(db, "eleBill", existingBill.id), {
            bills: existingBill.bills
          });

          toast({
            title: "Success",
            description: "Electricity bill modified successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          setIsModalOpen(false);
          formik.resetForm();
        } else {
          // Handle case where the specified bill period doesn't exist in the existingBill
          console.error("Specified bill period not found in existing bill.");
          toast({
            title: "Error",
            description: "Specified bill period not found in existing bill. Please try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error modifying electricity bill:", error);
      toast({
        title: "Error",
        description: "Failed to modify electricity bill. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Extract unique room numbers from tenants list
  const uniqueRooms = [...new Set(tenants.map((tenant) => tenant.tenantRoom))];

  // Sort integers and place string values at the end
  uniqueRooms.sort((a, b) => {
    const aIsNumeric = !isNaN(a);
    const bIsNumeric = !isNaN(b);

    if (aIsNumeric && bIsNumeric) {
      return parseInt(a) - parseInt(b);
    } else if (aIsNumeric) {
      return -1;
    } else if (bIsNumeric) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  return (
    <>
      <Breadcrumbs customClass={"mb-6"} />
      <form onSubmit={formik.handleSubmit} className="flex items-baseline p-6 text-primary rounded-lg shadow-lg gap-5">

        <div className="flex-1">
          <FormControl>
            <FormLabel>Select Room</FormLabel>
            <Select
              id="roomNumber"
              name="roomNumber"
              onChange={(event) => setSelectedRoom(event.target.value)}
              value={selectedRoom}
              placeholder="Select Room"
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            >
              {uniqueRooms.map((room, index) => (
                <option key={index} value={room}>
                  {room}
                </option>
              ))}
            </Select>
          </FormControl>



          <FormControl className="mt-4">
            <FormLabel>Bill Period Start</FormLabel>
            <Input
              id="billPeriodStart"
              name="billPeriodStart"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.billPeriodStart}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.billPeriodStart && formik.errors.billPeriodStart ? (
            <div className="text-red-500 mt-1">{formik.errors.billPeriodStart}</div>
          ) : null}
          <Button label={'Save'} variant={'primary'} role={'button'} type={'submit'} customClass={'max-w-fit !mt-4 !m-0 w-full'} />

        </div>
        <div className="flex-1">


          <FormControl className="mt-4">
            <FormLabel>Bill Amount</FormLabel>
            <Input
              id="billAmount"
              name="billAmount"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.billAmount}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.billAmount && formik.errors.billAmount ? (
            <div className="text-red-500 mt-1">{formik.errors.billAmount}</div>
          ) : null}
          <FormControl className="mt-4">
            <FormLabel>Bill Period End</FormLabel>
            <Input
              id="billPeriodEnd"
              name="billPeriodEnd"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.billPeriodEnd}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.billPeriodEnd && formik.errors.billPeriodEnd ? (
            <div className="text-red-500 mt-1">{formik.errors.billPeriodEnd}</div>
          ) : null}
        </div>



      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Electricity Bill Already Exists</ModalHeader>
          <ModalBody>
            There is already an electricity bill for this room and period. Do you want to modify it?
          </ModalBody>
          <ModalFooter>
            <Button variant={'primary'} onClick={() => setIsModalOpen(false)} label={'Cancel'} />
            {/* Add button to handle modification */}
            <Button variant={'outline'} onClick={() => { setIsModalOpen(false); handleModify(); }} label={'Modify'} />
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="mt-5">
        <ShowBills values={totalBill} />
      </div>

    </>
  );
};



export default ElectricityBill;
