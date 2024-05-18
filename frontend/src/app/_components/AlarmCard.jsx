import React from "react"; 

const AlarmCard = ({ time, desc, date, onEdit , onDelete}) => {
    return (
      <div className="border border-gray p-4 rounded-xl flex justify-between items-center w-full">
        <div className="wrap-text">
          <h5 className="font-bold text-lg">{time}</h5>
          <p>{desc}</p>
          <p className="text-gray-500">Date: {date}</p>
        </div>
        <div className="flex space-x-2">
        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:shadow-lg transition duration-200" onClick={onEdit} >Edit</button>
        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:shadow-lg transition duration-200" onClick={onDelete} >Delete</button>
        </div>
      </div>
    );
  };

export default AlarmCard;
