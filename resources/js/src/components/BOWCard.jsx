import React from 'react'

function BOWCard(props) {

  const { status, batchNumber, kilnNumber, thickness, height, purpose, finishedDate, palletQty, weight, type } = props;

  return (
    <div className='space-y-2 border-2 border-gray-200 rounded-2xl bg-white h-[26.5rem] shadow-sm'>
      {/* Header */}
      <div className='flex flex-col rounded-t-xl py-2 px-6 h-[30%]'>
        <div className=' p-1 px-3 text-xs text-slate-600 font-semibold bg-slate-200 w-fit rounded-full justify-end my-4'>{status}</div>
        <div className=' text-[1.25rem] font-bold text-[#17506B] '>
          Mẻ sấy số: 
          <span className='ml-2'>{batchNumber}</span>
        </div>
        <div className='text-lg font-semibold text-gray-700 '>
          Lò số: 
          <span className='ml-2'>{kilnNumber}</span>
        </div>    
      </div>

      <div className='border-b-2 border-gray-200 ml-6 w-[5rem]'></div>

      {/* Details */}
      <div className='space-y-2 pb-2 px-6 text-[15px] h-[45%]'>
        <div className=''>Chiều dày sấy: <span className='font-semibold ml-2'>{thickness}</span></div>
        <div>Chiều dài sấy: <span className='font-semibold ml-2'>{height}</span></div>
        <div>Mục đích sấy: <span className='font-semibold ml-2'>{purpose}</span></div>
        <div>Ngày dự kiến ra lò: <span className='font-semibold ml-2'>{finishedDate}</span></div>
        <div>Tổng số pallet: <span className='font-semibold ml-2'>{palletQty}</span></div>
        <div>Khối lượng mẻ: <span className='font-semibold ml-2'>{weight}</span></div>
      </div>

      {/* Controller */}
      <div className='py-4 px-6 border-t-2 border-[#cedde4] flex justify-end bg-[#F8FAFC] rounded-b-2xl h-[19%] '>
        <div className='font-medium cursor-pointer px-4 text-white bg-[#17506B] hover:bg-[#176081] w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all'>Xem chi tiết</div>
      </div>
    </div>
  )
}

export default BOWCard