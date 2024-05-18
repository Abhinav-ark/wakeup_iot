import React from 'react'

const StatCard = ({title,value,icon}) => {
  return (
    <div>
    <div>{title}</div>
    <div>{value}</div>
    <div>{icon}</div>
    </div>
  )
}

export default StatCard