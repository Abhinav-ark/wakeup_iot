"use client";
import React from "react";
import { Navbar } from "@/app/_components";
import axios from "axios";
import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// Ensures cookie is sent
axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const page = () => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const router = useRouter();

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user },
      } = await axios.get(`${serverUrl}/auth/logged_in`);
      setLoggedIn(logged_in);
      user && setUser(user);
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  const [posts, setPosts] = useState([])
  // useEffect(() => {
  //   ;(async () => {
  //     if (loggedIn === true) {
  //       try {
  //         // Get posts from server
  //         const {
  //           data: { posts },
  //         } = await axios.get(`${serverUrl}/user/posts`)
  //         setPosts(posts)
  //       } catch (err) {
  //         console.error(err)
  //       }
  //     }
  //   })()
  // }, [loggedIn])

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`)
      // Check login state again
      checkLoginState()
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogin = async () => {
    try {
      // Gets authentication url from backend server
      const {
        data: { url },
      } = await axios.get(`${serverUrl}/auth/url`)
      // Navigate to consent screen
      window.location.assign(url)
      (async () => {
        if (loggedIn === false) {
          try {
            // if (called.current) return // prevent rerender caused by StrictMode
            // called.current = true
            const res = await axios.get(`${serverUrl}/auth/token${window.location.search}`)
            console.log('response: ', res)
            checkLoginState()
          } catch (err) {
            console.error(err)
          }
        } else if (loggedIn === true) {
        }
      })()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (loggedIn === false) {
        try {
          // if (called.current) return // prevent rerender caused by StrictMode
          // called.current = true
          const res = await axios.get(`${serverUrl}/auth/token${window.location.search}`)
          console.log('response: ', res)
          checkLoginState()
          // navigate('/')
        } catch (err) {
          console.error(err)
          // navigate('/')
        }
      } else if (loggedIn === true) {
        // navigate('/')
      }
    })()
  }, [checkLoginState, loggedIn])

  return (
    <div>
      <Navbar />
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
      <h3>Dashboard</h3>
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
      <h4>{user?.name}</h4>
      <br />
      <p>{user?.email}</p>
      <br />
      <img src={user?.picture} alt={user?.name} />
      <br />
      {/* <div>
        {posts.map((post, idx) => (
          <div>
            <h5>{post?.title}</h5>
            <p>{post?.body}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default page;
