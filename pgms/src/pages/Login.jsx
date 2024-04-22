import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import Title from "./../components/utils/Title";
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import useGetData from "./../hooks/getData";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useLoggedInUserData from "../hooks/useLoggedInUserData";
import { useAuth } from "../components/authProvider";

const Login = () => {
  const { tenantCreds, Role } = useGetData();
  const [emailInitial, setEmailInitial] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [masterData, setMasterData] = useState();
  const { login } = useAuth();
  const loggedInUserData = useLoggedInUserData(isLoggedIn, emailInitial);
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values) => {
    const { email, password } = values;

    try {
      // Fetch tenant credentials from the database
      const tenantCredsQuery = query(
        collection(db, "tenantCreds"),
        where("email", "==", email )
      );
      const tenantCredsSnapshot = await getDocs(tenantCredsQuery);

      // Check if tenant credentials exist
      if (!tenantCredsSnapshot.empty) {
        tenantCredsSnapshot.forEach((doc) => {
          const tenantData = doc.data();
          const encryptedPassword = tenantData.password;
          setIsLoggedIn(true);
          setEmailInitial(email.toLowerCase());
          if (tenantData.email) {
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("role", tenantData.role); 
            sessionStorage.setItem("data", JSON.stringify(tenantData));
            setTimeout(() => {
              sessionStorage.clear();
            }, 60 * 60 * 1000);
          }
          window.location.reload();
          window.location.href = '/';
          // Decrypt password from the database
          const decryptedPassword = CryptoJS.AES.decrypt(
            encryptedPassword,
            "this@is@secret@key__"
          ).toString(CryptoJS.enc.Utf8);
          // window.location.href = "/dashboard";
          if (decryptedPassword === password) {
            window.localStorage.setItem("token", true);
            window.localStorage.setItem("role", tenantData.role);

            // Show success message
            toast({
              title: "Login Successful.",
              status: "success",
              position: "top-right",
              duration: 3000,
              isClosable: true,
            });
          } else {
            // Show error message for incorrect password
            toast({
              title: "Incorrect Password",
              status: "error",
              position: "top-right",
              duration: 3000,
              isClosable: true,
            });
          }
        });
      } else {
        // Show error message for invalid email
        toast({
          title: "Invalid Email",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Show error message for database fetch error
      toast({
        title: "Error",
        description: "Failed to fetch tenant credentials: " + error.message,
        status: "error",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toast = useToast();

  return (
    <>
      <Title>Login</Title>
      <div className=" ">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form className="max-w-[250px]">
            <div className="flex flex-col items-start justify-center mb-3 max-w-full">
              <label htmlFor="email">Email</label>
              <Field
                as={Input}
                type="email"
                id="email"
                name="email"
                style={{ border: "2px solid #9D4400" }}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-600"
              />
            </div>
            <div className="flex flex-col items-start justify-center mb-3 max-w-full">
              <label htmlFor="password">Password</label>
              <Field
                as={Input}
                type="password"
                id="password"
                name="password"
                style={{ border: "2px solid #9D4400" }}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600"
              />
            </div>

            <Button
              type="submit"
              style={{ background: "#003E56", color: "white" }}
              _hover={{
                background: "#9D4400",
                color: "white",
              }}
            >
              Login
            </Button>
          </Form>
        </Formik>
        {loggedInUserData && (
          <div>
            <p>
              Name:{" "}
              {loggedInUserData.tenantName
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase())}
            </p>
            <p>Email: {loggedInUserData.email}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
