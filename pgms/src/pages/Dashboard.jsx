import { useContext } from "react";
import { Card, Divider, AbsoluteCenter, Box, Spinner } from "@chakra-ui/react";
import Title from "./../components/utils/Title";
import useGetData from "../hooks/getData";
import useLoggedInUserData from "../hooks/useLoggedInUserData";
import SpinnerComponent from "../components/Spinner";

const Dashboard = () => {
  const { loading, error, tenants, fetchtenants } = useGetData();
  return (
    <>
      <section className="dashboard">
        <div className="container">
          <div className="upper-cards-info flex gap-5 max-h-[150px] flex-wrap">
            <div className="flex-1 rounded-lg flex flex-col justify-center items-center p-6 px-10 shadow-lg bg-bgBlue">
              <Title size={"lg"}>Total Pg</Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
                ps={"false"}
              >
                1
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgYellow">
              <Title
                size={"lg"}
                colorTheme={"primary"}
                customClass={"whitespace-nowrap"}
                ps={"false"}
              >
                Available Rooms
              </Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
                ps={"false"}
              >
                2
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgPurple">
              <Title size={"lg"} colorTheme={"primary"} ps={"false"}>
                Total Rooms
              </Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
                ps={"false"}
              >
                {tenants.map((tenant) => tenant.roomNo).length}
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgRed  ">
              <Title size={"lg"}>Total tenants</Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                colorTheme={"primary"}
                customSize={"text-5xl"}
                ps={"false"}
              >
                {loading ? (
                  <SpinnerComponent />
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
              <Title size={"lg"} colorTheme={"primary"}>
                Latest Tenants
              </Title> 
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
