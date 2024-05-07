import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import useFirestoreData from "../hooks/useFireStoreData";
import {
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter, 
} from "@chakra-ui/react";
import Button from "../components/utils/Button";
import {
  addDoc,
  collection,
  updateDoc,
  doc, 
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import useGetData from "../hooks/getData";
import Breadcrumbs from "../components/utils/breadcrumbs"; 
import ShowRentDue from "./ShowRentDue";

const Rentdue = () => {
  const { rentDue } = useFirestoreData();
  const { tenants } = useGetData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const toast = useToast();

  const validationSchema = Yup.object().shape({
    rentAmount: Yup.number().required("Bill amount is required").min(0),
    rentPeriodStart: Yup.date().required("Bill period start is required"),
    rentPeriodEnd: Yup.date().required("Bill period end is required"),
  });
  const totalBill = rentDue.map((bill) =>
    bill.bills.length > 0 ? true : false
  );
  const formik = useFormik({
    initialValues: {
      rentAmount: "",
      rentPeriodStart: "",
      rentPeriodEnd: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { rentAmount, rentPeriodStart, rentPeriodEnd } = values;

        // Check if a bill already exists for the selected room
        const existingBill = rentDue.find(
          (bill) => bill.roomNumber === selectedRoom
        );

        // Check if the same bill period already exists for the selected room
        if (
          existingBill &&
          existingBill.bills.some(
            (b) =>
              b.rentPeriodEnd === rentPeriodEnd &&
              b.rentPeriodStart === rentPeriodStart
          )
        ) {
          setIsModalOpen(true);
          return;
        }

        const RentBillData = {
          rentPeriodStart,
          rentPeriodEnd,
          rentAmount,
          paymentStatus: "pending",
          id: Math.random().toString(36).substr(2, 9),
        };

        // If the bill for the room exists, update it
        if (existingBill) {
          existingBill.bills.push(RentBillData);
          await updateDoc(doc(db, "rentdue", existingBill.id), {
            bills: existingBill.bills,
          });
        } else {
          // Add new bill entry for the room
          const newBillData = {
            roomNumber: selectedRoom,
            bills: [RentBillData],
          };
          await addDoc(collection(db, "rentdue"), newBillData);
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
        console.error("Error adding Rent bill:", error);
        toast({
          title: "Error",
          description: "Failed to add Rent bill. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });
  const handleModify = async () => {
    try {
      const existingBill = rentDue.find(
        (bill) => bill.roomNumber === selectedRoom
      );
      const { rentAmount, rentPeriodStart, rentPeriodEnd } = formik.values;
      if (existingBill) {
        const billToUpdate = existingBill.bills.find(
          (bill) =>
            bill.rentPeriodStart === rentPeriodStart &&
            bill.rentPeriodEnd === rentPeriodEnd
        );

        if (billToUpdate) {
          billToUpdate.rentAmount = rentAmount;

          await updateDoc(doc(db, "rentDue", existingBill.id), {
            bills: existingBill.bills,
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
            description:
              "Specified bill period not found in existing bill. Please try again.",
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
      <form
        onSubmit={formik.handleSubmit}
        className="flex items-baseline p-6 text-primary rounded-lg shadow-lg gap-5"
      >
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
            <FormLabel>Rent Period Start</FormLabel>
            <Input
              id="rentPeriodStart"
              name="rentPeriodStart"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rentPeriodStart}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.rentPeriodStart && formik.errors.rentPeriodStart ? (
            <div className="text-red-500 mt-1">
              {formik.errors.rentPeriodStart}
            </div>
          ) : null}
          <Button
            label={"Save"}
            variant={"primary"}
            role={"button"}
            type={"submit"}
            customClass={"max-w-fit !mt-4 !m-0 w-full"}
          />
        </div>
        <div className="flex-1">
          <FormControl className="mt-4">
            <FormLabel>Rent Amount</FormLabel>
            <Input
              id="rentAmount"
              name="rentAmount"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rentAmount}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.rentAmount && formik.errors.rentAmount ? (
            <div className="text-red-500 mt-1">{formik.errors.rentAmount}</div>
          ) : null}
          <FormControl className="mt-4">
            <FormLabel>Rent Period End</FormLabel>
            <Input
              id="rentPeriodEnd"
              name="rentPeriodEnd"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rentPeriodEnd}
              className="mt-1 block w-full rounded-md bg-primary text-primary border-transparent focus:border-secondary focus:bg-white focus:ring-0"
            />
          </FormControl>
          {formik.touched.rentPeriodEnd && formik.errors.rentPeriodEnd ? (
            <div className="text-red-500 mt-1">
              {formik.errors.rentPeriodEnd}
            </div>
          ) : null}
        </div>
      </form>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rent Due Already Exists</ModalHeader>
          <ModalBody>
            There's already rent due for this room and period. Would you like to
            modify it?
          </ModalBody>
          <ModalFooter>
            <Button
              variant={"primary"}
              onClick={() => setIsModalOpen(false)}
              label={"Cancel"}
            />
            <Button
              variant={"outline"}
              onClick={() => {
                setIsModalOpen(false);
                handleModify();
              }}
              label={"Modify"}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="mt-5">
        <ShowRentDue values={totalBill} />
      </div>
    </>
  );
};

export default Rentdue;
