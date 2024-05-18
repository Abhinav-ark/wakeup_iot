"use client";
import { Navbar } from '@/app/_components';
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";
import SleepCard from '@/app/_components/SleepCard'; // Adjust the path as necessary
import Graph from '@/app/_components/Graph'; // Adjust the path as necessary

axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const Page = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === null) {
      checkLoginState();
    }
  }, [loggedIn, checkLoginState]);

  const dailyData = [3, 2, 4, 3, 2, 1, 0];
  const dailyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthlyData = [6, 7, 5, 8, 6, 7, 5, 8, 6, 7, 5, 8];
  const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <Navbar user={user} />
      <div className="justify-center items-center flex flex-col space-y-2 py-10">
        <h1 className="font-bold text-3xl">Sleep Tracking</h1>
      </div>
      <div className="flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 max-w-[95vw]">
          <SleepCard title="Total sleep time" time="6h 23m" date="Yesterday" />
          <SleepCard title="Deep sleep time" time="4h 13m" date="Yesterday" />
        </div>
      </div>
      <div className="flex justify-center items-center mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 max-w-[95vw]">
          <Graph
            title="Out of bed during sleep"
            data={dailyData}
            labels={dailyLabels}
            unit="Times"
            gap={0.8}
            options={['Day', 'Week']}
            defaultOption="Day"
          />
          <Graph
            title="Monthly sleep quality"
            data={monthlyData}
            labels={monthlyLabels}
            unit="Hours"
            gap={0.7}
            options={['Month']}
            defaultOption="Month"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
