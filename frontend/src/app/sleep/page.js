"use client";
import { Navbar } from '@/app/_components';
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";
import SleepCard from '@/app/_components/SleepCard';
import Graph from '@/app/_components/Graph';

axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const Page = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);
  const router = useRouter();

  const average = (numbers) => {
    return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / numbers.length;
  };

  const [totalSleepTime, setTotalSleepTime] = useState("");
  const [deepSleepTime, setDeepSleepTime] = useState("");
  const [outOfBedDayX, setOutOfBedDayX] = useState([]);
  const [outOfBedDayY, setOutOfBedDayY] = useState([]);
  const [outOfBedWeekX, setOutOfBedWeekX] = useState([]);
  const [outOfBedWeekY, setOutOfBedWeekY] = useState([]);
  const [sleepQualityX, setSleepQualityX] = useState([]);
  const [sleepQualityY, setSleepQualityY] = useState([]);
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
      const response = await axios.get(`${serverUrl}/user/sleep`);
      if (response.status === 200) {
        const { totalSleepTime, deepSleepTime, outOfBedDayX, outOfBedDayY, outOfBedWeekX, outOfBedWeekY, sleepQualityX, sleepQualityY, secret } = response.data;
        setTotalSleepTime(totalSleepTime);
        setDeepSleepTime(deepSleepTime);
        setOutOfBedDayX(outOfBedDayX);
        setOutOfBedDayY(outOfBedDayY);
        setOutOfBedWeekX(outOfBedWeekX);
        setOutOfBedWeekY(outOfBedWeekY);
        setSleepQualityX(sleepQualityX);
        setSleepQualityY(sleepQualityY);
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
        <div className="text-2xl font-bold ">No Data Available</div>
      </div>
      </>
    );
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="justify-center items-center flex flex-col space-y-2 py-10">
        <h1 className="font-bold text-3xl">Sleep Tracking</h1>
      </div>
      <div className="flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 max-w-[95vw]">
          <SleepCard title="Total sleep time" time={totalSleepTime} date="Yesterday" />
          <SleepCard title="Deep sleep time" time={deepSleepTime} date="Yesterday" />
        </div>
      </div>
      <div className="flex justify-center items-center mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 max-w-[95vw]">
          <Graph
            title="Out of bed during sleep"
            dayData={outOfBedDayY}
            dayLabels={outOfBedDayX}
            weekData={outOfBedWeekY}
            weekLabels={outOfBedWeekX}
            unit="Times"
            gap={0.8}
            options={['Day', 'Week']}
            defaultOption="Day"
          />
          <Graph
            title="Monthly sleep quality"
            dayData={sleepQualityY}
            dayLabels={sleepQualityX}
            weekData={sleepQualityY}
            weekLabels={sleepQualityX}
            unit="Hours"
            gap={0.7}
            options={['Month']}
            defaultOption="Month"
            additionalInfo={{
              text: (average(sleepQualityY) > 7) ? "Good": (average(sleepQualityY) > 5.5 ) ? "Average": "Bad",
              badge: `Avg. ${average(sleepQualityY)}h / month`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
