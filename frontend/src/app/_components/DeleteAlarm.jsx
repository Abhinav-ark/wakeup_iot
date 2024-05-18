"use client";
import { useState } from "react";
import axios from "axios";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const DeleteAlarm = ({
  setDeleteAlarmModal,
  deleteAlarmModal,
  setSuccessOpen,
  setErrorOpen,
  alarm,
  fetchAlarms,
}) => {
  const deleteAlarm = async () => {
    try {
      const response = await axios.delete(
        `${serverUrl}/user/alarms/${alarm._id}`
      );
      if (response.status === 200) {
        setSuccessOpen(true);
        setDeleteAlarmModal(false);
        fetchAlarms(); // Refresh alarms after deletion
      } else {
        setErrorOpen(true);
      }
    } catch (error) {
      setErrorOpen(true);
    }
  };

  return deleteAlarmModal ? (
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 w-full h-full bg-black opacity-40"
        onClick={() => setDeleteAlarmModal(false)}
      ></div>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
          <div className="flex justify-end">
            <button
              onClick={() => setDeleteAlarmModal(false)}
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
            <h4 className="text-lg font-medium text-gray-800">Delete Alarm</h4>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this alarm?
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => setDeleteAlarmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={deleteAlarm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default DeleteAlarm;
