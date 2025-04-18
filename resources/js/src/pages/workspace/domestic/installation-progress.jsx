import React, { useEffect, useState, useRef, useCallback } from "react";
import Layout from "../../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import {
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useDisclosure,
} from "@chakra-ui/react";
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
} from '@chakra-ui/react'
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import Loader from "../../../components/Loader";
import { IoMdArrowRoundBack } from "react-icons/io";
import domesticApi from "../../../api/domesticApi";
import EmptyData from "../../../assets/images/empty-data.svg";

function getChangedTienDoItems(progressReceipt, productList) {
    if (!progressReceipt || !progressReceipt.Details || !Array.isArray(progressReceipt.Details) ||
        !productList || !Array.isArray(productList)) {
        console.error("Invalid input data");
        return [];
    }

    const changedItems = [];

    progressReceipt.Details.forEach((detailItem, index) => {
        if (index < productList.length) {
            const productItem = productList[index];

            if (detailItem.SPDich === productItem.SPDich) {
                if (detailItem.TienDo !== productItem.TienDo) {
                    changedItems.push({
                        index: index,
                        SPDich: detailItem.SPDich,
                        oldTienDo: productItem.TienDo,
                        newTienDo: detailItem.TienDo,
                        difference: detailItem.TienDo - productItem.TienDo
                    });
                }
            }
        }
    });

    return changedItems;
}

const labelStyles = {
    mt: '4',
    fontSize: 'sm',
}

