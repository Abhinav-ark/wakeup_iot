import React from 'react'
import Image from 'next/image'

const crypto = require("crypto");

const Navbar = () => {

  const genSHA256 = (email) => {
    return crypto.createHash("sha256").update(email).digest("hex");
  };
  const email = "abhinavramki2@gmail.com"
  
  return (
    <div className='shadow-md w-[100vw] h-20 flex flex-row justify-between items-center'>
      <div>
        <h1 className='text-2xl font-bold'>Logo</h1>
      </div>
      <div className='w-12 h-12 justify-center items-center mx-10'>
        <Image
          className="rounded-full border-2 border-black"
          alt="Travis Howard"
          src={
          "https://www.gravatar.com/avatar/" +
          genSHA256(email ?? "anokhapr@cb.amrita.edu") +
          ".jpg?s=200&d=robohash"
          }
          width={65}
          height={20}
        />
      </div>
    </div>
  )
}

export default Navbar