"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";

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
          const res = await axios.get(`${serverUrl}/auth/token${window.location.search}`);
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
    <div>
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
      <h3>Dashboard</h3>
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
      
      {/* <div>
        {posts.map((post, idx) => (
          <div key={idx}>
            <h5>{post?.title}</h5>
            <p>{post?.body}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Page;
