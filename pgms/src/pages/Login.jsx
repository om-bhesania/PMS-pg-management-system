import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import Title from './../components/utils/Title';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const nav = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialValues = {
    email: "",
    password: "",
  };
  const generateToken = () => {
    return uuidv4();
  };
  const handleSubmit = (values) => {
    const { email, password } = values;
    const token = generateToken();
    values.email = "admin@gmail.com";
    values.password = "admin@gmail.com";
    
    
    if (values.email != email || values.password != password) {
      toast({
        title: "Incorrect Email or Password",
        status: "error",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
    } else {
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("role", "guest");
      nav("/dashboard");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      toast({
        title: "Login Successful.",
        status: "success",
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
      </div>
    </>
  );
};

export default Login;
