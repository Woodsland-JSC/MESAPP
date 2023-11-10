import React from 'react'
import Layout from "../../layouts/layout";
import { Link } from 'react-router-dom';
import { HiMiniSparkles } from "react-icons/hi2";

function Users() {
  return (
    <Layout>
      {/* Container */}
      <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen p-12 px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                      <HiMiniSparkles className='text-[#1E7BA6] text-lg'/>
                                        <a
                                            href="#"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        > 
                                            Home
                                        </a>
                                    </div>
                                </li>
                            
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Quản lý người dùng</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-12">Quản lý người dùng</div>
                </div>
            </div>  
    </Layout>
  )
}

export default Users