import React from "react";
import "../assets/styles/home.css";
import { Link } from "react-router-dom";
import Header from "../layouts/header.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import { TbArrowNarrowRight } from "react-icons/tb";

function Home() {
    return (
        <div className="landing-page background-animate">
            <Header variant="homepage"/>
            <div className=" ">
                <div className=" flex items-center flex-col pt-20">
                    <div className="hero-txt text-4xl xl:text-6xl font-semibold xl:space-x-4 md:space-x-4 space-x-2 mt-20 mb-0 text-black">
                        <span>Get</span>
                        <span>your</span>
                        <span>work</span>
                        <span>done</span>
                    </div>
                    <div className="hero-txt text-5xl xl:text-7xl font-semibold xl:space-x-4 md:space-x-4 space-x-2 text-[#135A7C]">
                        <span>in</span>
                        <span>a</span>
                        <span>second.</span>
                    </div>
                    <div className=" hero-txt mt-6 text-center">
                        <span>Một sản phẩm từ Grant Thornton Vietnam.</span>
                    </div>
                    <Link to="/workspace" className="flex justify-center">
                        <button className="flex items-center justify-center xl:mt-8 md:mt-8 mt-14 p-3 px-6 bg-[#000] hover:bg-[#232323] text-white rounded-full active:scale-[.95] active:duration-75 transition-all ">
                            Bắt đầu làm việc
                            <TbArrowNarrowRight className="text-xl ml-2" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
