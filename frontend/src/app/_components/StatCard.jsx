import React from 'react'

const StatCard = ({title,value,icon}) => {
  return (
    <div className='items-center justify-center space-y-5'>
      <h1 className='items-center justify-center font-bold'>{title}</h1>
      <div className='flex flex-col h-32 w-32 space-y-2 shadow-xl rounded-3xl border-[0.5px] border-gray items-center justify-center mx-auto hover:scale-110 transition-all'>
        <div>{icon}</div>
        <p className='font-semibold'>{value}</p>
      </div>
    </div>
  )
}

export default StatCard