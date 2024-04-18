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
  Skeleton,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import useAddData from "../hooks/addData";
import useGetData from "../hooks/getData";
import { useContext, useState } from "react";
import useModifyData from "../hooks/modifyData";
import useDeleteData from "../hooks/deleteData";
import useAddTenentCreds from "../hooks/addTenent";
import useLoggedInUserData from "../hooks/useLoggedInUserData";
import Breadcrumbs from "../components/utils/breadcrumbs";
import { Firestore, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
const Users = () => {
  const { addtenants } = useAddData();
  const { loading, tenants, tenantCreds, error, masterData, mergeTenantData } =
    useGetData();
  const { modifyData } = useModifyData();
  const { deleteData } = useDeleteData();
  const { addTenentCreds } = useAddTenentCreds();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      tenantName: "",
      tenantContact: "",
      tenantEmail: "",
      tenantRoom: "",
      tenantStay: "",
      tenantRent: "",
    },
    validate: (values) => {
      let errors = {};
      if (!values.tenantName) {
        errors.tenantName = "tenant Name Is Missing or is Incorrect";
      }
      if (!values.tenantContact) {
        errors.tenantContact = "tenant Contact Is Missing or is Incorrect";
      } else if (!/^\d{10}$/.test(values.tenantContact)) {
        errors.tenantContact =
          "Contact number should be exactly 10 digits long";
      }
      if (!values.tenantEmail) {
        errors.tenantEmail = "tenant Email Is Missing or is Incorrect";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.tenantEmail)) {
        errors.tenantEmail = "Invalid Email";
      }
      if (!values.tenantRoom) {
        errors.tenantRoom = "tenant Room Is Missing or is Incorrect";
      }
      if (!values.tenantStay) {
        errors.tenantStay = "tenant Stay Duration Is Missing or is Incorrect";
      }
      if (!values.tenantRent) {
        errors.tenantRent = "tenant Rent Amount Is Missing or is Incorrect";
      }
      return errors;
    },
    onSubmit: async (values) => {
      try {
        const docId = await addtenants(values);
        const examplePromise = new Promise((resolve, reject) => {
          if (docId) setTimeout(() => resolve(200), 3000);
          if (!docId) setTimeout(() => reject(200), 3000);
        });
        if (docId) {
          toast.promise(examplePromise, {
            success: {
              title: "Congratulation",
              description: "tenant successfully added",
            },
            error: {
              title: "Unfortunatley",
              description: "Something wrong please try again after some time",
            },
            loading: { title: "Please wait", description: "adding tenant" },
          });
          // Optionally, you can reset the form after successful submission
          formik.resetForm();
        } else {
          throw new Error("Failed to add tenant.");
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

  // State for managing modal and edited tenant
  const [modalOpen, setModalOpen] = useState(false);
  const [editedTenant, setEditedTenant] = useState(null);

  const handleEditClick = (tenant) => {
    setEditedTenant(tenant);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const {
        tenantName,
        tenantContact,
        tenantEmail,
        tenantRoom,
        tenantStay,
        tenantRent,
      } = editedTenant;
      const updatedData = {
        tenantName,
        tenantContact,
        tenantEmail,
        tenantRoom,
        tenantStay,
        tenantRent,
      };
      await modifyData("tenants", editedTenant.id, updatedData);
      setModalOpen(false);
      toast({
        title: "Success",
        description: "Tenant data updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating tenant document:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the tenant document.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (collectionName, documentId) => {
    try {
      await deleteData(collectionName, documentId);
      toast({
        title: "Success",
        description: "Tenant data deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting tenant document:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the tenant document.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // generate account
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const handleGenerateAccounts = async (tenantEmail) => {
    const result = await addTenentCreds(tenantEmail);
    if (result && result.password !== "Already exists") {
      setGeneratedCredentials({
        email: result.email,
        password: result.password,
      });
      onOpen();
      toast({
        title: "Account Generated",
        description: `Account generated successfully for ${result.email}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else if (result && result.password === "Already exists") {
      toast({
        title: "Attention!!",
        description: `Account already exists for ${result.email}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Show error toast if account generation fails
      toast({
        title: "Error",
        description: "Failed to generate account.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const fetchTenantCreds = async (tenantId) => {
    try {
      const tenantCredsQuery = collection(db, "tenantCreds");

      const tenantCredsSnapshot = await getDocs(tenantCredsQuery);

      if (tenantCredsSnapshot) {
        // Set the fetched credentials to the state
        setGeneratedCredentials({
          email: tenantCredsSnapshot.email,
          password: tenantCredsSnapshot.password,
        });
        onOpen();
      } else {
        // If no credentials found, display a message
        toast({
          title: "No Credentials Found",
          description: "No credentials found for this tenant.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching tenant credentials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tenant credentials.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const viewCreds = (tenantId) => {
    // Function to view tenant credentials
    setSelectedTenantId(tenantId);
    fetchTenantCreds(tenantId);
  };

  return (
    <div className="">
      <Breadcrumbs customClass={"mb-6"} />
      <Tabs size="md" variant="enclosed">
        <TabList>
          <Tab
            _selected={{
              background: "#E6F4F1",
            }}
          >
            <Title>tenants Info</Title>
          </Tab>
          <Tab
            _selected={{
              background: "#E6F4F1",
            }}
          >
            <Title>Add tenants</Title>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Title size={"lg"} customClass={"mb-8"}>
              Total tenants {tenants.length}
            </Title>
            {!error ? (
              <>
                <Skeleton isLoaded={!loading}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Name
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Contact
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Email
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Room
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Stay
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            tenant Rent
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                          <tr key={tenant.id}>
                            <td className="p-3 whitespace-nowrap border-b text-center font-bold">
                              {tenant.tenantName}
                            </td>
                            <td className="p-3 whitespace-nowrap border-b text-center">
                              {tenant.tenantContact}
                            </td>
                            <td className="p-3 whitespace-nowrap border-b text-center">
                              {tenant.tenantEmail}
                            </td>
                            <td className="p-3 whitespace-nowrap border-b text-center">
                              {tenant.tenantRoom}
                            </td>
                            <td className="p-3 whitespace-nowrap border-b text-center">
                              {tenant.tenantStay}
                            </td>
                            <td className="p-3 whitespace-nowrap border-b text-center">
                              {tenant.tenantRent}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex gap-3">
                                <IconButton
                                  aria-label="Edit"
                                  icon={
                                    <i className="fa-regular fa-pencil-alt"></i>
                                  }
                                  onClick={() => handleEditClick(tenant)}
                                />
                                <IconButton
                                  aria-label="Delete"
                                  icon={
                                    <i className="fa-regular fa-trash-alt"></i>
                                  }
                                  onClick={() =>
                                    handleDelete("tenants", tenant.id)
                                  }
                                />
                                <IconButton
                                  aria-label="Generate Accounts"
                                  icon={
                                    <i className="fa-regular fa-user-plus" />
                                  }
                                  onClick={() => {
                                    handleGenerateAccounts(tenant.tenantEmail);
                                    mergeTenantData();
                                  }}
                                />
                                <IconButton
                                  aria-label="View Account"
                                  id={tenant.id}
                                  icon={<i className="fa-regular fa-eye" />}
                                  onClick={viewCreds}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Skeleton>
              </>
            ) : (
              <>
                <div className="text-danger p-4 m-4 max-w-fit mx-auto text-lg font-semibold text-center rounded-2xl">
                  *Something went wrong please try after some time or refresh
                  the page
                </div>
              </>
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Generated Credentials</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {generatedCredentials ? (
                    <>
                      <p>Email: {generatedCredentials.email}</p>
                      <p>Password: {generatedCredentials.password}</p>
                    </>
                  ) : (
                    <p>No credentials available.</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
          <TabPanel>
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex-1">
                  <div className="name flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-user"></i> tenant Name{" "}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      name="tenantName"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantName}
                    />
                    {formik.touched.tenantName && formik.errors.tenantName ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantName}
                      </div>
                    ) : null}
                  </div>
                  <div className="contact flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-phone"></i> tenant Contact
                      number
                    </label>
                    <input
                      type="number"
                      name="tenantContact"
                      placeholder="Enter Room Number"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantContact}
                    />
                    {formik.touched.tenantContact &&
                    formik.errors.tenantContact ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantContact}
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
                      name="tenantStay"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantStay}
                    />
                    {formik.touched.tenantStay && formik.errors.tenantStay ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantStay}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="email flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-envelope"></i> tenant Email
                    </label>
                    <input
                      placeholder="Enter Email"
                      type="email"
                      name="tenantEmail"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantEmail}
                    />
                    {formik.touched.tenantEmail && formik.errors.tenantEmail ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantEmail}
                      </div>
                    ) : null}
                  </div>
                  <div className="room-number flex flex-col w-full mb-6">
                    <label className="font-medium mb-2 text-sm">
                      <i className="fa-regular fa-person-booth"></i> tenant Room
                      number
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Room Number"
                      name="tenantRoom"
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantRoom}
                    />
                    {formik.touched.tenantRoom && formik.errors.tenantRoom ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantRoom}
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
                      name="tenantRent"
                      min={0}
                      autoFocus
                      className="border border-gray-400 focus:border-secondary focus:border-2 rounded-lg p-3 max-w-full"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.tenantRent}
                    />
                    {formik.touched.tenantRent && formik.errors.tenantRent ? (
                      <div className="text-red-500 text-sm font-semibold">
                        {formik.errors.tenantRent}
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Tenant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Tenant Name</FormLabel>
              <Input
                type="text"
                name="tenantName"
                value={editedTenant?.tenantName || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantName: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Tenant Contact</FormLabel>
              <Input
                type="text"
                name="tenantContact"
                value={editedTenant?.tenantContact || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantContact: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Tenant Email</FormLabel>
              <Input
                type="email"
                name="tenantEmail"
                value={editedTenant?.tenantEmail || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantEmail: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Tenant Room</FormLabel>
              <Input
                type="text"
                name="tenantRoom"
                value={editedTenant?.tenantRoom || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantRoom: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Tenant Stay</FormLabel>
              <Input
                type="text"
                name="tenantStay"
                value={editedTenant?.tenantStay || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantStay: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Tenant Rent</FormLabel>
              <Input
                type="number"
                name="tenantRent"
                value={editedTenant?.tenantRent || ""}
                onChange={(e) =>
                  setEditedTenant({
                    ...editedTenant,
                    tenantRent: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Users;
