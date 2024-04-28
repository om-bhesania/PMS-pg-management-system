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
    rentAmount: Yup.number().required("Rent amount is required").min(0),
    rentPeriodStart: Yup.date().required("Rent period start is required"),
    rentPeriodEnd: Yup.date().required("Rent period end is required"),
  });

  const formik = useFormik({
    initialValues: {
      rentAmount: "",
      rentPeriodStart: "",
      rentPeriodEnd: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { rentAmount, rentPeriodStart, rentPeriodEnd } = values; 
        const existingRentDue = rentDue.find(
          (rent) => rent.roomNumber === selectedRoom
        ); 
        if (
          existingRentDue &&
          existingRentDue.rents.some(
            (r) =>
              r.rentPeriodEnd === rentPeriodEnd &&
              r.rentPeriodStart === rentPeriodStart
          )
        ) {
          setIsModalOpen(true);
          return;
        }

        const rentDueData = {
          rentPeriodStart,
          rentPeriodEnd,
          rentAmount,
        };
 
        if (existingRentDue) {
          existingRentDue.rents.push(rentDueData);
          await updateDoc(doc(db, "rentdue", existingRentDue.id), {
            rents: existingRentDue.rents,
          });
        } else { 
          const newRentData = {
            rents: [
              {
                ...rentDueData,
                paymentStatus: "pending",
                roomNumber: selectedRoom,
              },
            ],
          };
          await addDoc(collection(db, "rentdue"), newRentData);
        }

        toast({
          title: "Success",
          description: "Rent due added successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        resetForm();
      } catch (error) {
        console.error("Error adding rent due:", error);
        toast({
          title: "Error",
          description: "Failed to add rent due. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  const handleModify = async () => {
    try {
      const existingRentDue = rentDue.find(
        (rent) => rent.roomNumber === selectedRoom
      );
      const { rentAmount, rentPeriodStart, rentPeriodEnd } = formik.values;

      if (existingRentDue) {
        const rentToUpdate = existingRentDue.rents.find(
          (rent) =>
            rent.rentPeriodStart === rentPeriodStart &&
            rent.rentPeriodEnd === rentPeriodEnd
        );

        if (rentToUpdate) {
          rentToUpdate.rentAmount = rentAmount;

          await updateDoc(doc(db, "rentdue", existingRentDue.id), {
            rents: existingRentDue.rents,
          });

          toast({
            title: "Success",
            description: "Rent due modified successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          setIsModalOpen(false);
          formik.resetForm();
        } else {
          console.error("Specified rent period not found in existing rent.");
          toast({
            title: "Error",
            description:
              "Specified rent period not found in existing rent. Please try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error modifying rent due:", error);
      toast({
        title: "Error",
        description: "Failed to modify rent due. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const uniqueRooms = [...new Set(tenants.map((tenant) => tenant.tenantRoom))];

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
            <div className="text-red-500 mt-1">{formik.errors.rentPeriodEnd}</div>
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
        <ShowRentDue />
      </div>
    </>
  );
};

export default Rentdue;
