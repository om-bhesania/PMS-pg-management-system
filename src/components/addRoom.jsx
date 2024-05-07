import { addDoc, collection, getDocs } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { db } from "../firebase/firebase";

const AddRoom = () => {
  const toast = useToast();

  // Define validation schema with Yup
  const validationSchema = Yup.object({
    room: Yup.number()
      .required("Room number is required")
      .min(1, "Room number must be positive"),
    beds: Yup.number()
      .required("Total beds is required")
      .min(1, "Beds must be at least 1"),
    inmates: Yup.number()
      .required("Total inmates is required")
      .min(0, "Inmates cannot be negative")
      .test(
        "inmates_less_than_beds",
        "Inmates cannot exceed beds",
        function (value) {
          return value <= this.parent.beds;
        }
      ),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      room: "",
      beds: "",
      inmates: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const roomsCollection = collection(db, "rooms");

        // Check if the room already exists
        const existingRoomsSnapshot = await getDocs(roomsCollection);
        const existingRooms = existingRoomsSnapshot.docs.map(
          (doc) => doc.data().room
        );

        if (existingRooms.includes(values.room)) {
          toast({
            title: "Room already exists",
            description: "Please enter a different room number",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          await addDoc(roomsCollection, values);
          toast({
            title: "Room added",
            description: "Room has been successfully added",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          formik.resetForm(); // Reset the form upon successful submission
        }
      } catch (error) {
        toast({
          title: "An error occurred",
          description: "Unable to add the room. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-2 gap-5">
          <div className="room flex flex-col w-full mb-6">
            <label className="font-medium mb-2 text-sm">Room Number</label>
            <input
              type="number"
              placeholder="Enter room number"
              name="room"
              autoFocus
              className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.room}
            />
            {formik.touched.room && formik.errors.room && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.room}
              </div>
            )}
          </div>

          <div className="beds flex flex-col w-full mb-6">
            <label className="font-medium mb-2 text-sm">Total Beds</label>
            <input
              type="number"
              placeholder="Enter total beds"
              name="beds"
              className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.beds}
            />
            {formik.touched.beds && formik.errors.beds && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.beds}
              </div>
            )}
          </div>

          <div className="inmates flex flex-col w-full mb-6">
            <label className="font-medium mb-2 text-sm">Total Inmates</label>
            <input
              type="number"
              placeholder="Enter total inmates"
              name="inmates"
              className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.inmates}
            />
            {formik.touched.inmates && formik.errors.inmates && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.inmates}
              </div>
            )}
          </div>
        </div>

        <button
          className="cursor-pointer py-2 px-6 rounded font-medium text-lg text-center transition duration-300 bg-primary text-white hover:outline-primary hover:outline hover:text-primary hover:bg-transparent self-end"
          type="submit"
        >
          Submit
        </button>
      </form>

<div className="showRooms"> 
    <button
        className="cursor-pointer py-2 px-6 rounded font-medium text-lg text-center transition duration-300 bg-primary text-white hover:outline-primary hover:outline hover:text-primary hover:bg-transparent self-end"
        type="submit"
    >
        Show Rooms
    </button>
 
</div>

    </>
  );
};

export default AddRoom;
