import React from 'react'
import Layout from "../../layouts/layout";
import { Link } from 'react-router-dom';
import BOWCard from "../../components/BOWCard";

function CreateDryingPlan() {
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
                                        <a
                                            href="#"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
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
                                        <Link
                                            to="/workspace"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sấy gỗ</div>
                                        </Link>
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
                                            <div>Tạo kế hoạch sấy</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">Tạo kế hoạch sấy</div>

                    {/* Controller */}
                    <div className=" my-4 xl:w-full">
                        <label
                            for="search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only"
                        >
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="search"
                                id="search"
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search"
                                required
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5">
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                    </div>
                </div>
            </div>
    </Layout> 
  )
}

export default CreateDryingPlan