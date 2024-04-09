import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";

const Login = () => {
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
    window.location.reload();
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
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <div>
            <label htmlFor="email">Email</label>
            <Field as={Input} type="email" id="email" name="email" />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-600"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Field as={Input} type="password" id="password" name="password" />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-600"
            />
          </div>

          <Button type="submit" colorScheme="blue">
            Submit
          </Button>
        </Form>
      </Formik>
    </>
  );
};

export default Login;
