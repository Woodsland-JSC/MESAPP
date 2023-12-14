import React from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

function SizeListItem(props) {

  const { size, pallet, Qty, weight, onDelete  } = props;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const type = searchParams.get("type");

  return (
    <div className="relative bg-[#F9FAFB] border border-gray-200 rounded-xl h-[10rem] w-[12rem]">
        <div className={`absolute -top-1 -right-2.5 bg-gray-800 text-white w-6 h-6 items-center justify-center rounded-full cursor-pointer active:scale-[.84] active:duration-75 transition-all ${type==="kt"||type==="vl"? "flex" : "hidden"}`} onClick={onDelete}><IoCloseSharp className='text-white' /></div>
        <div className='flex text-left font-medium p-4 py-3 border-b border-gray-200 w-full'>
           <div>KT:</div>
           <div>{size}</div>
        </div>

        <div className='text-gray-600 space-y-2 py-3 p-4'>
          <div className='w-fit'>Pallet: {pallet}</div>
          <div className=''>SL: {Qty} (t)</div>
          <div className=''>KL: {weight} (m³)</div>
        </div>
    </div>
    
  )
}

export default SizeListItem