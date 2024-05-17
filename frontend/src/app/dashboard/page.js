"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/app/_context";
import { Navbar } from "@/app/_components";

axios.defaults.withCredentials = true;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const AnotherPage = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);

  useEffect(() => {
    if (loggedIn === null) {
      checkLoginState();
    }
  }, [loggedIn, checkLoginState]);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (loggedIn === true) {
      (async () => {
        try {
          const {
            data: { posts },
          } = await axios.get(`${serverUrl}/user/posts`);
          setPosts(posts);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [loggedIn]);

  return (
    <div>
      <Navbar user={user} />
      <h3>Another Page</h3>
      {loggedIn ? (
        <div>
          <h4>{user?.name}</h4>
          <p>{user?.email}</p>
          <img src={user?.picture} alt={user?.name} />
          <div>
            {posts.map((post, idx) => (
              <div key={idx}>
                <h5>{post?.title}</h5>
                <p>{post?.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to view this page.</p>
      )}
    </div>
  );
};

export default AnotherPage;
