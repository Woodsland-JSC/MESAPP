import React, {
    useState,
    useMemo,
    useEffect,
    useRef,
    useCallback,
} from "react";
import palletsApi from "../api/palletsApi";
import axios from "axios";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { BsFillPlusCircleFill, BsFillBookmarkCheckFill } from "react-icons/bs";
import { GrDocumentText } from "react-icons/gr";
import { FaInfoCircle } from "react-icons/fa";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { dateToDateTime } from "../utils/convertDatetime";
import { FaPlus } from "react-icons/fa6";
import { MdBuildCircle } from "react-icons/md";
import { RiWaterPercentFill } from "react-icons/ri";
import { LuCalendarRange } from "react-icons/lu";
import { LuFlagTriangleRight } from "react-icons/lu";
import { LuWarehouse } from "react-icons/lu";
import { LuKeyRound } from "react-icons/lu";
import { LuStretchHorizontal } from "react-icons/lu";
import { MdWaterDrop } from "react-icons/md";
import { HiMiniSparkles } from "react-icons/hi2";
import { MdNoteAlt } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi";
import { IoClose, IoCloseSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import compareDesc from "date-fns/compareDesc/index.js";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { PiSealWarningFill } from "react-icons/pi";
import { MdDoNotDisturbOnTotalSilence } from "react-icons/md";
import { Spinner } from "@chakra-ui/react";

//
const DisabledCheckCard = (props) => {
    const {
        id,
        pallet,
        sample,
        disability,
        curve,
        disabledRate,
        curvedRate,
        note,
        createdDate,
    } = props;

    return (
        <div className="relative w-full rounded-xl cursor-pointer h-[20rem] bg-gray-100 min-w-[250px] p-4 px-4 shadow-gray-400 drop-shadow-sm duration-300 hover:-translate-y-1">
            <div
                className="absolute -top-1 -right-2.5 bg-gray-800 text-white flex w-7 h-7 items-center justify-center rounded-full cursor-pointer active:scale-[.84] active:duration-75 transition-all"
                // onClick={onOpen}
            >
                <IoCloseSharp className="text-white " />
            </div>
            <div></div>
            <div className="rounded-lg text-sm font-semibold bg-gray-300 mb-4 p-1 px-3 w-fit">
                {createdDate}
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">Số pallet:</div>
                <span className="text-right font-semibold">{pallet}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">Số lượng mẫu:</div>
                <span className="text-right font-semibold">{sample}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">
                    Số lượng mo, tóp:
                </div>
                <span className="text-right font-semibold">{disability}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">Số lượng cong:</div>
                <span className="text-right font-semibold">{curve}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">Tỉ lệ mo, tóp:</div>
                <span className="text-right font-semibold">
                    {disabledRate} %
                </span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-gray-600 font-medium">Tỉ lệ cong:</div>
                <span className="text-right font-semibold">{curvedRate} %</span>
            </div>
            <div className="block">
                <div className=" w-full  text-gray-600">
                    <div className="font-medium">Ghi chú: </div>
                    <div className="font-medium w-full truncate mt-1 text-gray-800">
                        {note}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DisabledCheck = ({
    planID,
    disabilityList,
    generalInfo,
    code,
    oven,
    reason,
}) => {
    let palletInput = useRef();
    let sampleInput = useRef();
    let disabilityInput = useRef();
    let curveInput = useRef();
    let noteInput = useRef();

    const [reportInfo, setReportInfo] = useState({
        id: "",
        createdDate: new Date(),
        dryingBatch: generalInfo.dryingBatch || "",
        factory: generalInfo.factory || "",
    });

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose,
    } = useDisclosure();

    const {
        isOpen: isDetailOpen,
        onOpen: onDetailOpen,
        onClose: onDetailClose,
    } = useDisclosure();

    const [viewMode, setViewMode] = useState(false);

    const [disabledDetails, setDisabledDetails] = useState([]);
    const [disabledList, setDisabledList] = useState([]);
    const [loadCurrentRecord, setLoadCurrentRecord] = useState(true);
    const [avgDisabledRate, setAvgDisabledRate] = useState(null);
    const [avgCurvedRate, setAvgCurvedRate] = useState(null);
    const [sumDisability, setSumDisability] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        onDetailOpen();
    };

    const [info, setInfo] = useState({
        pallet: "",
        sample: "",
        disability: "",
        curve: "",
        note: "",
    });

    const [rate, setRate] = useState({
        disabledRate: null,
        curvedRate: null,
    });

    const [result, setResult] = useState({
        avgDisabledRate: null,
        avgCurvedRate: null,
        totalOfDisabilities: null,
    });

    const loadCurrentDisabledRecords = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const planID = queryParams.get("id"); // Lấy giá trị của 'id' từ URL
        console.log("2. Giá trị planID nhận được là: ", planID);
        try {
            const response = await palletsApi.getTempDisabledRecords(
                planID,
                "KT"
            );
            setDisabledDetails(response.TempData);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        } finally {
            setLoadCurrentRecord(false);
        }
    };

    const loadDisabledRecordList = async () => {
        palletsApi
            .getDisabledListById(planID)
            .then((response) => {
                console.log("Dữ liệu từ API:", response);

                setDisabledList(response);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
            });
    };

    // Load Data
    useEffect(() => {
        loadCurrentDisabledRecords();
        // loadDisabledRecordList();
    }, []);

    // Handle Add New Record
    // const addNewDisabledDetails = async (values, { resetForm }) => {
    //     if (!values.pallet) {
    //         toast.error("Vui lòng nhập số pallet.");
    //         palletInput.current.focus();
    //         return;
    //     }
    //     if (!values.sample) {
    //         toast.error("Vui lòng nhập số lượng mẫu.");
    //         sampleInput.current.focus();
    //         return;
    //     }
    //     if (!values.disability) {
    //         toast.error("Vui lòng nhập số lượng mo, tóp.");
    //         disabilityInput.current.focus();
    //         return;
    //     }
    //     if (!values.curve || !values.curve) {
    //         toast.error("Vui lòng nhập số lượng cong.");
    //         curveInput.current.focus();
    //         return;
    //     }

    //     const currentDisabledRate = (
    //         (values.disability / values.sample) *
    //         100
    //     ).toFixed(2);
    //     const currentCurvedRate = (
    //         (values.curve / values.sample) *
    //         100
    //     ).toFixed(2);

    //     const detailData = {
    //         disabledRate: currentDisabledRate,
    //         curvedRate: currentCurvedRate,
    //     };

    //     const recordData = {
    //         PlanID: planID,
    //         SLMau: values.sample,
    //         SLPallet: values.pallet,
    //         SLMoTop: values.disability,
    //         SLCong: values.curve,
    //         note: values.note,
    //     };

    //     console.log("Dữ liệu sẽ được gửi đi:", recordData);
    //     try {
    //         const response = await palletsApi.addDisabledRecord(recordData);
    //         console.log("Trả về:", response.plandrying);
    //         await setDisabledDetails(response.plandrying, detailData);
    //         toast.success("Thông tin khảo sát đã được ghi nhận");

    //         resetForm();
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    const addNewDisabledDetails = async (values, resetForm) => {
        // Validation xử lý tại đây
        if (!values.pallet) {
            toast.error("Vui lòng nhập mã pallet.");
            if (palletInput.current) {
                palletInput.current.focus();
            }
            return;
        }
        if (!values.sample) {
            toast.error("Vui lòng nhập số lượng mẫu.");
            if (sampleInput.current) {
                sampleInput.current.focus();
            }
            return;
        }
        if (values.sample <= 0) {
            toast.error("Số lượng mẫu phải lớn hơn 0.");
            if (sampleInput.current) {
                sampleInput.current.focus();
            }
            return;
        }
        if (!values.disability) {
            toast.error("Vui lòng nhập số lượng mo, tóp.");
            if (disabilityInput.current) {
                disabilityInput.current.focus();
            }
            return;
        }
        if (values.disability < 0) {
            toast.error("Số lượng mo, tóp phải lớn hơn hoặc bằng 0.");
            if (disabilityInput.current) {
                disabilityInput.current.focus();
            }
            return;
        }
        if (values.disability > values.sample) {
            toast.error("Số lượng mo, tóp không được lớn hơn số lượng mẫu.");
            if (disabilityInput.current) {
                disabilityInput.current.focus();
            }
            return;
        }
        if (!values.curve) {
            toast.error("Vui lòng nhập số lượng cong.");
            if (curveInput.current) {
                curveInput.current.focus();
            }
            return;
        }
        if (values.disability < 0) {
            toast.error("Số lượng cong phải phải lớn hơn hoặc bằng 0.");
            if (curveInput.current) {
                curveInput.current.focus();
            }
            return;
        }
        if (values.disability > values.sample) {
            toast.error("Số lượng cong không được lớn hơn số lượng mẫu.");
            if (curveInput.current) {
                curveInput.current.focus();
            }
            return;
        }
        if (Number(values.disability) + Number(values.curve) > values.sample) {
            toast.error(
                "Tổng số lượng mo, tóp và cong không được lớn hơn số lượng mẫu."
            );
            return;
        }

        const currentDisabledRate = (
            (values.disability / values.sample) *
            100
        ).toFixed(2);
        const currentCurvedRate = (
            (values.curve / values.sample) *
            100
        ).toFixed(2);

        const detailData = {
            disabledRate: currentDisabledRate,
            curvedRate: currentCurvedRate,
        };

        const recordData = {
            PlanID: planID,
            SLMau: values.sample,
            SLPallet: values.pallet,
            SLMoTop: values.disability,
            SLCong: values.curve,
            note: values.note,
        };

        console.log("Dữ liệu sẽ được gửi đi:", recordData);
        try {
            const response = await palletsApi.addDisabledRecord(recordData);
            console.log("Trả về:", response.plandrying);
            await setDisabledDetails(response.plandrying, detailData);
            toast.success("Thông tin khảo sát đã được ghi nhận");

            resetForm();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleViewReport = (item) => {
        setReportInfo((prev) => ({ ...prev, createdDate: item.createdDate }));
        setViewMode(true);
        setDisabledDetails(item);
        onOpen();
    };

    const handleModalClose = () => {
        onClose();
    };

    const handleSubmitReport = async () => {
        if (disabledDetails.length <= 0) {
            console.log("Submit nè");
            toast.error("Vui lòng nhập thông tin khảo sát.");
        } else {
            toast.sucess("Thông tin khảo sát đã được lưu lại.");
            setRate({
                disabledRate: null,
                curvedRate: null,
            });
            setInfo({
                pallet: null,
                sample: null,
                disability: null,
                curve: null,
                note: "",
            });
            setDisabledDetails([]);
            onClose();
        }
    };

    //Calculate disabled and curved items
    const [calculatedValues, setCalculatedValues] = useState({
        avgDisabledRate: null,
        avgCurvedRate: null,
        sumDisability: null,
    });

    const calculateValues = useCallback(() => {
        const avgDisabledRate =
            disabledDetails.length > 0
                ? (
                      disabledDetails.reduce(
                          (sum, item) =>
                              sum + (item.SLMoTop / item.SLMau) * 100,
                          0
                      ) / disabledDetails.length
                  ).toFixed(2)
                : null;

        const avgCurvedRate =
            disabledDetails.length > 0
                ? (
                      disabledDetails.reduce(
                          (sum, item) => sum + (item.SLCong / item.SLMau) * 100,
                          0
                      ) / disabledDetails.length
                  ).toFixed(2)
                : null;

        const sumDisability =
            disabledDetails.length > 0
                ? disabledDetails.reduce(
                      (sum, item) => sum + item.SLMoTop + item.SLCong,
                      0
                  )
                : null;

        setCalculatedValues({
            avgDisabledRate,
            avgCurvedRate,
            sumDisability,
        });
    }, [disabledDetails]);

    useEffect(() => {
        calculateValues();
    }, [disabledDetails, calculateValues]);

    // Load Disabled List
    useEffect(() => {}, []);

    const [body, setBody] = useState({
        PlanID: null,
        TotalMau: null,
        TLMoTop: null,
        TLCong: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            await calculateValues();
        };

        fetchData();
    }, [disabledDetails]);

    useEffect(() => {
        const body = {
            PlanID: planID,
            TotalMau: calculatedValues.sumDisability,
            TLMoTop: calculatedValues.avgDisabledRate,
            TLCong: calculatedValues.avgCurvedRate,
        };
    }, [calculatedValues]);

    const finishDisabledCheck = async () => {
        await calculateValues();

        const body = {
            PlanID: planID,
            TotalMau: calculatedValues.sumDisability,
            TLMoTop: calculatedValues.avgDisabledRate,
            TLCong: calculatedValues.avgCurvedRate,
        };

        console.log("Dữ liệu sẽ được tạo biên bản khuyết tật: ", body);

        palletsApi
            .completeDisabledRecord(body)
            .then((response) => {
                if (response.message === "success") {
                    setDisabledList(response.disability);
                    toast.success("Ghi nhận biên bản khuyết tật thành công.");
                    setDisabledDetails([]);
                    loadDisabledRecordList();
                    onConfirmClose();
                    onClose();
                } else {
                    toast.error(
                        "Không thể thực hiện hành động, hãy thử lại sau."
                    );
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    return (
        <>
            <div className="bg-white rounded-xl border-2 border-gray-300">
                <div className="text-xl flex justify-between items-center font-medium border-b px-3 pr-4 p-3 border-gray-200">
                    <div className="flex gap-x-3 items-center ">
                        <div className="w-8 h-8">
                            <MdBuildCircle className="w-full h-full text-[#17506B]" />
                        </div>
                        <div className="serif font-bold xl:text-2xl xl:w-full w-[70%] text-[23px]">
                            Biên bản khảo sát tỉ lệ khuyết tật
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setViewMode(false);
                            onOpen();
                        }}
                        className="bg-gray-800 text-base flex items-center space-x-3 p-2 rounded-xl text-white xl:px-4 active:scale-[.95] h-fit w-fit active:duration-75 transition-all"
                    >
                        <FaPlus />
                        <div className="xl:flex lg:flex md:flex hidden">
                            Tạo mới
                        </div>
                    </button>
                </div>

                <div className="bg-white xl:p-0 lg:p-0 md:p-0 p-4 gap-y-4 relative rounded-b-xl max-h-[35rem] overflow-y-auto">
                    <div className="xl:hidden lg:hidden md:hidden">
                        {disabledList.length > 0 ? (
                            <div className="space-y-4">
                                {Array.isArray(disabledList) &&
                                    disabledList.map((item, index) => (
                                        <div
                                            className="rounded-xl bg-red-50 hover:bg-white cursor-pointer xl:text-base   border border-red-200"
                                            onClick={() =>
                                                handleRecordClick(item)
                                            }
                                        >
                                            <div className="px-4 py-2.5 flex justify-between items-center border-b border-red-200">
                                                <div className="">
                                                    <span className="text-lg font-semibold">
                                                        #{item.id}
                                                    </span>
                                                </div>
                                                <div className="p-1 px-3 bg-red-200 rounded-xl">
                                                    <span className="font-semibold">
                                                        Tổng: {item.TotalMau}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="px-4 divide-y divide-red-200">
                                                <div className="flex justify-between py-2">
                                                    <div className="">
                                                        Tỉ lệ mo, tóp:
                                                    </div>
                                                    <span className="font-semibold">
                                                        {item.TLMoTop}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <div className="">
                                                        Tỉ lệ cong:
                                                    </div>
                                                    <span className="font-semibold">
                                                        {item.TLCong}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <div className="">
                                                        Ngày tạo:
                                                    </div>
                                                    <span className="font-semibold">
                                                        {item.created_at}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center w-full py-3 text-gray-500">
                                Chưa có biên bản nào được ghi nhận
                            </div>
                        )}
                    </div>

                    <table className="w-full xl:inline-table lg:inline-table md:inline-table hidden text-left text-gray-500 ">
                        <thead className="font-medium text-gray-700 bg-gray-50 ">
                            <tr className="w-full text-[15px]">
                                <th
                                    scope="col"
                                    className=" flex-nowrap xl:px-6 pl-6 py-3"
                                >
                                    STT
                                </th>
                                <th
                                    scope="col"
                                    className="w-fit flex-nowrap xl:px-6  pl-6 py-3"
                                >
                                    TL mo, tóp
                                </th>
                                <th scope="col" className="xl:px-6 pl-6 py-3">
                                    TL cong
                                </th>
                                <th
                                    scope="col"
                                    className="xl:w-fit w-[60%] xl:px-6  py-3"
                                >
                                    Tổng SL kiểm tra
                                </th>
                                <th scope="col" className="xl:px-6 pl-6 py-3">
                                    Ngày tạo
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(disabledList) &&
                            disabledList.length > 0 ? (
                                <>
                                    {disabledList.map((item, index) => (
                                        <tr
                                            className="text-[15px] bg-white border-b"
                                            onClick={() =>
                                                handleRecordClick(item)
                                            }
                                        >
                                            <th
                                                scope="row"
                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                            >
                                                <span
                                                    href="#"
                                                    className="hover:underline text-bold cursor-pointer"
                                                    onClick={() =>
                                                        handleViewReport(
                                                            item.disabledDetails
                                                        )
                                                    }
                                                >
                                                    {item.id}
                                                </span>
                                            </th>
                                            <td className="px-6 py-4">
                                                {item.TLMoTop + "%"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.TLCong + "%"}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.TotalMau}
                                            </td>
                                            <td className="px-6 py-4">
                                                {dateToDateTime(
                                                    item.created_at
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <td
                                    class="w-full bg-white text-gray-500 cursor-pointer xl:text-base border-b "
                                    colSpan={5}
                                >
                                    <div className="flex justify-center  py-3">
                                        {" "}
                                        Chưa có biên bản nào được ghi nhận
                                    </div>
                                </td>
                            )}
                        </tbody>
                    </table>
                </div>
                {Array.isArray(disabledList) &&
                    disabledList.map((item, index) => (
                        <Modal
                            size="full"
                            isOpen={isDetailOpen}
                            onClose={onDetailClose}
                            scrollBehavior="inside"
                            isCentered
                            blockScrollOnMount={false}
                        >
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>
                                    <div className="xl:ml-10 xl:text-center text-lg uppercase xl:text-xl ">
                                        Biên bản khảo sát tỉ lệ khuyết tật
                                    </div>
                                </ModalHeader>
                                <ModalCloseButton />
                                <div className="border-b-2 border-gray-100"></div>
                                <ModalBody>
                                    {selectedRecord && (
                                        <>
                                            <section className="flex flex-col justify-center">
                                                {/* Infomation */}
                                                <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-4 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white mb-7">
                                                    <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 xl:px-8 lg:px-8 md:px-8">
                                                        <FaInfoCircle className="w-7 h-7 text-[]" />
                                                        <div className="text-xl font-semibold">
                                                            Thông tin chung
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 p-3 px-8">
                                                        <div className=" flex font-semibold items-center">
                                                            <LuCalendarRange className="w-5 h-5 mr-3" />
                                                            Ngày kiểm tra:
                                                        </div>
                                                        <span className=" text-base ">
                                                            {format(
                                                                new Date(),
                                                                "yyyy-MM-dd"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 p-2.5 px-8">
                                                        <div className="font-semibold flex items-center">
                                                            <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                                            Mẻ sấy số:
                                                        </div>
                                                        <span className="font-normal text-base ">
                                                            {code}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 p-2.5 px-8">
                                                        <div className="font-semibold flex items-center">
                                                            <LuWarehouse className="w-5 h-5 mr-3" />
                                                            Nhà máy:
                                                        </div>
                                                        <span className="font-normal text-base ">
                                                            {oven}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Result  */}
                                                <div className="xl:mx-auto xl:w-[60%] bg-white rounded-xl border-2 border-red-200 h-fit w-full md:w-1/2 mb-7">
                                                    <div className="flex bg-red-100 items-center gap-x-3 text-xl font-medium border-b p-4 py-3 xl:px-8 lg:px-8 md:px-8 border-red-200 rounded-t-xl">
                                                        <MdDoNotDisturbOnTotalSilence className="text-red-500 text-4xl " />
                                                        <div className="font-semibold text-red-600">
                                                            Tỉ lệ khuyết tật
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 px-6 pb-5 pt-4">
                                                        <div className="grid grid-cols-[70%,30%]">
                                                            <div className="font-bold">
                                                                Tỉ lệ mo, tóp
                                                                trung bình:
                                                            </div>
                                                            <span className="font-bold text-right">
                                                                {
                                                                    selectedRecord.TLMoTop
                                                                }{" "}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-[70%,30%]">
                                                            <div className="font-bold">
                                                                Tỉ lệ cong trung
                                                                bình:
                                                            </div>
                                                            <span className="font-bold text-right">
                                                                {
                                                                    selectedRecord.TLCong
                                                                }{" "}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-[70%,30%]">
                                                            <div className="font-bold">
                                                                Tổng khuyết tật:
                                                            </div>
                                                            <span className="font-bold text-right">
                                                                {
                                                                    selectedRecord.TotalMau
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="xl:mx-auto xl:w-[60%] bg-white flex flex-col rounded-2xl border-2 border-gray-200 h-fit w-full p-4 pt-0 mb-4 px-4">
                                                <div className="flex gap-x-4 rounded-t-xl items-center p-4 xl:px-6 lg:px-6 md:px-6 px-2">
                                                    <MdNoteAlt className="w-8 h-9 text-[]" />
                                                    <div className="text-xl font-semibold">
                                                        Ghi nhận khảo sát
                                                    </div>
                                                </div>
                                                <div className="border-b-2 border-gray-200"></div>

                                                <section className="my-4">
                                                    {loadCurrentRecord ? (
                                                        <div className="text-center">
                                                            <Spinner
                                                                thickness="4px"
                                                                speed="0.65s"
                                                                emptyColor="gray.200"
                                                                color="#155979"
                                                                size="xl"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 xl:px-3 lg:px-3 mt-2 md:px-3">
                                                            {selectedRecord
                                                                .detail.length >
                                                                0 &&
                                                                selectedRecord.detail.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => {
                                                                        const disabledRate =
                                                                            (
                                                                                (item.SLMoTop /
                                                                                    item.SLMau) *
                                                                                100
                                                                            ).toFixed(
                                                                                2
                                                                            );
                                                                        const curvedRate =
                                                                            (
                                                                                (item.SLCong /
                                                                                    item.SLMau) *
                                                                                100
                                                                            ).toFixed(
                                                                                2
                                                                            );

                                                                        return (
                                                                            <DisabledCheckCard
                                                                                key={
                                                                                    index
                                                                                }
                                                                                id={
                                                                                    item.id
                                                                                }
                                                                                pallet={
                                                                                    item.SLPallet
                                                                                }
                                                                                sample={
                                                                                    item.SLMau
                                                                                }
                                                                                disability={
                                                                                    item.SLMoTop
                                                                                }
                                                                                curve={
                                                                                    item.SLCong
                                                                                }
                                                                                note={
                                                                                    item.note
                                                                                }
                                                                                disabledRate={
                                                                                    disabledRate
                                                                                }
                                                                                curvedRate={
                                                                                    curvedRate
                                                                                }
                                                                            />
                                                                        );
                                                                    }
                                                                )}
                                                        </div>
                                                    )}
                                                </section>
                                            </section>
                                        </>
                                    )}
                                </ModalBody>
                                <div className="border-b-2 border-gray-100"></div>
                                <ModalFooter className="gap-4">
                                    <button
                                        onClick={onDetailClose}
                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    ))}
            </div>

            {/* Modal */}
            <Modal
                size="full"
                isOpen={isOpen}
                onClose={handleModalClose}
                scrollBehavior="inside"
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <div className=" serif font-bold text-2xl xl:block lg:block md:block hidden ">
                            Biên bản khảo sát tỉ lệ khuyết tật
                        </div>
                        <div className=" serif font-bold text-2xl xl:hidden lg:hidden md:hidden block">
                            Khảo sát tỉ lệ khuyết tật
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-200"></div>
                    <ModalBody className="bg-[#FAFAFA] !px-3.5">
                        <section className="flex flex-col justify-center">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-3 border-[#DADADA] rounded-xl divide-y divide-gray-200 bg-white mb-4">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-3 xl:px-4 lg:px-4 md:px-4">
                                    <FaInfoCircle className="w-7 h-7 text-[]" />
                                    <div className="serif text-2xl font-bold">
                                        Thông tin chung
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 p-3 px-8">
                                    <div className=" flex font-semibold items-center">
                                        <LuCalendarRange className="w-5 h-5 mr-3" />
                                        Ngày kiểm tra:
                                    </div>
                                    <span className=" text-base ">
                                        {format(new Date(), "yyyy-MM-dd")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                        Mẻ sấy số:
                                    </div>
                                    <span className="font-normal text-base ">
                                        {code}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuWarehouse className="w-5 h-5 mr-3" />
                                        Nhà máy:
                                    </div>
                                    <span className="font-normal text-base ">
                                        {oven}
                                    </span>
                                </div>
                            </div>

                            {/* Result  */}
                            <div className="xl:mx-auto xl:w-[60%] bg-white rounded-xl border-2 border-red-200 h-fit w-full md:w-1/2 mb-4">
                                <div className="flex bg-red-100 items-center gap-x-3 text-xl font-medium border-b p-3 py-3 xl:px-4 lg:px-4 md:px-4 border-red-200 rounded-t-xl">
                                    <MdDoNotDisturbOnTotalSilence className="text-red-500 text-4xl " />
                                    <div className="serif text-[22px] font-bold text-red-600">
                                        Tỉ lệ khuyết tật
                                    </div>
                                </div>

                                <div className="space-y-3 px-6 pb-5 pt-4">
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tỉ lệ mo, tóp trung bình:
                                        </div>
                                        <span className="font-bold text-right">
                                            {calculatedValues.avgDisabledRate ||
                                                0}{" "}
                                            %
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tỉ lệ cong trung bình:
                                        </div>
                                        <span className="font-bold text-right">
                                            {calculatedValues.avgCurvedRate ||
                                                0}{" "}
                                            %
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tổng khuyết tật:
                                        </div>
                                        <span className="font-bold text-right">
                                            {calculatedValues.sumDisability ||
                                                0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="xl:mx-auto xl:w-[60%] bg-white flex flex-col rounded-2xl border-2 border-[#DADADA] h-fit w-full p-3 pt-0 mb-4 px-3">
                            <div className="flex gap-x-3 rounded-t-xl items-center p-3 px-1 ">
                                <MdNoteAlt className="w-8 h-8 text-[]" />
                                <div className="serif text-[22px] font-bold">
                                    Ghi nhận khảo sát
                                </div>
                            </div>
                            {!viewMode && (
                                <Formik
                                    initialValues={info}
                                    onSubmit={() => {}}
                                >
                                    {({ values, setFieldValue, resetForm }) => (
                                        <div className="flex flex-col p-3 mb-6 bg-gray-50 border-2 gap-y-2 border-gray-200 rounded-xl">
                                            <div className="mb-2">
                                                <label
                                                    htmlFor="palletAmount"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Tổng số lượng trên pallet{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <Field
                                                    ref={palletInput}
                                                    name="pallet"
                                                    type="number"
                                                    className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    value={values.pallet}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "pallet",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block mb-2 text-md font-medium text-gray-900">
                                                    Số lượng mẫu{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <Field
                                                    ref={sampleInput}
                                                    name="sample"
                                                    type="number"
                                                    className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    value={values.sample}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "sample",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block mb-2 text-md font-medium text-gray-900">
                                                    Số lượng mo, tóp{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <Field
                                                    ref={disabilityInput}
                                                    name="disability"
                                                    type="number"
                                                    className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    value={values.disability}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "disability",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block mb-2 text-md font-medium text-gray-900">
                                                    Số lượng cong{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <Field
                                                    ref={curveInput}
                                                    name="curve"
                                                    type="number"
                                                    className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    value={values.curve}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "curve",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block mb-2 text-md font-medium text-gray-900">
                                                    Ghi chú{" "}
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    rows="3"
                                                    ref={noteInput}
                                                    name="note"
                                                    className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    value={values.note}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "note",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none w-fit self-end my-2"
                                                onClick={() =>
                                                    addNewDisabledDetails(
                                                        values,
                                                        resetForm
                                                    )
                                                }
                                            >
                                                Ghi nhận
                                            </button>
                                        </div>
                                    )}
                                </Formik>
                            )}
                            <div className="border-b-2 border-gray-200"></div>

                            <section className="my-2">
                                {loadCurrentRecord ? (
                                    <div className="text-center">
                                        <Spinner
                                            thickness="6px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="#155979"
                                            size="xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-2 px-1">
                                        {disabledDetails.length > 0 &&
                                            disabledDetails.map(
                                                (item, index) => {
                                                    const disabledRate = (
                                                        (item.SLMoTop /
                                                            item.SLMau) *
                                                        100
                                                    ).toFixed(2);
                                                    const curvedRate = (
                                                        (item.SLCong /
                                                            item.SLMau) *
                                                        100
                                                    ).toFixed(2);

                                                    return (
                                                        <DisabledCheckCard
                                                            key={index}
                                                            id={item.id}
                                                            pallet={
                                                                item.SLPallet
                                                            }
                                                            sample={item.SLMau}
                                                            disability={
                                                                item.SLMoTop
                                                            }
                                                            curve={item.SLCong}
                                                            note={item.note}
                                                            disabledRate={
                                                                disabledRate
                                                            }
                                                            curvedRate={
                                                                curvedRate
                                                            }
                                                            createdDate={
                                                                item.created_at
                                                            }
                                                        />
                                                    );
                                                }
                                            )}
                                    </div>
                                )}
                            </section>
                        </section>
                    </ModalBody>
                    <div className="border-b-2 border-gray-200"></div>
                    <ModalFooter className="gap-4">
                        <button
                            onClick={handleModalClose}
                            className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                        >
                            Đóng
                        </button>
                        {!viewMode && (
                            <>
                                <button
                                    className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full disabled:bg-[#7aacc3] disabled:cursor-default"
                                    onClick={onConfirmOpen}
                                    disabled={disabledDetails.length <= 0}
                                >
                                    Hoàn thành
                                </button>
                                <Modal
                                    isOpen={isConfirmOpen}
                                    onClose={onConfirmClose}
                                    isCentered
                                    size="sm"
                                    blockScrollOnMount={false}
                                    closeOnOverlayClick={false}
                                >
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader>
                                            Bạn chắc chắn muốn lưu kết quả này?
                                        </ModalHeader>
                                        <ModalBody pb={6}>
                                            Sau khi bấm xác nhận sẽ không thể
                                            thu hồi hành động.
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                colorScheme="blue"
                                                mr={3}
                                                onClick={finishDisabledCheck}
                                            >
                                                Xác nhận
                                            </Button>
                                            <Button
                                                colorScheme="gray"
                                                mr={3}
                                                onClick={onConfirmClose}
                                            >
                                                Đóng
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DisabledCheck;
