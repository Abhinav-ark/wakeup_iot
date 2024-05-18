"use client";
import { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const AddAlarm = ({ setAddAlarmModal, addAlarmModal, setSuccessOpen, setErrorOpen }) => {
  const [alarm, setAlarm] = useState({
    time: 0,
    desc: "",
  });

  const addAlarm = async () => {
    try {
      const response = await axios.post(`${serverUrl}/user/createAlarm`, {
        time: alarm.time,
        desc: alarm.desc
      });

      if (response.status === 200) {
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000); 
        setAddAlarmModal(false);
      } else {
        setErrorOpen(true);
        setTimeout(() => setErrorOpen(false), 2000);
      }
    } catch (error) {
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 2000);
      console.error('Error:', error);
    }
  };

  return addAlarmModal ? (
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 w-full h-full bg-black opacity-40"
        onClick={() => setAddAlarmModal(false)}
      ></div>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
          <div className="flex justify-end">
            <button
              onClick={() => setAddAlarmModal(false)}
              className="p-2 text-gray-400 rounded-2xl hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="max-w-sm mx-auto-3 py-3 space-y-3 text-center items-center justify-center mx-auto">
            <h4 className="text-lg font-medium text-gray-800">Create New Alarm</h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative mt-3">
                <input
                  type="datetime-local"
                  placeholder="Alarm Time"
                  onChange={(e) => setAlarm({ ...alarm, time: e.target.value })}
                  className="w-full pl-5 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-black shadow-sm rounded-lg"
                />
              </div>
              <div className="relative mt-3">
                <textarea
                  className="w-full pl-5 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-black shadow-sm rounded-lg"
                  name="textarea"
                  placeholder="Description"
                  onChange={(e) => setAlarm({ ...alarm, desc: e.target.value })}
                  rows="2"
                  cols="30"
                />
              </div>

              <button
                onClick={() => addAlarm()}
                className="block w-full mt-3 py-3 px-4 font-medium text-sm text-center
                text-white hover:bg-gray-800 hover:shadow-lg bg-black
                rounded-lg ring-offset-2 ring-black focus:ring-2"
              >
                Create Alarm / Reminder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default AddAlarm;
