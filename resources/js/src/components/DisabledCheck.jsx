import React, { useState, useEffect, useRef } from "react";
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
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import compareDesc from "date-fns/compareDesc/index.js";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { PiSealWarningFill } from "react-icons/pi";
import { MdDoNotDisturbOnTotalSilence } from "react-icons/md";


const validationSchema = Yup.object().shape({
    pallet: Yup.number()
        .positive("Phải là số nguyên dương")
        .integer("Phải là số nguyên")
        .min(1, "Phải là số nguyên dương lớn hơn 0")
        .required("Trường bắt buộc"),
    sample: Yup.number()
        .positive("Phải là số nguyên dương")
        .integer("Phải là số nguyên")
        .min(1, "Phải là số nguyên dương lớn hơn 0")
        .test(
            "is-less-than-or-equal",
            "Số lượng mẫu phải ≤ số lượng pallet",
            function (value) {
                const palletValue = this.parent.pallet;
                return !palletValue || !value || value <= palletValue;
            }
        )
        .required("Trường bắt buộc"),
    disability: Yup.number()
        .positive("Phải là số nguyên dương")
        .integer("Phải là số nguyên")
        .min(0, "Phải là số nguyên dương lớn hơn 0")
        .test(
            "is-less-than-or-equal",
            "Số lượng mo, tóp phải ≤ số lượng mẫu",
            function (value) {
                const sampleValue = this.parent.sample;
                return !sampleValue || !value || value <= sampleValue;
            }
        )
        .required("Trường bắt buộc"),
    curve: Yup.number()
        .positive("Phải là số nguyên dương")
        .integer("Phải là số nguyên")
        .min(0, "Phải là số nguyên dương lớn hơn 0")
        .test(
            "is-less-than-or-equal",
            "Số lượng cong phải ≤ số lượng mẫu",
            function (value) {
                const sampleValue = this.parent.sample;
                return !sampleValue || !value || value <= sampleValue;
            }
        )
        .required("Trường bắt buộc"),
    note: Yup.string().max(255, "Độ dài tối đa là 255 kí tự"),
});

const DisabledCheckCard = ({ item }) => {
    const {
        pallet,
        sample,
        disability,
        curve,
        disabledRate,
        curvedRate,
        note,
    } = item;

    return (
        <div className="w-full rounded text-sm bg-slate-700 text-white h-fit min-w-[250px] p-3 shadow-gray-400 drop-shadow-sm duration-300 hover:-translate-y-1">
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div className="text-sm">Số pallet:</div>
                <span className="text-right text-sm">{pallet}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div>Số lượng mẫu:</div>
                <span className="text-right">{sample}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div>Số lượng mo, tóp:</div>
                <span className="text-right">{disability}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div>Số lượng cong:</div>
                <span className="text-right">{curve}</span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div>Tỉ lệ mo, tóp:</div>
                <span className="text-right">
                    {disabledRate.toFixed() + " %"}{" "}
                </span>
            </div>
            <div className="grid grid-cols-[70%,30%] pb-2">
                <div>Tỉ lệ cong:</div>
                <span className="text-right">
                    {curvedRate.toFixed(2) + " %"}
                </span>
            </div>
            <div className="block">
                <div>
                    Ghi chú:{" "}
                    <span className="text-right text-sm italic">{note}</span>
                </div>
            </div>
        </div>
    );
};

