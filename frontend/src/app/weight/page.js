"use client";
import {Navbar} from '@/app/_components'
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/_context";


axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const page = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === null) {
      checkLoginState();
    }
  }, [loggedIn, checkLoginState]);

  return (
    <div>
        <Navbar user={user}/>
    page</div>
  )
}

export default page