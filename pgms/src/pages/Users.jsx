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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  IconButton,
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

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenent, setSelectedTenent] = useState(null);
  const [editableFields, setEditableFields] = useState({});

  const onClose = () => setIsOpen(false);

  const handleEdit = (tenent) => {
    setSelectedTenent(tenent);
    setEditableFields({
      ...editableFields,
      [tenent.id]: true,
    });
  };

  const handleSave = async (tenent) => {
    try {
      const docRef = db.collection("tenents").doc(tenent.id);
      await docRef.update({
        tenentName: tenent.tenentName,
        tenentContact: tenent.tenentContact,
        tenentEmail: tenent.tenentEmail,
        tenentRoom: tenent.tenentRoom,
        tenentStay: tenent.tenentStay,
        tenentRent: tenent.tenentRent,
      });
      toast({
        title: "Success",
        description: "Tenent data updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditableFields({
        ...editableFields,
        [tenent.id]: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tenent data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (tenent) => {
    try {
      await db.collection("tenents").doc(tenent.id).delete();
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
        description: "Failed to delete tenent.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFieldChange = (tenent, field, e) => {
    tenent[field] = e.target.textContent;
    setEditableFields({
      ...editableFields,
      [tenent.id]: true,
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedTenent) return;
    await handleDelete(selectedTenent);
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
            <Skeleton isLoaded={!loading}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Stay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenent Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenents.map((t) => (
                      <tr key={t.id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) => handleFieldChange(t, "tenentName", e)}
                        >
                          {t.tenentName}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) =>
                            handleFieldChange(t, "tenentContact", e)
                          }
                        >
                          {t.tenentContact}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) => handleFieldChange(t, "tenentEmail", e)}
                        >
                          {t.tenentEmail}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) => handleFieldChange(t, "tenentRoom", e)}
                        >
                          {t.tenentRoom}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) => handleFieldChange(t, "tenentStay", e)}
                        >
                          {t.tenentStay}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          contentEditable={editableFields[t.id]}
                          onBlur={(e) => handleFieldChange(t, "tenentRent", e)}
                        >
                          {t.tenentRent}
                        </td>
                        <td>
                          {!editableFields[t.id] ? (
                            <IconButton
                              icon={
                                <i className="fa-regular fa-pen-to-square"></i>
                              }
                              onClick={() => handleEdit(t)}
                              mr={2}
                              colorScheme="blue"
                            />
                          ) : (
                            <IconButton
                              icon={
                                <i className="fa-regular fa-floppy-disk"></i>
                              }
                              onClick={() => handleSave(t)}
                              mr={2}
                              colorScheme="green"
                            />
                          )}
                          <IconButton
                            icon={<i className="fa-solid fa-trash"></i>}
                            onClick={() => handleDelete(t)}
                            colorScheme="red"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AlertDialog isOpen={isOpen} onClose={onClose}>
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                      Delete Tenent
                    </AlertDialogHeader>

                    <AlertDialogBody>
                      Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                      <Button onClick={onClose}>Cancel</Button>
                      <Button
                        colorScheme="red"
                        onClick={handleConfirmDelete}
                        ml={3}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
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
