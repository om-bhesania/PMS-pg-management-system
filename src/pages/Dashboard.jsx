import { useEffect, useState } from 'react';
import { Flex, Spinner, Stack } from '@chakra-ui/react';
import Title from './../components/utils/Title';
import useGetData from '../hooks/getData';
import SpinnerComponent from '../components/Spinner';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Notify from '../components/notification/notify';
import NoDataCard from './../components/utils/noDataCard';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { loading, error, tenants, rooms, rentdue, eleBill, expenseTracker } = useGetData();
  const [availableRoomCount, setAvailableRoomCount] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    if (!loading) {
      const tenantCounts = tenants.reduce((acc, tenant) => {
        const room = tenant.tenantRoom;
        acc[room] = (acc[room] || 0) + 1;
        return acc;
      }, {});

      const countAvailableRooms = rooms.filter((room) => {
        const inmateCount = tenantCounts[room.room] || 0;
        return inmateCount < room.beds;
      }).length;

      setAvailableRoomCount(countAvailableRooms);
    }
  }, [loading, rooms, tenants]);

  useEffect(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalEleBill = 0;
    let expenseTrackerAmount = 0;

    eleBill.forEach((bill) => {
      totalEleBill += bill.bills[1]?.billAmount || 0;
    });
    expenseTracker.forEach((bill) => {
      expenseTrackerAmount += bill.amount || 0;
    });
    rentdue.forEach((rent) => {
      totalIncome += rent.bills[0]?.rentAmount || 0;
    });
    totalExpense = totalEleBill + expenseTrackerAmount;

    setIncome(totalIncome);
    setExpense(totalExpense);
  }, [rentdue, eleBill]);

  return (
    <section className="dashboard">
      <div className="containers">
        <div className="upper-cards-info flex gap-5 md:max-h-[150px] flex-wrap">
          <div className="flex-1 rounded-lg flex flex-col justify-center items-center p-6 px-10 shadow-lg bg-bgBlue">
            <Title size="lg">Total PG</Title>
            <Title size="custom" customClass="font-secondary" customSize="text-5xl">
              1
            </Title>
          </div>

          <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgYellow">
            <Title size="lg" colorTheme="primary">
              Available Rooms
            </Title>
            <Title size="custom" customClass="font-secondary" customSize="text-5xl">
              {loading ? <SpinnerComponent /> : String(availableRoomCount)}
            </Title>
          </div>

          <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgPurple">
            <Title size="lg" colorTheme="primary">
              Total Rooms
            </Title>
            <Title size="custom" customClass="font-secondary" customSize="text-5xl">
              {loading ? <SpinnerComponent /> : String(rooms.length)}
            </Title>
          </div>

          <div className="flex-1 rounded-lg flex flex-col items-center p-6 px-10 shadow-lg bg-bgRed">
            <Title size="lg">Total Tenants</Title>
            <Title size="custom" customClass="font-secondary" customSize="text-5xl">
              {loading ? (
                <SpinnerComponent />
              ) : error ? (
                <Title size="custom" customSize="text-2xl" colorTheme="danger" customClass="font-semibold">
                  Something went wrong
                </Title>
              ) : (
                String(tenants.length)
              )}
            </Title>
          </div>
        </div>


        <div className="flex items-start justify-center flex-row-reverse max-sm:flex-col-reverse h-full w-full mt-10">
          <div className="flex flex-1 justify-center items-center w-full h-full">
            {income > 0 || expense > 0 ? (
              <>
                <div className="max-h-full">
                  <Pie
                    style={{
                      height: '450px',
                      width: '450px',
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        filler: {
                          propagate: true
                        },
                        legend: {
                          display: true,
                          position: "bottom",
                        },
                      },
                    }}
                    fallbackContent='No data currently'
                    data={{
                      labels: ["Income", "Expense"],
                      datasets: [
                        {
                          data: [income ? income : 0 , expense ? expense : "0"],
                          backgroundColor: ["#5cb85c", "#d9534f"],
                        },
                      ],
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                {loading ?
                  (
                    <>
                      <Flex align={'center'} justify={'center'} h={'100%'}>
                        <SpinnerComponent variant={'7xl'} />
                      </Flex>
                    </>
                  ) : (
                    <>
                      <NoDataCard title={'No data'} message={'Currently no transactions have been made  '} />
                    </>
                  )}
              </>

            )}
          </div>
          <div className="max-w-[337px] total-stats flex flex-col flex-1 space-y-7">
            <div className="flex-1 max-h-[132px] rounded-lg flex flex-col justify-center items-center p-6 px-10 shadow-lg bg-success/40">
              <Title size="lg" colorTheme="primary">
                Total Income
              </Title>
              <Title size="custom" customClass="font-secondary" customSize="text-5xl">
                {loading ? <SpinnerComponent /> : `₹ ${income}`}
              </Title>
            </div>

            <div className="flex-1 max-h-[132px] rounded-lg flex flex-col justify-center items-center p-6 px-10 shadow-lg bg-danger/40">
              <Title size="lg" colorTheme="primary">
                Total Expense
              </Title>
              <Title size="custom" customClass="font-secondary" customSize="text-5xl">
                {loading ? <SpinnerComponent /> : `₹ ${expense}`}
              </Title>
            </div>
          </div>
        </div>
      </div>
      {loading ?
        (
          <>
            <Flex align={'center'} justify={'start'} h={'100%'}>
              <SpinnerComponent variant={'2xl'} />
            </Flex>
          </>
        ) : (
          <Stack gap={5} className='mt-10'>
            {/* <Stack>
              <Title size={'lg'}>
                Your Notifications
              </Title>
              <Notify onlyNotification />
            </Stack> */}
            <Stack>
              <Title size={'lg'}>
                Server Notifications
              </Title>
              <NoDataCard title={'Cooming Soon...'} message={'under development...'} />
            </Stack>
          </Stack>
        )}
    </section>
  );
};

export default Dashboard;
