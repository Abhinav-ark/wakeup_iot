"use client";
import { Navbar } from '@/app/_components';
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";
import {GraphWeight} from '@/app/_components'; 

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

  const weightData = [0, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
  const weightLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
            data={weightData}
            labels={weightLabels}
            unit="kg"
            gap={0.7}
            options={['Month', 'Year']}
            defaultOption="Month"
            badgeText="54.3kgs This Year"
            additionalInfo="+4kgs 1 Year"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
