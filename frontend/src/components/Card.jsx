import React from 'react'

const Card = ({ children }) => {
  return (
    <div className="rounded-lg shadow-sm p-6 flex-grow flex flex-col justify-center outline outline-1 outline-stone-200">
    {children}
    </div>
  )
}
export default Card