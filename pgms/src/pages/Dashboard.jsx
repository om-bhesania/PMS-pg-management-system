import { useContext, useEffect, useState } from "react";
import { Card, Divider, AbsoluteCenter, Box, Spinner } from "@chakra-ui/react";
import Title from "./../components/utils/Title";
import useGetData from "../hooks/getData";
import useLoggedInUserData from "../hooks/useLoggedInUserData";
import SpinnerComponent from "../components/Spinner";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
const Dashboard = () => {
  ChartJS.register(ArcElement, Tooltip, Legend);
  const { loading, error, tenants, rooms, rentDue , eleBill } = useGetData();
  const [availableRoomCount, setAvailableRoomCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      const tenantCounts = tenants.reduce((acc, tenant) => {
        const room = tenant.tenantRoom;
        if (acc[room]) {
          acc[room] += 1;
        } else {
          acc[room] = 1;
        }
        return acc;
      }, {});

      const countAvailableRooms = rooms.filter((room) => {
        const inmateCount = tenantCounts[room.room] || 0;
        return inmateCount < room.beds;
      }).length;

      setAvailableRoomCount(countAvailableRooms);
    }
  }, [loading, rooms, tenants]);
  // const [income, setIncome] = useState(0);
  // const [expense, setExpense] = useState(0);

  // useEffect(() => {
  //   if (!loading) {
  //     const totalRent = tenants.map((acc, tenant) => {
  //       return acc + tenant.rent;
  //     }, 0);

  //     const totalExpense = eleBill.bills.map((acc, tenant) => {
  //       return acc + tenant.otherExpense + tenant.eleBill;
  //     }, 0);

  //     setIncome(totalRent);
  //     setExpense(totalExpense);
  //   }
  // }, [loading, tenants]);
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
              >
                1
              </Title>
            </div>
            <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgYellow">
              <Title size={"lg"} colorTheme={"primary"}>
                Available Rooms
              </Title>
              <Title
                size={"custom"}
                customClass={"font-secondary"}
                customSize={"text-5xl"}
              >
                {loading ? (
                  <SpinnerComponent />
                ) : (
                  availableRoomCount // Display the count of available rooms
                )}
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
                {loading ? <SpinnerComponent /> : rooms.length}
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
          {/* <Pie
            className="!h-[350px] !w-[350px]"
            data={{
              labels: ["Income", "Expense"],
              datasets: [
                {
                  data: [income , expense],
                  backgroundColor: ["#98C1D9", "#2A363B"],
                },
              ],
            }} 
          /> */}
        </div>
      </section>
    </>
  );
};

export default Dashboard;

// const testData = {
//   labels: ["Time", "Money", "Energy"],
//   datasets: [
//     {
//       label: "My First Dataset",
//       data: [300, 50, 100],
//       backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)"],
//     },
//   ],
// };
