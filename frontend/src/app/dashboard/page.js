"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/app/_context";
import { Navbar } from "@/app/_components";
import { AlarmCard } from "@/app/_components";
import { StatCard } from "@/app/_components";
import { AddAlarm } from "@/app/_components";
import { EditAlarm } from "@/app/_components";
import { DeleteAlarm } from "@/app/_components"; // Import DeleteAlarm
import { IoMdAlarm } from "react-icons/io";
import { FaDatabase } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';

axios.defaults.withCredentials = true;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const Dashboard = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [addAlarmModal, setAddAlarmModal] = useState(false);
  const [editAlarmModal, setEditAlarmModal] = useState(false);
  const [deleteAlarmModal, setDeleteAlarmModal] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null); // State to hold the selected alarm

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

  const [alarms, setAlarms] = useState([]);
  const [stats, setStats] = useState({ "wakeUpTime": "-.-", "wakeUpScore": "-.-", "sleepTime": "-.-" });

  const fetchAlarms = async () => {
    try {
      const response = await axios.get(`${serverUrl}/user/alarms`);
      if (response.status === 200) {
        const { alarms, stats } = response.data;
        setAlarms(alarms);
        setStats(stats);
      } else if (response.status === 401) {
        console.error('Unauthorized access. Redirecting to login...');
        window.location.href = '/';
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Unauthorized access. Redirecting to login...');
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    if (loggedIn === true) {
      fetchAlarms();
    }
  }, [loggedIn]);

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    fetchAlarms();
  }, [successOpen]);

  const handleEdit = (alarm) => {
    setSelectedAlarm(alarm);
    setEditAlarmModal(true);
  };

  const handleDelete = (alarm) => {
    setSelectedAlarm(alarm);
    setDeleteAlarmModal(true);
  };

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
            {alarms.map((alarm, idx) => (
              <AlarmCard
                key={idx}
                time={formatTimeToIST(alarm?.time)}
                desc={alarm?.desc}
                date={formatDateToIST(alarm?.time)}
                onEdit={() => handleEdit(alarm)} // Pass the alarm to handleEdit
                onDelete={() => handleDelete(alarm)} // Pass the alarm to handleDelete
              />
            ))}
          </div>
          <div className="justify-center items-center flex flex-col py-10">
            <button onClick={() => setAddAlarmModal(true)} className="border border-gray-200 text-gray-400 px-10 pt-1 pb-2 rounded-xl hover:bg-gray-100/10 hover:shadow-lg transition duration-200"><span className="text-2xl">+</span> Add Alarm</button>
          </div>
          <AddAlarm setAddAlarmModal={setAddAlarmModal} addAlarmModal={addAlarmModal} setErrorOpen={setErrorOpen} setSuccessOpen={setSuccessOpen}/>
          {selectedAlarm && (
            <EditAlarm
              setEditAlarmModal={setEditAlarmModal}
              editAlarmModal={editAlarmModal}
              setErrorOpen={setErrorOpen}
              setSuccessOpen={setSuccessOpen}
              alarm={selectedAlarm}
            />
          )}
          {selectedAlarm && (
            <DeleteAlarm
              setDeleteAlarmModal={setDeleteAlarmModal}
              deleteAlarmModal={deleteAlarmModal}
              setErrorOpen={setErrorOpen}
              setSuccessOpen={setSuccessOpen}
              alarm={selectedAlarm}
              fetchAlarms={fetchAlarms}
            />
          )}
          <div className="justify-center items-center flex flex-col space-y-2 py-10">
            <h1 className="font-bold text-4xl">Weekly Stats</h1>
            <div className="justify-center items-center flex flex-wrap flex-row space-x-10 py-10">
              <StatCard title={"Average WakeUp Time"} value={stats?.wakeUpTime} icon={<IoMdAlarm size={40}/>}/>
              <StatCard title={"Weekly WakeUp Score"} value={stats?.wakeUpScore} icon={<FaDatabase size={35}/>}/>
              <StatCard title={"Average Sleep Time"} value={stats?.sleepTime} icon={<FaBed size={40}/>}/>
            </div>
          </div>
          <div className={`fixed z-1000 bottom-10 mx-auto items-center justify-center w-full h-30 ${successOpen ? 'flex' : 'hidden'}`}>
            <div className="">
              <Collapse in={successOpen}>
                <Alert severity="success">
                  <AlertTitle>Success</AlertTitle>
                  Operation Successfully
                </Alert>
              </Collapse>
            </div>
          </div>
          <div className={`fixed z-1000 bottom-10 flex mx-auto items-center justify-center w-full h-30`}>
            <div className="">
              <Collapse in={errorOpen}>
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  Operation Failed 
                </Alert>
              </Collapse>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center h-[100vh]">
          <div className="my-auto">
            <CircularProgress size={60} color="inherit"/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
