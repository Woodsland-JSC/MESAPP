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
                    <div className="text-4xl xl:text-6xl font-semibold text-center mt-20 text-black">
                        Get your work done
                    </div>
                    <div className="text-5xl xl:text-7xl font-semibold text-center text-[#135A7C]">
                        in a second.
                    </div>
                    <div className="mt-6 text-center">
                        Một sản phẩm thuộc Grant Thornton Vietnam.
                    </div>
                    <Link to="/workspace" className="flex justify-center">
                        <button className="flex items-center justify-center mt-8 p-3 px-6 bg-[#17506B] hover:bg-[#156084] text-white rounded-full active:scale-[.95] active:duration-75 transition-all ">
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
