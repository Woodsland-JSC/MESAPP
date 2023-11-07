import React from "react";
import "../assets/styles/home.css";
import { Link } from "react-router-dom";
import Layout from "../layouts/layout.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import { TbArrowNarrowRight } from "react-icons/tb";

function Home() {
    return (
        <Layout>
            <div className="landing-page background-animate flex flex-col items-center p-40 ">
                <div className="text-6xl font-semibold text-center text-black">
                    Get your work done
                </div>
                <div className="text-7xl font-semibold text-center text-[#135A7C]">
                    in a second.
                </div>
                <div className="mt-6">
                    Một sản phẩm thuộc Grant Thornton Vietnam.
                </div>
                <Link to="/workspace">
                    <button className="flex items-center mt-8 p-3 px-6 bg-[#17506B] hover:bg-[#156084] text-white rounded-full active:scale-[.95] active:duration-75 transition-all ">
                        Bắt đầu làm việc
                        <TbArrowNarrowRight className="text-xl ml-2" />
                    </button>
                </Link>
            </div>
        </Layout>
    );
}

export default Home;
