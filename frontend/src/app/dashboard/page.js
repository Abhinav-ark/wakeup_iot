"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/app/_context";
import { Navbar } from "@/app/_components";
import AlarmCard from "@/app/_components/AlarmCard";

axios.defaults.withCredentials = true;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const AnotherPage = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);

  function formatDateToIST(date) {
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
  
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  }

  function formatTimeToIST(date) {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
    };
  
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  }

  useEffect(() => {
    if (loggedIn === null) {
      checkLoginState();
    }
  }, [loggedIn, checkLoginState]);

  const [alarm, setAlarms] = useState([]);

  useEffect(() => {
    if (loggedIn === true) {
      (async () => {
        try {
          const {
            data: { alarms },
          } = await axios.get(`${serverUrl}/user/alarms`);
          setAlarms(alarms);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [loggedIn]);

  return (
    <div>
      <Navbar user={user} />
      {loggedIn ? (
        <div>
          <div className="justify-center items-center flex flex-col space-y-2 py-10">
            <h1 className="font-bold text-3xl">Welcome {user?.name}</h1>
            <h2 className="text-md">Start your day right with our wake-up routine tracker!</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 max-w-[95vw] mx-auto">
            {alarm.map((alarm, idx) => (
              <AlarmCard
                key={idx}
                time={formatTimeToIST(alarm?.time)}
                desc={alarm?.desc}
                date={formatDateToIST(alarm?.time)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to view this page.</p>
      )}
    </div>
  );
};

export default AnotherPage;
