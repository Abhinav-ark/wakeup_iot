"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const EditAlarm = ({
  setEditAlarmModal,
  editAlarmModal,
  setSuccessOpen,
  setErrorOpen,
  setSelectedAlarm, // Ensure this prop is received
  alarm,
  updateAlarmsState, // New prop to update alarms state
}) => {
  const [editedAlarm, setEditedAlarm] = useState({
    alarmId: alarm.alarmId,
    time: alarm.time,
    desc: alarm.desc,
  });

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    console.log(editedAlarm);
  }, [editedAlarm]);

  const updateAlarm = async () => {
    try {
      const response = await axios.post(`${serverUrl}/user/editAlarm`, editedAlarm);
      if (response.status === 200) {
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000); 
        setEditAlarmModal(false);
        setSelectedAlarm(null); // Use the prop correctly
        updateAlarmsState(editedAlarm); // Update alarms state
      } else {
        setErrorOpen(true);
        setTimeout(() => setErrorOpen(false), 2000); 
      }
    } catch (err) {
      setErrorOpen(true);
      setTimeout(() => setErrorOpen(false), 2000); 
    }
  };

  return editAlarmModal ? (
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 w-full h-full bg-black opacity-40"
        onClick={() => setEditAlarmModal(false)}
      ></div>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
          <div className="flex justify-end">
            <button
              onClick={() => {setEditAlarmModal(false); setSelectedAlarm(null);}}
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
          <div className="max-w-sm mx-auto py-3 space-y-3 text-center items-center justify-center mx-auto">
            <h4 className="text-lg font-medium text-gray-800">
              Edit Alarm
            </h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative mt-3">
                <input
                  type="datetime-local"
                  value={editedAlarm.time}
                  placeholder="Alarm Time"
                  onChange={(e) =>
                    setEditedAlarm({ ...editedAlarm, time: e.target.value })
                  }
                  className="w-full pl-5 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-black shadow-sm rounded-lg"
                />
              </div>
              <div className="relative mt-3">
                <textarea
                  className="w-full pl-5 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-black shadow-sm rounded-lg"
                  name="textarea"
                  placeholder="Description"
                  value={editedAlarm.desc}
                  onChange={(e) =>
                    setEditedAlarm({ ...editedAlarm, desc: e.target.value })
                  }
                  rows="2"
                  cols="30"
                />
              </div>
              <button
                onClick={updateAlarm}
                className="block w-full mt-3 py-3 px-4 font-medium text-sm text-center
                text-white hover:bg-gray-800 hover:shadow-lg bg-black
                rounded-lg ring-offset-2 ring-black focus:ring-2"
              >
                Update Alarm
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

export default EditAlarm;
