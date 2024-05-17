"use client";
import React, { useState, createElement } from "react";
import Image from "next/image";

import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import {
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
} from "@material-tailwind/react";
import { FaPowerOff } from "react-icons/fa6";
import Link from "next/link";

const ProfileCard = ({ member }) => {
  const [isArrowMenuOpen, setIsArrowMenuOpen] = useState(false);
  const handlearrowclick = () => {
    setIsArrowMenuOpen(!isArrowMenuOpen);
    console.log(isArrowMenuOpen);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (event) => {};

  const handleLogOut = () => {
    window.location.href = "/";
  };

  return (
    <div>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        placement="bottom-end"
        animate={{
          mount: { y: 0 },
          unmount: { y: 25 },
        }}
      >
        <MenuHandler>
          <Button
            variant="text"
            color="blue"
            onClick={handleClick}
            className="flex flex-row items-center rounded-full backdrop-blur-3xl"
          >
            <div className="border-black border-2 p-0 rounded-full bg-gray-300 ">
              <Image
                className="rounded-full"
                alt={member?.name}
                src={member?.picture}
                width={100}
                height={100}
              />
            </div>
            <div className="cursor-pointer">
              {isMenuOpen ? (
                <FaArrowUp size={10} color="gray" onClick={handlearrowclick} />
              ) : (
                <FaArrowDown
                  size={10}
                  color="gray"
                  onClick={handlearrowclick}
                />
              )}
            </div>
          </Button>
        </MenuHandler>
        <MenuList className="z-40 p-1">
          <MenuItem className="group flex items-center gap-3 rounded hover:bg-gray-500/10">
            <Typography as="span" variant="small" color="gray">
              {member?.name}
            </Typography>
          </MenuItem>
          <MenuItem className="group flex items-center gap-3 rounded hover:bg-gray-500/10">
            <Typography as="span" variant="small" color="gray">
              {member?.email}
            </Typography>
          </MenuItem>
          <MenuItem
            className="group flex items-center gap-3 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
            onClick={handleLogOut}
          >
            {createElement(FaPowerOff, {
              strokeWidth: 2,
              className: `h-4 w-4 mt-2 mx-1 ${"text-red-500 group-hover:text-red-700 "} 
                      group-transition ease-in duration-300
                      `,
            })}
            <Typography
              as="span"
              variant="small"
              className={`group-transition ease-in duration-300 font-normal mt-2 text-red-500 group-hover:text-red-700`}
            >
              Sign Out
            </Typography>
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};

export default ProfileCard;
