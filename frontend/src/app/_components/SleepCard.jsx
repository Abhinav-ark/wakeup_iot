import React from 'react';

const SleepCard = ({ title, time, date }) => {
  return (
    <div className="bg-white shadow-md border-[0.5px] border-gray rounded-3xl px-8 p-10 flex flex-col items-center space-y-4 flex-grow max-w-full">
      <h3 className="text-2xl font-semibold " >{title}</h3>
      <p className="text-5xl font-normal pb-2">{time}</p>
      <button className="bg-black text-white w-72 py-2 rounded-2xl ">{date}</button>
    </div>
  );
};

export default SleepCard;
