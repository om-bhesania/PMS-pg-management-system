import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  IconButton,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiFillDelete,
  AiFillEdit,
  AiOutlinePlus,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import {
  FaMoneyBill,
  FaUtensils,
  FaHome,
  FaCar,
  FaRegHeart,
  FaGift,
  FaBook,
  FaPlane,
  FaRegSmile,
} from "react-icons/fa";
import "tailwindcss/tailwind.css";
import { db } from "../firebase/firebase";
import Title from "../components/utils/Title";

// 15 random icons for category selection
const categoryIconsList = [
  FaMoneyBill,
  FaUtensils,
  FaHome,
  FaCar,
  FaRegHeart,
  FaGift,
  FaBook,
  FaPlane,
  FaRegSmile,
];

const expenseSchema = Yup.object({
  description: Yup.string().required("Description is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  tenant: Yup.string().nullable(), // optional field
});

const defaultCategories = [
  { name: "Rent", icon: FaHome },
  { name: "Utilities", icon: FaMoneyBill },
  { name: "Food", icon: FaUtensils },
  { name: "Miscellaneous", icon: FaGift },
];

const OtherExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [categoryIcons, setCategoryIcons] = useState({});
  const [editing, setEditing] = useState(null);
  const {
    isOpen: isCategoryOpen,
    onOpen: openCategoryModal,
    onClose: closeCategoryModal,
  } = useDisclosure(); // for adding custom categories

  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    // Fetch all expenses from Firestore
    const expenseQuery = query(collection(db, "expenseTracker"));
    const unsubscribeExpense = onSnapshot(expenseQuery, (snapshot) => {
      const expenseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expenseData);
    });

    // Fetch tenants from Firestore
    const tenantQuery = query(collection(db, "tenants"));
    const unsubscribeTenant = onSnapshot(tenantQuery, (snapshot) => {
      const tenantData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTenants(tenantData);
      setLoadingTenants(false);
    });

    return () => {
      unsubscribeExpense();
      unsubscribeTenant();
    };
  }, []);

  const addCategory = (newCategory, icon) => {
    const updatedCategories = [...categories, { name: newCategory, icon }];
    setCategories(updatedCategories);
    setCategoryIcons({ ...categoryIcons, [newCategory]: icon });
    closeCategoryModal();
  };

  const handleDelete = (id) => {
    deleteDoc(doc(db, "expenseTracker", id));
  };

  const handleEdit = (expense) => {
    setEditing(expense.id);
    formik.setValues({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      tenant: expense.tenant || "", // if null, set to empty
    });
  };

  const formik = useFormik({
    initialValues: {
      description: "",
      amount: "",
      category: "",
      tenant: "",
    },
    validationSchema: expenseSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editing) {
        await updateDoc(doc(db, "expenseTracker", editing), values);
        setEditing(null);
        setLoadingTenants(true); // reset the tenants dropdown
      } else {
        await addDoc(collection(db, "expenseTracker"), values);
      }
      resetForm();
    },
  });

  return (
    <Box p={6} className="bg-white rounded-xl shadow-lg">
      {/* Form for adding/editing expenses */}
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Description Field */}
          <div className="flex flex-col w-full mb-6">
            <FormLabel>Description</FormLabel>
            <Input
              type="text"
              placeholder="Expense description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.description}
              </div>
            )}
          </div>

          {/* Amount Field */}
          <div className="flex flex-col w-full mb-6">
            <FormLabel>Amount</FormLabel>
            <Input
              type="number"
              placeholder="Enter amount"
              name="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.amount && formik.errors.amount && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.amount}
              </div>
            )}
          </div>

          {/* Category Field with Icon */}
          <div className="flex flex-col w-full mb-6">
            <FormLabel>Category</FormLabel>
            <Select
              name="category"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.category}
              placeholder="Select category"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {React.createElement(cat.icon)} {cat.name}
                </option>
              ))}
            </Select>
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500 text-sm font-semibold">
                {formik.errors.category}
              </div>
            )}
          </div>

          {/* Tenant Dropdown */}
          <div className="flex flex-col w-full mb-6">
            <FormLabel>Assign to Tenant (optional)</FormLabel>
            <Skeleton isLoaded={!loadingTenants}>
              <Select
                name="tenant"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.tenant}
                placeholder="Select tenant"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.tenantName}
                  </option>
                ))}
              </Select>
            </Skeleton>
          </div>
        </div>

        <Flex gap={5}>
          <Button
            type="submit"
            className="!bg-transparent !text-primary
          hover:!bg-primary hover:!text-white  !outline-primary "
          >
            {editing ? "Update" : "Add"} Expense
          </Button>
          <Button
            onClick={openCategoryModal}
            className="!bg-primary !text-white hover:!bg-transparent hover:!text-primary hover:!outline-primary hover:outline hover:border-primary"
            leftIcon={<AiOutlinePlus />}
          >
            Add Custom Category
          </Button>
        </Flex>
      </form>

      {/* Modal for Adding Custom Categories with Icons */}
      <Modal isOpen={isCategoryOpen} onClose={closeCategoryModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl>
                <FormLabel>Category Name</FormLabel>
                <Input
                  name="newCategory"
                  placeholder="Enter category name"
                  onChange={(e) =>
                    formik.setFieldValue("newCategory", e.target.value)
                  }
                />
              </FormControl>

              <Text>Select an Icon:</Text>
              <Flex gap={2}>
                {categoryIconsList.slice(0, 15).map((IconComponent, index) => (
                  <IconButton
                    key={index}
                    icon={<IconComponent />}
                    colorScheme="blue"
                    onClick={() =>
                      formik.setFieldValue("icon", IconComponent.name)
                    }
                    aria-label={`Icon-${index}`}
                  />
                ))}
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() =>
                addCategory(formik.values.newCategory, formik.values.icon)
              }
            >
              Add
            </Button>
            <Button onClick={closeCategoryModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Table to Display Expenses */}
      {expenses.length > 0 ? (
        <>
          <Skeleton isLoaded={!loadingTenants}>
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Description
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Category
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="p-3 whitespace-nowrap border-b text-center">
                        {expense.description}
                      </td>
                      <td className="p-3 whitespace-nowrap border-b text-center">
                        {categoryIcons[expense.category]
                          ? React.createElement(categoryIcons[expense.category])
                          : expense.category}
                      </td>
                      <td className="p-3 whitespace-nowrap border-b text-center">
                        ₹ {expense.amount}
                      </td>
                      <td className="p-3 whitespace-nowrap border-b text-center">
                        {tenants.find((tenant) => tenant.id === expense.tenant)
                          ?.tenantName || "not Selected"}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex gap-3 justify-center">
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <AiFillEdit />
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <AiFillDelete />
                          </Button>
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
        <Flex align={"center"} justify={"center"} p={16}>
          <Title
            customClass={
              "text-red-500 p-4 border-2 border-primary rounded-full text-center"
            }
            size={"md"}
          >
            *No Expanse added yet
          </Title>
        </Flex>
      )}
    </Box>
  );
};

export default OtherExpenses;
