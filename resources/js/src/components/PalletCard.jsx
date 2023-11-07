import React from 'react'

function PalletCard(props) {

  const { name } = props;

  return (
    <div className='border-2 border-[#c6d3da] rounded-xl'>
      <div className="bg-[#F6F8F9] rounded-t-xl ">
        <div className='text-[#17506B] text-xl font-semibold px-4 py-4'>000000000000000</div>
        <div></div>
      </div>

      <div className='bg-white py-4 rounded-b-xl'>

      </div>
    </div>
  )
}

export default PalletCard 