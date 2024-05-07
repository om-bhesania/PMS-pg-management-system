import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  Skeleton,
  Badge,
  useToast,
  Stack,
  Input,
} from "@chakra-ui/react";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { FaMoneyBill, FaBolt } from "react-icons/fa";
import { db } from "../firebase/firebase";
import Notify from "../components/notification/notify";
import Title from "../components/utils/Title";
import Button from "../components/utils/Button";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js"; // Encryption library


const ENCRYPTION_KEY = "this@is@secret@key__";


const isBillActive = (endDate) => {
  const today = new Date();
  return today <= new Date(endDate);
};

const Profile = () => {
  const [tenantInfo, setTenantInfo] = useState(null);
  const [editableTenantInfo, setEditableTenantInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [rentDue, setRentDue] = useState([]);
  const [eleBill, setEleBill] = useState([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  console.log(oldPassword);
  const toast = useToast();
  const currentEmail = sessionStorage.getItem("email");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!currentEmail) {
          throw new Error("No email found in sessionStorage.");
        }

        const tenantQuery = query(
          collection(db, "tenants"),
          where("tenantEmail", "==", currentEmail)
        );
        const tenantSnapshot = await getDocs(tenantQuery);

        if (tenantSnapshot.empty) {
          throw new Error("No tenant found with the provided email.");
        }

        const tenantData = tenantSnapshot.docs[0].data();
        setTenantInfo(tenantData);
        setEditableTenantInfo(tenantData);

        // Fetch rent due and electricity bill data
        const roomNumber = tenantData.tenantRoom;

        const rentDueQuery = query(
          collection(db, "rentdue"),
          where("roomNumber", "==", roomNumber)
        );
        const rentDueSnapshot = await getDocs(rentDueQuery);

        const filteredRentDue = rentDueSnapshot.docs
          .map((doc) => doc.data())
          .flatMap((rent) => rent.bills || [])
          .filter((bill) => isBillActive(bill.rentPeriodEnd));

        setRentDue(filteredRentDue);

        const eleBillQuery = query(
          collection(db, "eleBill"),
          where("roomNumber", "==", roomNumber)
        );
        const eleBillSnapshot = await getDocs(eleBillQuery);

        const filteredEleBill = eleBillSnapshot.docs
          .map((doc) => doc.data())
          .flatMap((bill) => bill.bills || [])
          .filter((bill) => isBillActive(bill.billPeriodEnd));

        setEleBill(filteredEleBill);

        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error fetching profile data",
          description: error.message || "An error occurred while fetching profile data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  const toggleEditMode = async () => {
    if (edit) {
      // Save changes to the tenant's information
      try {
        const tenantQuery = query(
          collection(db, "tenants"),
          where("tenantEmail", "==", currentEmail)
        );
        const tenantSnapshot = await getDocs(tenantQuery);

        if (!tenantSnapshot.empty) {
          const docId = tenantSnapshot.docs[0].id;
          await setDoc(doc(db, "tenants", docId), editableTenantInfo);

          setTenantInfo(editableTenantInfo);

          toast({
            title: "Profile updated",
            description: "Your changes have been saved.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error saving profile",
          description: "An error occurred while saving profile data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setEdit(!edit); // Toggle edit mode
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableTenantInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleChangePassword = async (currentEmail, oldPassword, newPassword, confirmPassword) => { 
  
    // Validate new password and confirm password
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const credsQuery = query(
        collection(db, "tenantCreds"),
        where("email", "==", currentEmail) // Ensure valid field values
      );
      const credsSnapshot = await getDocs(credsQuery);
  
      if (credsSnapshot.empty) {
        toast({
          title: "Error",
          description: "Tenant credentials not found.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
  
      const credsData = credsSnapshot.docs[0].data();
      const encryptedStoredPassword = credsData.password;
  
      // Decrypt the stored password
      console.log("Attempting to decrypt:", encryptedStoredPassword); // Check if this is valid
      const bytes = CryptoJS.AES.decrypt(encryptedStoredPassword, ENCRYPTION_KEY);
  
      // Convert to UTF-8 and check if it results in an empty string
      const decryptedStoredPassword = bytes.toString(CryptoJS.enc.Utf8);
  
      console.log("Decrypted Password:", decryptedStoredPassword); // Check if it's empty or not
  
      if (!decryptedStoredPassword) {
        console.error("Decryption resulted in an empty output");
        toast({
          title: "Error",
          description: "Failed to decrypt the stored password.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
  
      // Compare decrypted password with the user-provided old password
      if (decryptedStoredPassword.trim() !== oldPassword.trim()) {
        toast({
          title: "Error",
          description: "Old password is incorrect.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
  
      // Encrypt the new password
      const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, ENCRYPTION_KEY).toString();
  
      // Update Firestore with the new encrypted password
      await setDoc(
        doc(db, "tenantCreds", credsSnapshot.docs[0].id),
        { password: encryptedNewPassword },
        { merge: true }
      );
  
      toast({
        title: "Success",
        description: "Password changed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      // Reset input fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error in handleChangePassword:", error);
      toast({
        title: "Error",
        description: "An error occurred while changing the password.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  



  return (
    <Box p={6} className="bg-white rounded-lg shadow-lg">
      <Skeleton isLoaded={!isLoading}>
        {tenantInfo ? (
          <Flex direction="column" gap={6}>
            <Heading as="h1" size="xl" className="text-primary">
              Welcome, {tenantInfo.tenantName.split(" ")[0]}
            </Heading>

            {/* Profile Information */}
            <form className="flex flex-col space-y-2">
              <Stack direction={"row"} gap={6}>
                <Stack className="flex-1">
                  <Title>Name</Title>
                  <Input
                    type="text"
                    name="tenantName"
                    className="p-3 !pl-2 font-semibold !border-0"
                    value={editableTenantInfo.tenantName}
                    readOnly={!edit}
                    onChange={handleChange}
                  />
                </Stack>

                <Stack className="flex-1">
                  <Title>Email</Title>
                  <Input
                    type="text"
                    name="tenantEmail"
                    className="p-3 !pl-2 font-semibold !border-0"
                    value={editableTenantInfo.tenantEmail}
                    readOnly={!edit}
                    onChange={handleChange}
                  />
                </Stack>
              </Stack>

              {/* More Profile Fields */}
              <Stack direction={"row"} gap={6}>
                <Stack className="flex-1">
                  <Title>Contact</Title>
                  <Input
                    type="text"
                    name="tenantContact"
                    className="p-3 !pl-2 font-semibold !border-0"
                    readOnly={!edit}
                    onChange={handleChange}
                    value={editableTenantInfo.tenantContact}
                  />
                </Stack>
                <Stack className="flex-1">
                  <Title>Room Number</Title>
                  <Input
                    type="text"
                    name="tenantRoom"
                    className="p-3 !pl-2 font-semibold !border-0"
                    readOnly={!edit}
                    onChange={handleChange}
                    value={editableTenantInfo.tenantRoom}
                  />
                </Stack>
              </Stack>

              <Stack direction={"row"} gap={6}>
                <Stack className="flex-1">
                  <Title>Stay Duration</Title>
                  <Input
                    type="text"
                    name="tenantStay"
                    className="p-3 !pl-2 font-semibold !border-0"
                    readOnly={!edit}
                    onChange={handleChange}
                    value={editableTenantInfo.tenantStay}
                  />
                </Stack>

                <Stack className="flex-1">
                  <Title>Rent</Title>
                  <Text>₹{editableTenantInfo.tenantRent}</Text>
                </Stack>
              </Stack>

              <Button
                onClick={toggleEditMode}
                label={edit ? "Save" : "Edit"}
                variant={"primary"}
                icon={`${edit ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-edit'}`}
                customClass="self-start !m-0 !mt-5"
              />
            </form>

            {/* Change Password Section */}
            {/* <Box className="p-6 mt-8 bg-white rounded-lg shadow-lg">
              <Heading as="h3" size="md" className="text-primary">
                Change Password
              </Heading>
              <Stack spacing={4} className="mt-4">
                <Stack>
                  <Title>Old Password</Title>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border-gray-300"
                    required
                  />
                  <Text className="text-sm text-gray-500">
                    <Link to="#">Forgot Password?</Link>
                  </Text>
                </Stack>

                <Stack>
                  <Title>New Password</Title>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-gray-300"
                    required
                  />
                </Stack>

                <Stack>
                  <Title>Confirm Password</Title>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-300"
                    required
                  />
                </Stack>
              </Stack>

              <Button
                variant="primary"
                className="mt-6 w-full"
                type={'submit'}
                label={'submit'}
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </Box> */}

            {/* Rent Due and Electricity Bills */}
            <StatGroup className="p-4 rounded-lg shadow-md">
              <Stat>
                <StatLabel>Room Number</StatLabel>
                <StatNumber>{tenantInfo.tenantRoom}</StatNumber>
              </Stat>
            </StatGroup>

            <Stack direction={"row"}>
              {/* Rent Due */}
              <Flex direction="column" gap={6} className="flex-1">
                <Heading as="h3" size="md" className="text-primary">
                  Rent Due
                </Heading>
                <List spacing={3} className="p-4 rounded-lg shadow-md">
                  {rentDue.length === 0 ? (
                    <ListItem>
                      <Badge variant="outline" colorScheme="blue">
                        No rent due
                      </Badge>
                    </ListItem>
                  ) : (
                    rentDue.map((bill, index) => (
                      <ListItem key={index} className="flex items-center gap-3">
                        <FaMoneyBill className="text-primary" />
                        <Text>
                          ₹ {bill.rentAmount} - Rent period ends on {new Date(bill.rentPeriodEnd).toDateString()}
                        </Text>
                      </ListItem>
                    ))
                  )}
                </List>
              </Flex>

              {/* Electricity Bills */}
              <Flex direction="column" gap={6} className="flex-1">
                <Heading as="h3" size="md" className="text-primary">
                  Electricity Bills
                </Heading>
                <List spacing={3} className="p-4 rounded-lg shadow-md">
                  {eleBill.length === 0 ? (
                    <ListItem>
                      <Badge variant="outline" colorScheme="blue">
                        No electricity bills
                      </Badge>
                    </ListItem>
                  ) : (
                    eleBill.map((bill, index) => (
                      <ListItem key={index} className="flex items-center gap-3">
                        <FaBolt className="text-primary" />
                        <Text>
                          ₹ {bill.billAmount} - Electricity bill period ends on {new Date(bill.billPeriodEnd).toDateString()}
                        </Text>
                      </ListItem>
                    ))
                  )}
                </List>
              </Flex>
            </Stack>

            {/* Notifications */}
            <Heading as="h3" size="md" className="text-primary">
              Notifications
            </Heading>
            <Notify onlyNotification />

            {/* Logout */}
            <Flex justifyContent="flex-end">
              <Button
                colorScheme="red"
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Text>Error loading profile data</Text>
        )}
      </Skeleton>
    </Box>
  );
};

export default Profile;
