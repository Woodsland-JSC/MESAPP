import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layouts/layout";
import NotFoundIllustration from "../../assets/images/not-found-404.png";

const Notfound = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="max-w-screen-xl flex flex-col-reverse md:flex-row m-auto justify-center items-center md:mt-6 lg:mt-10 p-4 lg:p-6">
                <div className="w-7/9 mt-6 md:w-1/2 flex flex-col justify-center items-center">
                    <h1 className="text-[2rem] text-center md:text-left md:text-[3rem] xl:text-[4rem] leading-tight font-semibold mb-[30px]">
                        Trang không tồn tại
                    </h1>
                    <div className="mb-[16px] w-full text-[rgba(106,106,107,1)] text-[1.175rem] leading-normal flex flex-col justify-center ">
                        <p>Trang bạn đang tìm kiếm không tồn tại.</p>
                        <p>
                            Vui lòng điều hướng đến trang trước hoặc trang chủ.
                        </p>
                    </div>
                    <div className="flex gap-4 justify-center md:justify-start w-full">
                        <span
                            className="p-[14px] text-normal rounded bg-[#000000] text-white mt-2 cursor-pointer"
                            onClick={() => {
                                navigate(-1, {replace: true});
                            }}
                        >
                            Trang trước
                        </span>
                        <span
                            className="p-[14px] text-normal rounded bg-[#E04141] text-white mt-2 cursor-pointer"
                            onClick={() => {
                                navigate("/", {replace: true});
                            }}
                        >
                            Trở về trang chủ
                        </span>
                    </div>
                </div>
                <img
                    src={NotFoundIllustration}
                    alt="NotFoundImg"
                    className="w-5/9 sm:w-1/2 h-full md:h-[500px] object-contain"
                />
            </div>
        </Layout>
    );
};

export default Notfound;