function InstallationProgress() {
    const navigate = useNavigate();
    const projectSelectRef = useRef();
    const apartmentSelectRef = useRef();
    const progressInputRef = useRef();

    const {
        isOpen: isAlertDialogOpen,
        onOpen: onAlertDialogOpen,
        onClose: onAlertDialogClose,
    } = useDisclosure();

    const [awaitingReception, setAwaitingReception] = useState([]);

    // const [data, setData] = useState(fakeDomesticDetails || []);
    // const [searchTerm, setSearchTerm] = useState("");
    // const [searchResults, setSearchResults] = useState([]);
    // const [finishedDetailsData, setFinishedDetailsData] = useState(fakeDomesticDetails || []);
    const [loading, setLoading] = useState(true);
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [apartmentLoading, setApartmentLoading] = useState(false);
    const [processLoading, setProcessLoading] = useState(false);

    // const [stageListOptions, setStageListOptions] = useState([]);
    // const [stageList, setStageList] = useState([]);
    // const [selectedStage, setSelectedStage] = useState(null);

    const [projectListOptions, setProjectListOptions] = useState([]);
    const [apartmentListOptions, setApartmentListOptions] = useState([]);
    const [apartmentList, setApartmentList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedApartment, setSelectedApartment] = useState(null);

    const [progressReceipt, setProgressReceipt] = useState(null);
    const [productList, setProductList] = useState([]);
    const [changedItems, setChangedItems] = useState([]);

    // const [selectedProductCode, setSelectedProductCode] = useState(null);

    // const [isQualityCheck, setIsQualityCheck] = useState(false);

    const format = (val) => val + `%`
    const parse = (val) => val ? val : val.replace(/^\%/, '')

    // const handleRejectFromChild = (data, faults) => {
    //     getDataFollowingGroup(params);
    // };

    const handleBackNavigation = (event) => {
        if (event.type === "popstate") {
            navigate("/workspace?tab=wood-working");
        }
    };

    useEffect(() => {
        window.addEventListener("popstate", handleBackNavigation);

        return () => {
            window.removeEventListener("popstate", handleBackNavigation);
        };
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // const [stageRes, cuttingDiagramRes, productionOrderRes, detailsCodeRes] = await Promise.all([
                //     productionApi.getAllStage(),
                //     productionApi.getCuttingDiagram(),
                //     productionApi.getProductionOrders(),
                //     productionApi.getDetailsCode(),
                // ]);

                const stageRes = await productionApi.getAllGroupWithoutQC();

                // Process All Stage
                // const stageOptions = stageRes.map((item) => ({
                //     value: item.Code,
                //     label: item.Name + " - " + item.Code,
                //     CongDoan: item.CongDoan,
                // }));
                // setStageList(stageRes);
                // stageOptions.sort((a, b) => a.label.localeCompare(b.label));
                // setStageListOptions(stageOptions);
                // stageSelectRef?.current?.setValue(stageOptions[0]);

                // Process Project
                const projectRes = await domesticApi.getAllProject();
                // const projectRes = [...fakeProjects];
                const projectOptions = projectRes.map((item) => ({
                    value: item.PrjCode,
                    label: item.PrjCode,
                }));
                // const projectOptions = projectRes.map((item) => ({
                //     value: item.code,
                //     label: item.name,
                // }));
                setProjectList(projectRes);
                setProjectListOptions(projectOptions);
                projectSelectRef?.current?.setValue(projectOptions[0]);
                setSelectedProject(projectOptions[0])

                const firstProjectId = projectOptions[0]?.value;

                // Apartment Project
                if (firstProjectId) {
                    const apartmentRes = await domesticApi.getApartmentByProjectId(firstProjectId);
                    const apartmentOptions = apartmentRes.map((item) => ({
                        value: item.MaCan,
                        label: item.MaCan,
                    }));
                    setApartmentList(apartmentRes);
                    setApartmentListOptions(apartmentOptions);
                }

            } catch (error) {
                toast.error("Có lỗi xảy ra khi load dữ liệu.");
                console.error(error);
            }
            setLoading(false);
        };

        fetchData();

        document.title = "Woodsland - Nhập tiến độ lắp đặt nội địa";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    // const getDataFollowingGroup = async (params) => {
    //     // setLoadingData(true);
    //     try {
    //         let params = {
    //             TO: selectedStage?.value,
    //             CongDoan: selectedStage?.CongDoan,
    //         }
    //         const res = await productionApi.getFinishedGoodsList(params);
    //         if (typeof res?.data === "object") {
    //             setData(Object.values(res.data));
    //         } else {
    //             setData([]);
    //         }

    //         // if (res?.noti_choxacnhan && res?.noti_choxacnhan.length > 0) {
    //         //     setAwaitingReception(res?.noti_choxacnhan);
    //         // } else {
    //         //     setAwaitingReception([]);
    //         // }
    //         console.log("Data: ", res?.data);
    //         // setData(res.data);
    //     } catch (error) {
    //         toast.error("Có lỗi trong quá trình lấy dữ liệu.");
    //     }
    //     // setLoadingData(false);
    // };

    // useEffect(() => {
    //     (async () => {
    //         if (selectedStage) {
    //             const isQC = stageList.find(
    //                 (group) => group.Code == selectedStage.value
    //             )?.QC;
    //             if (isQC) {
    //                 setIsQualityCheck(true);
    //             } else {
    //                 setIsQualityCheck(false);
    //             }
    //             // setLoadingData(true);
    //             const params = {
    //                 TO: selectedStage.value,
    //             };
    //             getDataFollowingGroup(params);
    //         }
    //     })();
    // }, [selectedStage]);

    // const handleSearchFinishedDetails = () => {
    //     setLoadingData(true)
    //     // Hàm handle filter, fetch,... ra data rồi
    //     setTimeout(() => {
    //         setSearchResults(fakeDomesticDetails);
    //         setLoadingData(false);
    //     }, 3000)
    // }

    // const searchItems = (data, searchTerm) => {
    //     if (!searchTerm) {
    //         return data;
    //     }

    //     const filteredData = [];

    //     for (const key in data) {
    //         const item = data[key];
    //         const filteredDetails = item.Details.filter((detail) => {
    //             const subitem = `${detail.ChildName} (${detail.CDay}*${detail.CRong}*${detail.CDai})`;

    //             // Chuyển đổi cả searchTerm và subitem về chữ thường hoặc chữ hoa trước khi so sánh
    //             const searchTermLower = searchTerm.toLowerCase();
    //             const subitemLower = subitem.toLowerCase();

    //             return subitemLower.includes(searchTermLower);
    //         });

    //         if (filteredDetails.length > 0) {
    //             filteredData[key] = { ...item, Details: filteredDetails };
    //         }
    //     }

    //     return filteredData;
    // };

    // const searchResult = searchItems(data, searchTerm);

    // const [isActive, setIsActive] = useState(false);

    // useEffect(() => {
    //     const progressPath = document.querySelector('.progress-circle path');
    //     const pathLength = progressPath.getTotalLength();

    //     progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    //     progressPath.style.strokeDashoffset = pathLength;

    //     const updateProgress = () => {
    //         const scroll = window.scrollY;
    //         const height = document.documentElement.scrollHeight - window.innerHeight;
    //         const progress = pathLength - (scroll * pathLength) / height;
    //         progressPath.style.strokeDashoffset = progress;

    //         setIsActive(scroll > 50);
    //     };

    //     updateProgress();
    //     window.addEventListener('scroll', updateProgress);

    //     return () => {
    //         window.removeEventListener('scroll', updateProgress);
    //     };
    // }, []);

    const getProcessByApartmentId = async () => {
        const selectedApartmentId = selectedApartment?.value;
        const selectedProjectId = selectedProject?.value;

        setProcessLoading(true);

        try {
            if (selectedApartmentId) {
                setProductList([]);
                const res = await domesticApi.getProcessByApartmentId(selectedProjectId, selectedApartmentId);
                // const options = res.map((item) => ({
                //     value: item.MaCan,
                //     label: item.MaCan,
                // }));

                setProductList(res);
                setProgressReceipt({
                    PrjCode: selectedProjectId,
                    MaCan: selectedApartmentId,
                    Details: [
                        ...res.map((item) => ({
                            SPDich: item.SPDich,
                            TienDo: item.TienDo,
                        })),
                    ]
                })

            } else {
                setProductList([]);
                setProgressReceipt(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessLoading(false);
        }
    };

    const handleConfirmReceipt = async () => {
        if (changedItems.length > 0) {
            console.log(changedItems)
            try {
                setLoadingData(true);
                const payload = {
                    ...progressReceipt,
                    Details: changedItems.map((item) => ({
                        SPDich: item.SPDich,
                        TienDo: item.newTienDo,
                    })),
                }
                const res = await domesticApi.receiveProcess(payload);
                console.log("Response: ", res);
                toast.success("Ghi nhận thành công.");
                onAlertDialogClose();
                getProcessByApartmentId();
            } catch (error) {
                toast.error("Có lỗi xảy ra trong quá trình ghi nhận.");
            } finally {
                setLoadingData(false);
            }
        }
    };

    useEffect(() => {
        const selectedProjectId = selectedProject?.value;

        const getApartmentByProjectId = async () => {
            setApartmentLoading(true);
            try {
                if (selectedProjectId) {
                    setApartmentList([]);
                    setApartmentListOptions([]);
                    setSelectedApartment(null);
                    apartmentSelectRef.current.clearValue();
                    const res = await domesticApi.getApartmentByProjectId(selectedProjectId);
                    const options = res.map((item) => ({
                        value: item.MaCan,
                        label: item.MaCan,
                    }));

                    setApartmentList(res);
                    setApartmentListOptions(options);
                    setSelectedApartment(null);

                } else {
                    setApartmentList([]);
                    setApartmentListOptions([]);
                    setSelectedApartment(null);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setApartmentLoading(false);
            }

        };

        if (!isFirstTime) getApartmentByProjectId();
    }, [selectedProject])

    useEffect(() => {
        getProcessByApartmentId();
    }, [selectedApartment])

    useEffect(() => {
        if (progressReceipt && productList.length > 0) {
            const changed = getChangedTienDoItems(progressReceipt, productList);
            setChangedItems(changed);
        }
    }, [progressReceipt]);

    // const scrollToTop = () => {
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    // };

    const handleProgressInputClick = useCallback(() => {
        if (progressInputRef.current) {
            const input = progressInputRef.current
            const isFullySelected = input.selectionStart === 0 &&
                input.selectionEnd === input.value.length

            if (!isFullySelected) {
                input.select()
            }
        }
    }, [])

    const handleChangeInput = (valueString, idx) => {
        setProgressReceipt((prev) => {
            const newDetails = [...prev.Details];
            // newDetails[idx].TienDo = parse(valueString);
            newDetails[idx].TienDo = valueString ? Number(valueString) : 0;
            return {
                ...prev,
                Details: newDetails,
            };
        })
    }

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 lg:p-12 md:p-12 p-4 xl:px-32">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:mx-0 lg:mx-0 md:mx-0 mx-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center ">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập tiến độ lắp đặt
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col pb-0  w-full justify-end ">
                                <div className=" ">
                                    <div className="p-4 rounded-tl-xl rounded-tr-xl pb-1 w-full bg-[#F6F6F6] border-b border-gray-200">

                                        <div className="px-0">
                                            <div className="block text-md font-medium text-gray-900 ">
                                                Mã dự án
                                            </div>
                                            <Select
                                                ref={projectSelectRef}
                                                options={projectListOptions}
                                                defaultValue={selectedProject}
                                                onChange={(value) => {
                                                    setSelectedProject(value);
                                                }}
                                                placeholder="Chọn dự án"
                                                className="mt-2 mb-4 z-20"
                                            />
                                        </div>
                                        {
                                            selectedProject && (
                                                <div className="px-0 flex flex-col gap-2">
                                                    <div className="block text-md font-medium text-gray-900">
                                                        Mã căn
                                                    </div>

                                                    <Select
                                                        ref={apartmentSelectRef}
                                                        options={apartmentListOptions}
                                                        defaultValue={selectedApartment}
                                                        onChange={(value) => {
                                                            setSelectedApartment(value);
                                                        }}
                                                        isLoading={apartmentLoading}
                                                        placeholder="Chọn mã căn"
                                                        className="mt-2 mb-4 z-10"
                                                    />
                                                </div>
                                            )
                                        }
                                    </div>
                                    {
                                        processLoading ? (
                                            <div className="p-6 flex justify-center items-center py-6">
                                                <Spinner
                                                    thickness="7px"
                                                    className="mt-3"
                                                    speed="0.65s"
                                                    emptyColor="gray.200"
                                                    color="blue.500"
                                                    size="xl"
                                                />
                                            </div>
                                        ) : <>
                                            {productList?.length > 0 ? (
                                                <div className="p-4 pb-0">
                                                    <div className="border border-gray-300 rounded-lg xl:block lg:block md:block hidden">
                                                        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                                                            <thead>
                                                                <tr className="bg-gray-200 text-left">
                                                                    <th className="px-4 py-2 w-[300px] border border-gray-300">
                                                                        Mã SP đích
                                                                    </th>
                                                                    <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                        Số
                                                                        lượng
                                                                    </th>
                                                                    <th className="px-4 py-2 border border-gray-300">
                                                                        Tiến độ lắp đặt <span className="text-red-500">
                                                                            {" "}
                                                                            *
                                                                        </span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            {progressReceipt?.Details?.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <tbody
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <tr
                                                                            className={
                                                                                index %
                                                                                    2 ===
                                                                                    0
                                                                                    ? "bg-gray-50"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            <td className="px-4 py-3 border border-gray-300">
                                                                                <div className="uppercase text-sm text-gray-500">
                                                                                    {item.SPDich ||
                                                                                        "Không xác định"}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 border text-center border-gray-300">
                                                                                {productList[index]?.Qty ||
                                                                                    0}
                                                                            </td>
                                                                            <td className="px-4 py-4 border border-gray-300">
                                                                                <div className="flex flex-col md:flex-row gap-8">
                                                                                    <NumberInput
                                                                                        value={format(item.TienDo)}
                                                                                        min={0}
                                                                                        max={100} className="w-[250px] md:w-[300px]"
                                                                                        onChange={(value) => handleChangeInput(value, index)}
                                                                                    >
                                                                                        <NumberInputField ref={progressInputRef} onClick={handleProgressInputClick} />
                                                                                        <NumberInputStepper>
                                                                                            <NumberIncrementStepper />
                                                                                            <NumberDecrementStepper />
                                                                                        </NumberInputStepper>
                                                                                    </NumberInput>

                                                                                    <Slider focusThumbOnChange={false} className="mt-8 md:mt-0 top-1.5" aria-label='slider-ex-6' value={item.TienDo} onChange={(value) => handleChangeInput(value, index)}>
                                                                                        <SliderMark value={0} {...labelStyles}>
                                                                                            0%
                                                                                        </SliderMark>
                                                                                        <SliderMark value={50} {...labelStyles}>
                                                                                            50%
                                                                                        </SliderMark>
                                                                                        <SliderMark value={100} fontSize='sm' mt='4' ml='-10'>
                                                                                            100%
                                                                                        </SliderMark>
                                                                                        <SliderMark
                                                                                            value={item.TienDo}
                                                                                            textAlign='center'
                                                                                            bg='blue.500'
                                                                                            color='white'
                                                                                            mt='-6'
                                                                                            ml='-4'
                                                                                            w='8'
                                                                                            fontSize='xs'
                                                                                        >
                                                                                            {item.TienDo}%
                                                                                        </SliderMark>
                                                                                        <SliderTrack className="md:-mt-2">
                                                                                            <SliderFilledTrack />
                                                                                        </SliderTrack>
                                                                                        <SliderThumb bg='blue.800' className="md:-mt-2" />
                                                                                    </Slider>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                )
                                                            )}
                                                        </table>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {progressReceipt?.Details?.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <div className="border border-gray-300 bg-gray-50 rounded-lg xl:hidden lg:hidden md:hidden flex flex-col p-3 gap-y-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-lg font-bold">
                                                                            {
                                                                                item.SPDich || "Không xác định"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex flex-col gap-y-1">
                                                                        <div className="grid grid-cols-2">
                                                                            <span className="grid grid-cols-2">
                                                                                Số lượng:
                                                                            </span>
                                                                            <span className="font-bold">
                                                                                {productList[index]?.Qty ||
                                                                                    0}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="w-full border-b border-gray-200"></div>

                                                                    <div className="flex flex-col">
                                                                        <span className="pb-1 font-medium text-gray-800">
                                                                            Tiến độ lắp đặt
                                                                        </span>
                                                                        <NumberInput
                                                                            value={format(item.TienDo)}
                                                                            min={0}
                                                                            max={100} className="w-[250px] md:w-[300px]"
                                                                            onChange={(value) => handleChangeInput(value, index)}
                                                                        >
                                                                            <NumberInputField ref={progressInputRef} onClick={handleProgressInputClick} />
                                                                            <NumberInputStepper>
                                                                                <NumberIncrementStepper />
                                                                                <NumberDecrementStepper />
                                                                            </NumberInputStepper>
                                                                        </NumberInput>
                                                                        <Slider focusThumbOnChange={false} className="my-8" aria-label='slider-ex-6' value={item.TienDo} onChange={(value) => handleChangeInput(value, index)}>
                                                                            <SliderMark value={0} {...labelStyles}>
                                                                                0%
                                                                            </SliderMark>
                                                                            <SliderMark value={50} {...labelStyles}>
                                                                                50%
                                                                            </SliderMark>
                                                                            <SliderMark value={100} fontSize='sm' mt='4' ml='-10'>
                                                                                100%
                                                                            </SliderMark>
                                                                            <SliderMark
                                                                                value={item.TienDo}
                                                                                textAlign='center'
                                                                                bg='blue.500'
                                                                                color='white'
                                                                                mt='-8'
                                                                                ml='-4'
                                                                                w='8'
                                                                                fontSize='xs'
                                                                            >
                                                                                {item.TienDo}%
                                                                            </SliderMark>
                                                                            <SliderTrack className="md:-mt-2">
                                                                                <SliderFilledTrack />
                                                                            </SliderTrack>
                                                                            <SliderThumb bg='blue.800' className="md:-mt-2" />
                                                                        </Slider>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end mt-4">
                                                        <button
                                                            className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                            onClick={() => {
                                                                onAlertDialogOpen();
                                                            }}
                                                            disabled={changedItems.length === 0}
                                                        >
                                                            <p className="text-[15px]">
                                                                Ghi nhận
                                                            </p>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-8">
                                                    <img
                                                        src={EmptyData}
                                                        alt="No data"
                                                        className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                                    />
                                                    <div className="p-6 text-center">
                                                        {productList.length ===
                                                            0 ? (
                                                            <>
                                                                <div className="font-semibold xl:text-xl lg:text-xl md:text-lg text-lg">
                                                                    Không
                                                                    tìm
                                                                    thấy
                                                                    thông tin.
                                                                </div>
                                                                <div className="text-gray-500 mt-1">
                                                                    Hãy
                                                                    thử
                                                                    chọn
                                                                    một mã căn/dự án khác.
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="font-semibold text-xl">
                                                                    Hiện
                                                                    tại
                                                                    không
                                                                    có
                                                                    bất
                                                                    kỳ
                                                                    thông
                                                                    tin
                                                                    sản
                                                                    phẩm
                                                                    nào.
                                                                </div>
                                                                <div className="text-gray-500 mt-1">
                                                                    Hãy
                                                                    chọn
                                                                    một
                                                                    lệnh
                                                                    sản
                                                                    xuất
                                                                    để
                                                                    bắt
                                                                    đầu.
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isAlertDialogOpen}
                onClose={onAlertDialogClose}
                size="xl"
                blockScrollOnMount={false}
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Xác nhận
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                Bạn chắc chắn muốn ghi nhận tiến độ?
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex w-full items-center space-x-3">
                            <button
                                onClick={() => {
                                    onAlertDialogClose();
                                }}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-1/3 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loadingData}
                            >
                                Đóng
                            </button>
                            <button
                                className="flex items-center justify-center bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white"
                                type="button"
                                onClick={handleConfirmReceipt}
                            >
                                {loadingData ? (
                                    <div className="flex w-full items-center justify-center space-x-4">
                                        <Spinner
                                            size="sm"
                                            color="white"
                                        />
                                        <div>Đang thực hiện</div>
                                    </div>
                                ) : (
                                    <>Xác nhận</>
                                )}
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {loading && <Loader />}
        </Layout>
    );
}

export default InstallationProgress;
