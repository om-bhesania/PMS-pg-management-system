import { useContext } from "react";
import { Card, Divider, AbsoluteCenter, Box, Spinner } from "@chakra-ui/react";
import Title from "./../components/utils/Title";
import useGetData from "../hooks/getData";
import useLoggedInUserData from "../hooks/useLoggedInUserData";
import { AuthContext } from "../components/authProvider";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const { loading, error, tenants, fetchtenants } = useGetData();
  const { isLoggedIn, emailInitial } = auth; // Using properties from the auth context
  const loggedInUserData = useLoggedInUserData(isLoggedIn, emailInitial);
  return (
    <>
      <section className="dashboard">
        <div className="container">
          <div className="upper-cards-info flex gap-5 max-h-[150px] flex-wrap">
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgBlue">
              <Title size={"lg"}>Total Pg</Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
              >
                1
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgYellow">
              <Title
                size={"lg"}
                colorTheme={"primary"}
                customClass={"whitespace-nowrap"}
              >
                Available Rooms
              </Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
              >
                2
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgPurple">
              <Title size={"lg"} colorTheme={"primary"}>
                Total Rooms
              </Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
              >
                5
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgRed  ">
              <Title size={"lg"}>Total tenants</Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
              >
                {loading ? (
                  <Spinner className="text-primary" size={"xl"} />
                ) : error ? (
                  <Title
                    size={"custom"}
                    customSize={"text-2xl"}
                    colorTheme={"danger"}
                    customClass={"font-semibold"}
                  >
                    Something went wrong
                  </Title>
                ) : (
                  tenants.length
                )}
              </Title>
            </div>
          </div>
          <div className="latest-info flex flex-col">
            <div className="my-10" />
            <div className="flex p-6 rounded-lg outline-2 outline-primary outline">
              {loggedInUserData ? (
                <div>
                  <p>Name: {loggedInUserData.tenantName.split(' ').map(word => word.charAt(0).toUpperCase())}</p>
                  <p>Email: {loggedInUserData.email}</p>
                </div>
              ) : "asdwd"}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
