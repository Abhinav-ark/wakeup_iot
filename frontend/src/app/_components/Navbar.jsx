"use client";
import React, { useContext, useEffect } from "react";
import { ProfileCard } from "@/app/_components";
import { FaClock } from "react-icons/fa6";

const Navbar = ({ user }) => {
  return (
    <div className="shadow-md w-[100vw] h-20 flex flex-row justify-between items-center">
      <div className="flex justify-center items-center flex-row pl-10 space-x-2">
        <FaClock size={16} />
        <h1 className="text-lg font-bold">WakeUp</h1>
      </div>
      <div className="w-14 h-14 justify-center items-center mx-10">
        <ProfileCard member={user} />
      </div>
    </div>
  );
};

export default Navbar;
