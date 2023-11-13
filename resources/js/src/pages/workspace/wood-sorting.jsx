import React from "react";
import Layout from "../../layouts/layout";
import { Link } from "react-router-dom";
import PalletCard from "../../components/PalletCard";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";

const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];

// const customStyles = {
//   container: () => ({

//   }),
// }

function WoodSorting() {
    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center h-full bg-[#F8F9F7]">
                {/* Section */}
                <div className="w-screen p-12 px-32">
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
                                            <div>Tạo pallet xếp sấy</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">
                        Tạo pallet xếp sấy
                    </div>

                    {/* Components */}
                    <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                        <section>
                            <form>
                                <div className="grid gap-4 mb-6 xl:grid-cols-6">
                                    <div className="col-span-2">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Loại gỗ
                                        </label>
                                        <Select options={options} />
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            for="last_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Mã lô gỗ
                                        </label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            className=" border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            for="company"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Mục đích sấy
                                        </label>
                                        <Select options={options} />
                                    </div>
                                    <div className="col-span-4">
                                        <label
                                            for="company"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Quy cách thô
                                        </label>
                                        <Select options={options} />
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            for="company"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Ngày nhập gỗ
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            className=" border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full justify-end items-end">
                                    <button
                                        type="submit"
                                        className="text-white bg-gray-800 hover:bg-ray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                                    >
                                        Thêm vào danh sách
                                    </button>
                                </div>
                            </form>
                        </section>

                        <div className="my-4 border-b border-gray-200"></div>

                        {/* List */}
                        <div className="my-6 space-y-5">
                            <PalletCard name="26 142 2300 - 16 Láng Hạ khối VP+NH - xương ngang ngoài 2
                            " inStock="12" batchNum="12"/>
                        </div>

                        <div className="flex w-full justify-between items-center">
                            <div className="text-gray-500">
                                Tổng: <span>0</span>
                            </div>
                            <button
                                type="submit"
                                className="flex items-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                            >
                                Tạo pallet
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default WoodSorting;
