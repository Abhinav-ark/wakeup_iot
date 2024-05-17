"use client";
import Image from 'next/image'
import React, { useContext, useEffect } from "react";
import {ProfileCard} from '@/app/_components';
import { FaClock } from "react-icons/fa6";

// const crypto = require("crypto");

const Navbar = ({user}) => {

  // const genSHA256 = (email) => {
  //   return crypto.createHash("sha256").update(email).digest("hex");
  // };
  const email = "abhinavramki2@gmail.com"
  
  return (
    <div className='shadow-md w-[100vw] h-20 flex flex-row justify-between items-center'>
      <div className='flex justify-center items-center flex-row pl-10 space-x-2'>
        <FaClock size={16}/>
        <h1 className='text-lg font-bold'>WakeUp</h1>
      </div>
      <div className='w-14 h-14 justify-center items-center mx-10'>
        {/* <Image
          className="rounded-full border-2 border-black"
          alt="Travis Howard"
          src={
          "https://www.gravatar.com/avatar/" +
          genSHA256(email ?? "anokhapr@cb.amrita.edu") +
          ".jpg?s=200&d=robohash"
          }
          width={65}
          height={20}
        /> */}
        <ProfileCard member={user} />
        {/* <img src={user?.picture} alt={user?.name} /> */}
      </div>
    </div>
  )
}

export default Navbar