const DisabledCheck = ({ disabilityList, generalInfo, code, oven, reason }) => {

    console.log("Ra truyền từ cha xuống nè: ", disabilityList);
    // const { planID, oven, code, reason } = props;

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

    const [viewMode, setViewMode] = useState(false);

    const [disabledDetails, setDisabledDetails] = useState([]);

    const [info, setInfo] = useState({
        pallet: null,
        sample: null,
        disability: null,
        curve: null,
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

    const addNewDisabledDetails = (values) => {
        if (!values.pallet) {
            toast.error("Vui lòng nhập số pallet.");
            palletInput.current.focus();
            return;
        }
        if (!values.sample) {
            toast.error("Vui lòng nhập số lượng mẫu.");
            sampleInput.current.focus();
            return;
        }
        if (!values.disability) {
            toast.error("Vui lòng nhập số lượng mo, tóp.");
            disabilityInput.current.focus();
            return;
        }
        if (!values.curve || !values.curve) {
            toast.error("Vui lòng nhập số lượng cong.");
            curveInput.current.focus();
            return;
        }

        const currentDisbledRate = (values.disability / values.sample) * 100;
        const currentCurvedRate = (values.curve / values.sample) * 100;

        const detailData = {
            ...values,
            disabledRate: currentDisbledRate,
            curvedRate: currentCurvedRate,
        };
        setDisabledDetails([...disabledDetails, detailData]);
        toast("Đã ghi nhận thành công!", {
            icon: "👏",
        });
    };

    const handleViewReport = (item) => {
        setReportInfo((prev) => ({ ...prev, createdDate: item.createdDate }));
        setViewMode(true);
        setDisabledDetails(item);
        onOpen();
    };

    const handleModalClose = () => {
        if (!viewMode) {
            if (
                disabledDetails.length > 0 ||
                info.pallet ||
                info.sample ||
                info.disability ||
                info.curve ||
                info.note
            ) {
                console.log(disabledDetails.length);
                const userConfirmed = window.confirm(
                    "Bạn có chắc muốn đóng cửa sổ hiện tại không? \nDữ liệu đã nhập sẽ không được lưu"
                );
                if (!userConfirmed) {
                    return;
                }
            }

            setDisabledDetails([]);
            onClose();
        } else {
            setReportInfo((prev) => ({ ...prev, createdDate: new Date() }));
            setDisabledDetails([]);
            onClose();
        }
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

    useEffect(() => {
        if (info.disability && info.sample) {
            const currentRate = (info.disability / info.sample) * 100;
            setRate({ ...rate, disabledRate: currentRate });
        }

        if (info.curve && info.sample) {
            const currentRate = (info.curve / info.sample) * 100;
            setRate({ ...rate, curvedRate: currentRate });
        }
    }, [info.disability, info.curve, info.sample]);

    useEffect(() => {
        const disabledRateSum = disabledDetails.reduce(
            (sum, item) => sum + item.disabledRate,
            0
        );
        const curvedRateSum = disabledDetails.reduce(
            (sum, item) => sum + item.curvedRate,
            0
        );
        const avgDisabledRate =
            disabledDetails.length > 0
                ? disabledRateSum / disabledDetails.length
                : null;
        const avgCurvedRate =
            disabledDetails.length > 0
                ? curvedRateSum / disabledDetails.length
                : null;

        const totalOfDisabilities = disabledDetails.reduce(
            (sum, item) => sum + item.disability,
            0
        );
        const totalOfCurves = disabledDetails.reduce(
            (sum, item) => sum + item.curve,
            0
        );

        // Đặt state mới
        setResult({
            avgDisabledRate,
            avgCurvedRate,
            totalOfDisabilities: totalOfDisabilities + totalOfCurves,
        });
    }, [disabledDetails]);

    useEffect(() => {
        if (info.pallet) {
            if (info.sample) {
                if (info.sample > info.pallet) {
                }
            }
        }
    }, [info.pallet, info.sample, info.disability, info.curve]);

    return (
        <>
            <div className="bg-white rounded-xl border-2 border-gray-200">
                <div className="text-xl flex justify-between items-center font-medium border-b px-6 p-4 border-gray-200">
                    <div className="flex gap-x-3 items-center ">
                        <div className="w-8 h-8">
                            <MdBuildCircle className="w-full h-full text-[#17506B]" />
                        </div>
                        <div className="xl:text-xl xl:w-full w-[70%] text-lg">
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
                        <div className="xl:flex hidden">Tạo mới</div>
                    </button>
                </div>
                {/* <div className="border-b-2 border-gray-100"></div> */}

                <div className="rounded-b-xl relative overflow-x-auto">
                    <table className="w-full text-left text-gray-500 ">
                        <thead className="font-medium text-gray-700 bg-gray-50 ">
                            <tr className="w-full text-[15px]">
                                <th scope="col" className=" flex-nowrap xl:px-6 pl-6 py-3">
                                    STT
                                </th>
                                <th scope="col" className="w-fit flex-nowrap xl:px-6  pl-6 py-3">
                                    TL mo, tóp
                                </th>
                                <th scope="col" className="xl:px-6 pl-6 py-3">
                                    TL cong
                                </th>
                                <th scope="col" className="xl:w-fit w-[60%] xl:px-6  py-3">
                                    Tổng SL kiểm tra
                                </th>
                                <th scope="col" className="xl:px-6 pl-6 py-3">
                                    Ngày tạo
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {disabilityList.length > 0 ? (
                                disabilityList.map((item, index) => (
                                    <tr  className="text-[15px] bg-white border-b">
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
                                            {item.avgDisabledRate.toFixed(2) +
                                                "%"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.avgCurvedRate.toFixed(2) +
                                                "%"}
                                        </td>
                                        <td className="px-6 py-4">
                                            --/--/--
                                        </td>
                                        <td className="px-6 py-4">
                                            {dateToDateTime(item.createdDate)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr
                                    aria-colspan={5}
                                    className="text-semibold text-center align-middle"
                                >
                                    Chưa phát sinh biên bản nào
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                        <div className="xl:ml-10 xl:text-center text-[#155979] text-lg uppercase xl:text-xl ">
                            Biên bản khảo sát tỉ lệ khuyết tật
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody>
                        <section className="flex flex-col justify-center">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-4 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white mb-7">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 px-8">
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
                            <div className="xl:mx-auto xl:w-[60%] bg-white rounded-xl border-2 h-fit w-full md:w-1/2 mb-7">
                                <div className="flex bg-gray-100 items-center gap-x-3 text-xl font-medium border-b p-4 px-8 border-gray-200 rounded-t-xl">
                                    <MdDoNotDisturbOnTotalSilence className=" w-8 h-8 text-2xl " />
                                    <div className="font-semibold">Tỉ lệ khuyết tật</div>
                                </div>

                                <div className="space-y-3 px-6 pb-5 pt-4">
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tỉ lệ mo, tóp trung bình:
                                        </div>
                                        <span className="font-bold text-right">
                                            {result.avgDisabledRate !==
                                                undefined &&
                                            result.avgDisabledRate !== null
                                                ? result.avgDisabledRate.toFixed(
                                                      2
                                                  )
                                                : "0.00"}
                                            <span className="font-bold">
                                                {" "}
                                                %
                                            </span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tỉ lệ cong trung bình:
                                        </div>
                                        <span className="font-bold text-right">
                                            {result.avgCurvedRate !==
                                                undefined &&
                                            result.avgCurvedRate !== null
                                                ? result.avgCurvedRate.toFixed(
                                                      2
                                                  )
                                                : "0.00"}
                                            <span className="font-bold">
                                                {" "}
                                                %
                                            </span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[70%,30%]">
                                        <div className="font-bold">
                                            Tổng khuyết tật:
                                        </div>
                                        <span className="font-bold text-right">
                                            {result.totalOfDisabilities || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {!viewMode && (
                            <section className="xl:mx-auto xl:w-[60%] bg-white flex flex-col rounded-2xl border-2 border-gray-200 h-fit w-full p-4 pt-0 pb-6 px-4">
                                <div className="flex gap-x-4 rounded-t-xl items-center p-4">
                                    <MdNoteAlt className="w-8 h-9 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Ghi nhận khảo sát
                                    </div>
                                </div>
                                <Formik
                                    initialValues={info}
                                    validationSchema={validationSchema}
                                    onSubmit={(values) => {
                                        addNewDisabledDetails(values);
                                    }}
                                >
                                    {({
                                        errors,
                                        touched,
                                        values,
                                        setFieldValue,
                                    }) => {
                                        return (
                                            <Form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl">
                                                <div className="mb-2">
                                                    <label
                                                        htmlFor="palletAmount"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Số pallet{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        ref={palletInput}
                                                        name="pallet"
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={values.pallet}
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "pallet",
                                                                e.target.value
                                                            );
                                                            setInfo((prev) => ({
                                                                ...prev,
                                                                pallet: e.target
                                                                    .value,
                                                            }));
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                min="1"
                                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            />
                                                        )}
                                                    />
                                                    {errors.pallet &&
                                                    touched.pallet ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="pallet" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={values.sample}
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "sample",
                                                                e.target.value
                                                            );
                                                            setInfo((prev) => ({
                                                                ...prev,
                                                                sample: e.target
                                                                    .value,
                                                            }));
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                min="1"
                                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            />
                                                        )}
                                                    />
                                                    {errors.sample &&
                                                    touched.sample ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="sample" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={
                                                            values.disability
                                                        }
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "disability",
                                                                e.target.value
                                                            );
                                                            setInfo((prev) => ({
                                                                ...prev,
                                                                disability:
                                                                    e.target
                                                                        .value,
                                                            }));
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            />
                                                        )}
                                                    />
                                                    {errors.disability &&
                                                    touched.disability ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="disability" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={values.curve}
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "curve",
                                                                e.target.value
                                                            );
                                                            setInfo((prev) => ({
                                                                ...prev,
                                                                curve: e.target
                                                                    .value,
                                                            }));
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            />
                                                        )}
                                                    />
                                                    {errors.curve &&
                                                    touched.curve ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="curve" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block mb-2 text-md font-medium text-gray-900">
                                                        Ghi chú{" "}
                                                    </label>
                                                    <Field
                                                        as="textarea"
                                                        rows="4"
                                                        ref={noteInput}
                                                        name="note"
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={values.note}
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "note",
                                                                e.target.value
                                                            );
                                                            setInfo((prev) => ({
                                                                ...prev,
                                                                note: e.target
                                                                    .value,
                                                            }));
                                                        }}
                                                    />
                                                    {errors.note &&
                                                    touched.note ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="note" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <Button
                                                    type="submit"
                                                    colorScheme="whatsapp"
                                                    className="w-fit self-end mt-2"
                                                >
                                                    Ghi nhận
                                                </Button>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </section>
                        )}

                        <section className="xl:mx-auto xl:w-[60%] my-4">
                            {disabledDetails.length > 0 && (
                                <div className="flex items-center gap-x-3 text-xl font-medium py-4 border-gray-200">
                                    <GrDocumentText className="text-[#17506B] text-2xl" />
                                    Danh sách chi tiết
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                                {disabledDetails.length > 0 &&
                                    disabledDetails.map((item, index) => (
                                        <DisabledCheckCard
                                            key={item.id || index}
                                            item={item}
                                        />
                                    ))}
                            </div>
                        </section>
                    </ModalBody>
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalFooter className="gap-4">
                        <Button onClick={handleModalClose}>Đóng</Button>
                        {!viewMode && (
                            <Button
                                disabled={disabledDetails.length <= 0}
                                colorScheme="red"
                                onClick={handleSubmitReport}
                            >
                                Hoàn thành
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DisabledCheck;
