import React from 'react'

function SizeListItem(props) {

  const { size, pallet, Qty, weight  } = props;

  return (
    <div className='bg-[#F9FAFB] border border-gray-200 rounded-xl w-[12rem]'>
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