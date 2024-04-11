import Title from "./../components/utils/Title";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  StatHelpText,
  Stat,
  useToast,
  Spinner,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import useAddData from "../hooks/addData";
import useGetData from "../hooks/getData";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

const Users = () => {
  const { addTenents } = useAddData();
  const { loading, error, tenents, fetchTenents } = useGetData();
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      tenentName: "",
      tenentContact: "",
      tenentEmail: "",
      tenentRoom: "",
      tenentStay: "",
      tenentRent: "",
    },
    validate: (values) => {
      let errors = {};
      if (!values.tenentName) {
        errors.tenentName = "Tenent Name Is Missing or is Incorrect";
      }
      if (!values.tenentContact) {
        errors.tenentContact = "Tenent Contact Is Missing or is Incorrect";
      } else if (!/^\d{10}$/.test(values.tenentContact)) {
        errors.tenentContact =
          "Contact number should be exactly 10 digits long";
      }
      if (!values.tenentEmail) {
        errors.tenentEmail = "Tenent Email Is Missing or is Incorrect";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.tenentEmail)) {
        errors.tenentEmail = "Invalid Email";
      }
      if (!values.tenentRoom) {
        errors.tenentRoom = "Tenent Room Is Missing or is Incorrect";
      }
      if (!values.tenentStay) {
        errors.tenentStay = "Tenent Stay Duration Is Missing or is Incorrect";
      }
      if (!values.tenentRent) {
        errors.tenentRent = "Tenent Rent Amount Is Missing or is Incorrect";
      }
      return errors;
    },
    onSubmit: async (values) => {
      try {
        const docId = await addTenents(values);
        const examplePromise = new Promise((resolve, reject) => {
          if (docId) setTimeout(() => resolve(200), 3000);
          if (!docId) setTimeout(() => reject(200), 3000);
        });
        if (docId) {
          toast.promise(examplePromise, {
            success: {
              title: "Congratulation",
              description: "Tenent successfully added",
            },
            error: {
              title: "Unfortunatley",
              description: "Something wrong please try again after some time",
            },
            loading: { title: "Please wait", description: "adding tenent" },
          });
          // Optionally, you can reset the form after successful submission
          formik.resetForm();
        } else {
          throw new Error("Failed to add tenent.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });



const updateTenent = async (id, newData) => {
  try {
    await db.collection("tenents").doc(id).update(newData);
  } catch (error) {
    throw new Error("Failed to update tenent.");
  }
};

const deleteTenent = async (id) => {
  try {
    await db.collection("tenents").doc(id).delete();
  } catch (error) {
    throw new Error("Failed to delete tenent.");
  }
};

 
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenent, setSelectedTenent] = useState(null);
  const [updatedData, setUpdatedData] = useState({}); 

  const onClose = () => setIsOpen(false);

  const handleEdit = (tenent) => {
    setSelectedTenent(tenent);
    setIsOpen(true);
    setUpdatedData(tenent);
  };

  const handleConfirmEdit = async () => {
    try {
      await updateTenent(selectedTenent.id, updatedData);
      toast({
        title: "Success",
        description: "Tenent data updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsOpen(false);
  };

  const handleDelete = (tenent) => {
    setSelectedTenent(tenent);
    setIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTenent(selectedTenent.id);
      toast({
        title: "Success",
        description: "Tenent deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsOpen(false);
  };


  return (
    <>
      <Tabs size="md" variant="enclosed">
        <TabList>
          <Tab
            _selected={{
              background: "#E6F4F1",
            }}
          >
            <Title>Tenents Info</Title>
          </Tab>
          <Tab
            _selected={{
              background: "#E6F4F1",
            }}
          >
            <Title>Add Tenents</Title>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Title size={"lg"} customClass={"mb-8"}>
              Total Tenents {tenents.length}
            </Title>
            <Skeleton isLoaded={!loading} className="h-full">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Room
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Stay
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tenent Rent
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenents.map((t) => (
                      <tr key={t.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentContact}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentRoom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentStay}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {t.tenentRent}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Skeleton>
          </TabPanel>
          <TabPanel>
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex-1">
                  <div className="name flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-user"></i> Tenent Name{" "}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      name="tenentName"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentName}
                    />
                    {formik.touched.tenentName && formik.errors.tenentName ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentName}
                      </div>
                    ) : null}
                  </div>
                  <div className="contact flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-phone"></i> Tenent Contact
                      number
                    </label>
                    <input
                      type="number"
                      name="tenentContact"
                      placeholder="Enter Room Number"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentContact}
                    />
                    {formik.touched.tenentContact &&
                    formik.errors.tenentContact ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentContact}
                      </div>
                    ) : null}
                  </div>
                  <div className="total-stay flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm flex gap-2 items-center">
                      <i className="fa-light fa-calendar-days"></i>
                      <span>Total stay duration</span>
                      <Stat>
                        <StatHelpText>(in months)</StatHelpText>
                      </Stat>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter stay duration"
                      name="tenentStay"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentStay}
                    />
                    {formik.touched.tenentStay && formik.errors.tenentStay ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentStay}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="email flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-envelope"></i> Tenent Email
                    </label>
                    <input
                      placeholder="Enter Email"
                      type="email"
                      name="tenentEmail"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentEmail}
                    />
                    {formik.touched.tenentEmail && formik.errors.tenentEmail ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentEmail}
                      </div>
                    ) : null}
                  </div>
                  <div className="romm-number flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-person-booth"></i> Tenent Room
                      number
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Room Number"
                      name="tenentRoom"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentRoom}
                    />
                    {formik.touched.tenentRoom && formik.errors.tenentRoom ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentRoom}
                      </div>
                    ) : null}
                  </div>
                  <div className="Rent flex flex-col w-full mb-6 mt-8">
                    <label className="font-medium mb-2 text-sm flex gap-2">
                      <span>₹ Rent Amount</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Rent"
                      name="tenentRent"
                      min={0}
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenentRent}
                    />
                    {formik.touched.tenentRent && formik.errors.tenentRent ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenentRent}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <button
                className="cursor-pointer py-2 px-6 rounded font-medium text-lg text-center transition duration-300 bg-primary text-white hover:outline-primary hover:outline hover:text-primary hover:bg-transparent self-end"
                type="submit"
              >
                Submit
              </button>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default Users;
