import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { IoIosArrowDown, IoMdArrowRoundBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import useAppContext from "../../../store/AppContext";
import Select from 'react-select';
import usersApi from "../../../api/userApi";
import { NOI_DIA, TU_BEP, VAN_CONG_NGHIEP } from "../../../shared/data";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import { formatNumber } from "../../../utils/numberFormat";
import { BiConfused } from "react-icons/bi";
import { getFactoryUTub, getTeamUTub } from "../../../api/MasterDataApi";
import { Alert, Box, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useDisclosure } from "@chakra-ui/react";
import { FaBox, FaCircleRight, FaClock, FaDiceD6, FaInstalod } from "react-icons/fa6";
import { MdDangerous } from "react-icons/md";
import { FaExclamationCircle } from "react-icons/fa";
import { TbPlayerTrackNextFilled } from "react-icons/tb";

const TuBep = () => {
    const { user } = useAppContext();

    const navigate = useNavigate();

    const groupSelectRef = useRef();
    const factorySelectRef = useRef();

    const [khoi, setKhoi] = useState(TU_BEP)
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [groupList, setGroupList] = useState([]);

    const [loadingData, setLoadingData] = useState(false);
    const [loading, setLoading] = useState(true);

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    useEffect(() => {
        if (!selectedGroup) return;

    }, [selectedGroup])

    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            const factory = selectedFactory?.value;
            if (!factory) return;

            setLoading(true);
            try {
                const res = await getTeamUTub(factory);

                const options = res.data.teams.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                    Factory: item.Factory,
                }));
                setGroupList(res);
                options.sort((a, b) => a.label.localeCompare(b.label));
                setGroupListOptions(options);
                groupSelectRef?.current?.setValue(options[0]);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
            setLoading(false);
        };
        getAllGroupWithoutQC();
    }, [selectedFactory]);

    useEffect(() => {
        const getFactoriesByBranchId = async () => {
            let selectedBranch = user?.branch;

            try {
                if (selectedBranch) {
                    factorySelectRef.current.clearValue();
                    setFactories([]);
                    let res = await getFactoryUTub(selectedBranch);

                    let options = res.data.factories.map((item) => ({
                        value: item.U_FAC,
                        label: item.Name,
                    }));

                    setFactories(options);
                } else {
                    setFactories([]);
                }
            } catch (error) {
                toast.error("Lấy danh sách nhà máy có lỗi.");
            }
        };
        getFactoriesByBranchId();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 xl:pt-6 lg:pt-6 md:pt-6 lg:p-12 md:p-12 p-4 xl:px-32">
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() => navigate(`/workspace?tab=wood-working`)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập sản lượng khối{" "}
                            <span className=" text-[#402a62]">
                                Tủ bếp
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-3 lg:space-x-3 md:space-x-3 space-x-0 ">
                                    {(user.role == 1 || user.role == 4) && (
                                        <div className="px-0 w-full">
                                            <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900 ">
                                                Nhà máy sản xuất
                                            </div>
                                            <Select
                                                ref={factorySelectRef}
                                                options={factories}
                                                onChange={(value) => {
                                                    console.log(value);

                                                    setSelectedFactory(value);
                                                }}
                                                placeholder="Tìm kiếm"
                                                className="mt-1 mb-3 w-full"
                                            />
                                        </div>
                                    )}

                                    <div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                            Tổ & Xưởng sản xuất
                                        </div>
                                        <Select
                                            isDisabled={loadingData}
                                            ref={groupSelectRef}
                                            options={groupListOptions}
                                            defaultValue={selectedGroup}
                                            onChange={(value) => {
                                                setSelectedGroup(value);
                                            }}
                                            placeholder="Tìm kiếm"
                                            className="mt-1 mb-4 w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col pb-0 w-full justify-end space-x-4">
                                    <div className="w-full">
                                        <label
                                            htmlFor="search"
                                            className="mb-2 font-medium text-gray-900 sr-only"
                                        >
                                            Tìm kiếm
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
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="search"
                                                id="search"
                                                className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 "
                                                placeholder="Tìm kiếm dự án"
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    {/* {selectedGroup &&
                                        !loadingData &&
                                        awaitingReception?.length > 0 && (
                                            <button
                                                onClick={onModalOpen}
                                                className="!ml-0 mt-3 sm:mt-0 sm:!ml-4 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-green-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                            >
                                                <HiMiniBellAlert className="text-xl" />
                                                <div className="w-full whitespace-nowrap">
                                                    Thông báo: Có phôi chờ xác
                                                    nhận
                                                </div>
                                            </button>
                                        )} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col pb-2 gap-4 gap-y-4 sm:px-0">
                        <div className="shadow-md relative  rounded-lg bg-white/30 z-1">
                            <div
                                className=" uppercase text-[18px] font-medium pl-3 bg-[#2A2C31] text-[white] p-2 py-1.5 xl:rounded-t-lg lg:rounded-t-lg md:rounded-t-lg"
                            >
                                Tấm LVL 13.5x1200x2440 (DA)
                            </div>
                            <div className="gap-y-2 w-full h-full rounded-b-xl flex flex-col pt-1 pb-1 bg-white ">
                                <section
                                    className="rounded-b-xl cursor-pointer duration-200 ease-linear"
                                >
                                    <div className="text-[#17506B] xl:flex lg:flex md:flex  items-center space-x-2 pt-2 px-4 font-medium ">
                                        <div className="flex items-center">
                                            <span>
                                                <IoIosArrowDown className="inline-block text-gray-500" />{" "}
                                                {" "}
                                                <span className="pl-2 font-medium text-[#17506b]">
                                                    <span>
                                                        XV {" "}(19*1200*2440)V.0
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-2 mt-1 overflow-hidden rounded-lg border-2 border-[#c4cfe7] mx-1.5 ">
                                        <table className="w-full divide-y divide-[#c4cfe7] border-collapse bg-[#ECEFF5] text-left text-sm text-gray-500">
                                            <thead className="bg-[#dae0ec] ">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-xs font-medium uppercase text-gray-500 "
                                                    >
                                                        LSX
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-1 py-2 text-xs font-medium uppercase text-gray-500 text-right"
                                                    >
                                                        <span className="xl:block lg:block md:block hidden">
                                                            Sản lượng
                                                        </span>
                                                        <span className="xl:hidden lg:hidden md:hidden block">
                                                            SL
                                                        </span>
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-xs font-medium uppercase  text-right text-gray-500"
                                                    >
                                                        <span className="xl:block lg:block md:block hidden">
                                                            Đã làm
                                                        </span>
                                                        <span className="xl:hidden lg:hidden md:hidden block">
                                                            ĐL
                                                        </span>
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-xs font-medium uppercase text-right text-gray-500"
                                                    >
                                                        Lỗi
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-xs text-right font-medium uppercase text-gray-500"
                                                    >
                                                        <span className="xl:block lg:block md:block hidden">
                                                            Còn lại
                                                        </span>
                                                        <span className="xl:hidden lg:hidden md:hidden block">
                                                            CL
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className=" border-t border-[#c4cfe7]  ">
                                                <tr
                                                    className="bg-[#ECEFF5] border-[#c4cfe7] border-b !text-[13px]"
                                                >
                                                    <th
                                                        onClick={
                                                            () => {
                                                                onModalOpen()
                                                            }
                                                        }
                                                        scope="row"
                                                        className="px-2 py-1 font-medium text-[#17506B] whitespace-nowrap hover:underline"
                                                    >
                                                        LVL-CH-2025-00037
                                                    </th>
                                                    <td className="px-2 py-2 text-right text-gray-800">
                                                        {formatNumber(
                                                            Number(1000)
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-right text-gray-900">
                                                        {formatNumber(
                                                            Number(200)
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-right text-gray-900">
                                                        {formatNumber(
                                                            Number(20)
                                                        )}
                                                    </td>
                                                    <td className="px-2  py-2 text-right text-gray-800">
                                                        {formatNumber(
                                                            Number(800)
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                            {/* <tfoot className="!text-[12px]">
                                                                        <tr>
                                                                            <td className="font-bold  text-gray-700 px-2 py-2">
                                                                                Tổng
                                                                            </td>
                                                                            <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                                {
                                                                                    formatNumber(Number(item.LSX.reduce((acc, curr) => acc + Number(curr.SanLuong), 0)))
                                                                                }
                                                                            </td>
                                                                            <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                                {
                                                                                    formatNumber(Number(tem.LSX.reduce((acc, curr) => acc + Number(curr.DaLam), 0)))
                                                                                }
                                                                            </td>
                                                                            <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                                {formatNumber(
                                                                                    Number(
                                                                                        item.LSX.reduce(
                                                                                            (acc, curr) =>
                                                                                                acc +
                                                                                                Number(
                                                                                                    curr.Loi
                                                                                                ),
                                                                                            0
                                                                                        )
                                                                                    )
                                                                                )}
                                                                            </td>
                                                                            <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                                {formatNumber(
                                                                                    Number(
                                                                                        item.LSX.reduce(
                                                                                            (acc, curr) =>
                                                                                                acc +
                                                                                                Number(
                                                                                                    curr.ConLai
                                                                                                ),
                                                                                            0
                                                                                        )
                                                                                    )
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tfoot> */}
                                        </table>
                                    </div>
                                </section>
                            </div >
                        </div >
                        {/* {
                            loadingData ? (
                                <div className="flex justify-center mt-12">
                                    <div className="special-spinner"></div>
                                </div>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <div className="shadow-md relative  rounded-lg bg-white/30 z-1">
                                        <div
                                            className=" uppercase text-[18px] font-medium pl-3 bg-[#2A2C31] text-[white] p-2 py-1.5 xl:rounded-t-lg lg:rounded-t-lg md:rounded-t-lg"
                                        >
                                            {data.NameSPDich || "Sản phẩm không xác định"}
                                        </div>
                                        <div className="gap-y-2 w-full h-full rounded-b-xl flex flex-col pt-1 pb-1 bg-white ">
                                            {
                                                data.Details.length > 0
                                                && data.Details.map((item, index) => (
                                                    <section
                                                        className="rounded-b-xl cursor-pointer duration-200 ease-linear"
                                                        key={index}
                                                    >
                                                        <div className="text-[#17506B] xl:flex lg:flex md:flex  items-center space-x-2 pt-2 px-4 font-medium ">
                                                            <div className="flex items-center">
                                                                <span>
                                                                    <IoIosArrowDown className="inline-block text-gray-500" />{" "}
                                                                    {item.ChildName}{" "}
                                                                    {item.CDOAN === "RO" ? (
                                                                        <span className="text-[#0da0ea]">
                                                                            {item.QuyCach2 || ""}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="">
                                                                            ({item.CDay}*{item.CRong}*
                                                                            {item.CDai})
                                                                        </span>
                                                                    )}
                                                                    {item.Version && (
                                                                        <span className="pl-2 font-medium text-[#17506b]">
                                                                            V.
                                                                            <span>
                                                                                {item.Version}
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mb-2 mt-1 overflow-hidden rounded-lg border-2 border-[#c4cfe7] mx-1.5 ">
                                                            <table className="w-full divide-y divide-[#c4cfe7] border-collapse bg-[#ECEFF5] text-left text-sm text-gray-500">
                                                                <thead className="bg-[#dae0ec] ">
                                                                    <tr>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase text-gray-500 "
                                                                        >
                                                                            LSX
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-1 py-2 text-xs font-medium uppercase text-gray-500 text-right"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Sản lượng
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                SL
                                                                            </span>
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase  text-right text-gray-500"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Đã làm
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                ĐL
                                                                            </span>
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase text-right text-gray-500"
                                                                        >
                                                                            Lỗi
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs text-right font-medium uppercase text-gray-500"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Còn lại
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                CL
                                                                            </span>
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className=" border-t border-[#c4cfe7]  ">
                                                                    {item.LSX?.length > 0 ? (
                                                                        item.LSX.filter(
                                                                            (production) =>
                                                                                production.ConLai > 0
                                                                        )
                                                                            .sort((a, b) => {
                                                                                return a.LSX.localeCompare(
                                                                                    b.LSX
                                                                                );
                                                                            })
                                                                            .map(
                                                                                (
                                                                                    production,
                                                                                    index
                                                                                ) => (
                                                                                    <tr
                                                                                        className="bg-[#ECEFF5] border-[#c4cfe7] border-b !text-[13px]"
                                                                                        key={index}
                                                                                    >
                                                                                        <th
                                                                                            onClick={
                                                                                                () => {
                                                                                                    viewProductionsDetails(item, production.LSX);
                                                                                                    setChoosenItem(item);
                                                                                                }
                                                                                            }
                                                                                            scope="row"
                                                                                            className="px-2 py-1 font-medium text-[#17506B] whitespace-nowrap hover:underline"
                                                                                        >
                                                                                            {
                                                                                                production.LSX
                                                                                            }
                                                                                        </th>
                                                                                        <td className="px-2 py-2 text-right text-gray-800">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.SanLuong
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right text-gray-900">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.DaLam
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right text-gray-900">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.Loi
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2  py-2 text-right text-gray-800">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.ConLai
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        {variant ==
                                                                                            VAN_CONG_NGHIEP && (
                                                                                                <td
                                                                                                    className="px-2 py-2 text-right text-[#17506B] underline"
                                                                                                    onClick={(
                                                                                                        e
                                                                                                    ) =>
                                                                                                        e.stopPropagation()
                                                                                                    }
                                                                                                >
                                                                                                    <MenuView actionKetCau={{ LSX: production.LSX, data: data }} actionVatTu={{ LSX: production.LSX, data: data }} />
                                                                                                </td>
                                                                                            )}
                                                                                    </tr>
                                                                                )
                                                                            )
                                                                    ) : (
                                                                        <span>Không có dữ liệu</span>
                                                                    )}
                                                                </tbody>
                                                                <tfoot className="!text-[12px]">
                                                                    <tr>
                                                                        <td className="font-bold  text-gray-700 px-2 py-2">
                                                                            Tổng
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {
                                                                                formatNumber(Number(item.LSX.reduce((acc, curr) => acc + Number(curr.SanLuong), 0)))
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {
                                                                                formatNumber(Number(tem.LSX.reduce((acc, curr) => acc + Number(curr.DaLam), 0)))
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {formatNumber(
                                                                                Number(
                                                                                    item.LSX.reduce(
                                                                                        (acc, curr) =>
                                                                                            acc +
                                                                                            Number(
                                                                                                curr.Loi
                                                                                            ),
                                                                                        0
                                                                                    )
                                                                                )
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {formatNumber(
                                                                                Number(
                                                                                    item.LSX.reduce(
                                                                                        (acc, curr) =>
                                                                                            acc +
                                                                                            Number(
                                                                                                curr.ConLai
                                                                                            ),
                                                                                        0
                                                                                    )
                                                                                )
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </section>
                                                ))
                                            }
                                        </div >
                                    </div >
                                ))
                            ) : (
                                <div className="h-full mt-10 flex flex-col items-center justify-center text-center">
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                    <div className="  text-lg text-gray-400">
                                        Không tìm thấy dữ liệu để hiển thị.
                                    </div>
                                </div>
                            )
                        } */}
                    </div>
                </div>
            </div>


            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                scrollBehavior="inside"
                trapFocus={false}
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent className="!px-0">
                    <ModalHeader className="h-[50px] flex items-center justify-center">
                        <div className="xl:ml-6 serif font-bold text-2xl  ">
                            Ghi nhận sản lượng
                        </div>
                    </ModalHeader>
                    <div className="border-b-2 border-[#DADADA]"></div>
                    <ModalBody px={0} py={0}>
                        
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0 ">
                        <Alert status="info" className="!py-2 !bg-[#A3DEFF]">
                            <TbPlayerTrackNextFilled className="text-[#155979] xl:mr-2 lg:mr-2 md:mr-2 mr-4 xl:text-xl lg:text-xl md:text-xl text-2xl" />
                            {/* <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col">
                                <span className="text-[15px] mr-1 sm:text-base">
                                    Công đoạn sản xuất tiếp theo:{"  "}
                                </span>
                                <span className="xl:text-[15px] lg:text-[15px] md:text-[15px] text-[17px] sm:text-base font-bold xl:ml-1 lg:ml-1 md:ml-1 ml-0">
                                    {selectedItemDetails?.NameTOTT ||
                                        "Chưa được thiết lập ở SAP"}{" "}
                                    (
                                    {selectedItemDetails?.TOTT?.split("-")[0] ||
                                        ""}
                                    )
                                </span>
                            </div> */}
                        </Alert>

                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                            <button
                                onClick={() => {
                                    onModalClose();
                                }}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                type="button"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Layout >
    );
}

export default TuBep;