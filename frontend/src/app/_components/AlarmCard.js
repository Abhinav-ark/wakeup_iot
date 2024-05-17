import React from "react";
import './warp.css'; // Make sure this path is correct

const AlarmCard = ({ time, desc, date }) => {
    return (
      <div className="border border-gray p-4 rounded-lg flex justify-between items-center w-full">
        <div className="wrap-text">
          <h5 className="font-bold text-lg">{time}</h5>
          <p>{desc}</p>
          <p className="text-gray-500">Date: {date}</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-black text-white px-4 py-2 rounded">Edit</button>
          <button className="bg-black text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    );
  };

export default AlarmCard;
