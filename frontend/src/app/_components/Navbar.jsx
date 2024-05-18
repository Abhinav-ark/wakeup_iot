"use client";
import React, { useContext, useEffect } from "react";
import { ProfileCard } from "@/app/_components";
import { FaClock } from "react-icons/fa6";
import Link from "next/link";

const Navbar = ({ user }) => {
  return (
    <div className="shadow-md w-[100vw] h-20 flex flex-row justify-between items-center">
      <div className="flex justify-center items-center flex-row pl-10 space-x-4">
        <div className="flex justify-center items-center flex-row space-x-2 pr-3">
          <FaClock size={16} />
          <h1 className="text-lg font-bold">WakeUp</h1>
        </div>
        <Link href="/dashboard" className="hover:font-bold text-sm">Home</Link>
        <Link href="/sleep" className="hover:font-bold text-sm">Sleep</Link>
        <Link href="/weight" className="hover:font-bold text-sm">Weight</Link>
      </div>
      <div className="w-16 justify-center items-center mx-10">
        <ProfileCard member={user} />
      </div>
    </div>
  );
};

export default Navbar;
