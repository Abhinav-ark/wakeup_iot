"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";
import { FcGoogle } from "react-icons/fc";
import { FaClock } from "react-icons/fa6";
import '../app/page.css';

axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const Page = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`);
      checkLoginState();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const {
        data: { url },
      } = await axios.get(`${serverUrl}/auth/url`);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loggedIn === false) {
      (async () => {
        try {
          const res = await axios.get(
            `${serverUrl}/auth/token${window.location.search}`
          );
          console.log("response: ", res);
          checkLoginState();
          router.replace("/dashboard");
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [checkLoginState, loggedIn]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-static">
      <div className="stars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        {/* Add more spans for more stars */}
      </div>
      <div className="bg-white shadow-xl border-[0.5px] border-gray  rounded-xl p-8 flex flex-col items-center w-96 h-96 relative z-10">
        <div className="flex items-center space-x-2 mt-10 mb-2">
          <FaClock size={45} />
          <span className="text-6xl font-semibold text-shadow-lg">WakeUp</span>
        </div>
        <span className="text-lg text-gray-600 mb-6">Experience the intelligent wake-up</span>
        <button
          className="bg-black text-white py-2 px-4 rounded-full flex items-center space-x-2 hover:bg-gray-800 hover:shadow-lg mt-7"
          onClick={handleLogin}
        >
          <FcGoogle />
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Page;
