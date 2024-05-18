"use client";
import { Navbar } from '@/app/_components';
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";
import GraphWeight from '@/app/_components/GraphWeight';

axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const Page = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);
  const router = useRouter();

  const [weightCurrent, setWeightCurrent] = useState(0);
  const [weightPrevious, setWeightPrevious] = useState(0);
  const [weekX, setWeekX] = useState([]);
  const [weekY, setWeekY] = useState([]);
  const [monthX, setMonthX] = useState([]);
  const [monthY, setMonthY] = useState([]);
  const [secret, setSecret] = useState(false);

  useEffect(() => {
    if (loggedIn === null) {
      checkLoginState();
    } else if (loggedIn) {
      fetchData();
    }
  }, [loggedIn, checkLoginState]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${serverUrl}/user/weight`);
      if (response.status === 200) {
        const { weightCurrent, weightPrevious, weekX, weekY, monthX, monthY, secret } = response.data;
        setWeightCurrent(weightCurrent);
        setWeightPrevious(weightPrevious);
        setWeekX(weekX);
        setWeekY(weekY);
        setMonthX(monthX);
        setMonthY(monthY);
        setSecret(secret);
      } else if (response.status === 401) {
        console.error('Unauthorized access. Redirecting to login...');
        router.push('/');
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Unauthorized access. Redirecting to login...');
        router.push('/');
      } else {
        console.error('Error fetching data:', err);
      }
    }
  };

  if (!secret) {
    return (
      <>
        <Navbar user={user} />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-2xl font-bold">No Data Available</div>
        </div>
      </>
    );
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="justify-center items-center flex flex-col space-y-2 py-10">
        <h1 className="font-bold text-3xl">Weight Tracking</h1>
      </div>
      <div className="flex justify-center items-center mt-15 ml-6">
        <div className="flex flex-wrap justify-center gap-4 px-8 max-w-[95vw]">
          <GraphWeight
            title="Monthly weight Average"
            monthData={monthY}
            monthLabels={monthX}
            weekData={weekY}
            weekLabels={weekX}
            unit="kg"
            options={['Month', 'Week']}
            defaultOption="Month"
            badgeText={`${weightCurrent} kgs This Month`}
            additionalInfo={`${parseFloat((weightCurrent - weightPrevious).toFixed(2))} kgs 1 Month`}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
