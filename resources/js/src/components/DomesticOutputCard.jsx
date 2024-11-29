import React, { useState, useEffect, useRef } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import {
    Alert,
    Badge,
    Button,
    Box,
    Checkbox,
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    Radio,
    RadioGroup,
    Spinner,
    useDisclosure,
} from "@chakra-ui/react";
import Select, { components } from "react-select";
import Loader from "./Loader";
import { formatNumber } from "../utils/numberFormat";
import productionApi from "../api/productionApi";

const fakeBlocks = [
    {
        id: 1,
        name: "Block 1",
    },
    {
        id: 2,
        name: "Block 2",
    },
    {
        id: 3,
        name: "Block 3",
    },
];
const fakeFloors = [
    {
        id: 1,
        name: "1",
    },
    {
        id: 2,
        name: "2",
    },
    {
        id: 3,
        name: "3",
    },
];
const fakeRooms = [
    {
        id: 1,
        name: "R001",
    },
    {
        id: 2,
        name: "R002",
    },
    {
        id: 3,
        name: "R003",
    },
];

function DomesticOutputCard(props) {
    const { detailsData, type } = props;
    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const closeInputModal = () => {
        onModalClose();
    }
    const [amount, setAmount] = useState("");
    const [errorAmount, setErrorAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [stageListOptions, setStageListOptions] = useState([]);
    const [stageList, setStageList] = useState([]);

    const [roomListOptions, setRoomListOptions] = useState([]);
    const [roomList, setRoomList] = useState([]);

    const [floorListOptions, setFloorListOptions] = useState([]);
    const [floorList, setFloorList] = useState([]);

    const [blockListOptions, setBlockListOptions] = useState([]);
    const [blockList, setBlockList] = useState([]);

    const [installationProgressInfo, setInstallationProgressInfo] = useState({
        progressPercent: "",
        isAcceptedByInvestor: false,
        fromRoom: null,
        toRoom: null,
        floor: "",
        block: ""
    });
    const [stages, setStages] = useState({
        selectedCurrentState: detailsData?.currentStageId,
        selectedNextState: null,
    })

    const currentStageSelectRef = useRef();
    const nextStageSelectRef = useRef();

    const handleOpenDetails = async (item) => {
        setLoading(true);
        const fetchData = async () => {
            try {
                //const [stageRes, roomRes, floorRes, blockRes] = await Promise.all([
                //     productionApi.getAllStage(),
                //     productionApi.getAllRoom(),
                //     productionApi.getAllFloor(),
                //     productionApi.getAllBlock(),
                // ]);

                const stageRes = await productionApi.getAllGroupWithoutQC();

                // Process All Stage
                const stageOptions = stageRes.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                    CongDoan: item.CongDoan,
                }));
                setStageList(stageRes);
                stageOptions.sort((a, b) => a.label.localeCompare(b.label));
                setStageListOptions(stageOptions);
                currentStageSelectRef?.current?.setValue(stageOptions[0]);

                // Process Room 
                const roomRes = [...fakeRooms];
                const roomOptions = roomRes.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setRoomList(roomRes);
                setRoomListOptions(roomOptions);

                // Process Floor 
                const floorRes = [...fakeFloors];
                const floorOptions = floorRes.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setFloorList(floorRes);
                setFloorListOptions(floorOptions);

                // Process Block 
                const blockRes = [...fakeBlocks];
                const blockOptions = blockRes.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setBlockList(blockRes);
                setBlockListOptions(blockOptions);

            } catch (error) {
                toast.error("Có lỗi xảy ra khi load dữ liệu.");
                console.error(error);
            }
            setLoading(false);
        };

        await fetchData();

        switch (type) {
            case 'CT':
                // const params = {
                //     SPDICH: data.SPDICH,
                //     ItemCode: item.ItemChild,
                //     TO: item.TO,
                // };

                // try {
                //     const res = await productionApi.getFinishedGoodsDetail(params);
                //     console.log("Chi tiết thành phẩm: ", res);
                onModalOpen();
                // } catch (error) {
                //     toast.error(
                //         error.response.data.error || "Có lỗi khi lấy dữ liệu item."
                //     );
                //     console.error(error);
                // }

                break;

            case 'DG':
                // const params = {
                //     SPDICH: data.SPDICH,
                //     ItemCode: item.ItemChild,
                //     TO: item.TO,
                // };

                // try {
                //     const res = await productionApi.getFinishedGoodsDetail(params);
                //     console.log("Chi tiết thành phẩm: ", res);
                onModalOpen();
                // } catch (error) {
                //     toast.error(
                //         error.response.data.error || "Có lỗi khi lấy dữ liệu item."
                //     );
                //     console.error(error);
                // }

                break;

            case 'LD':
                // const params = {
                //     SPDICH: data.SPDICH,
                //     ItemCode: item.ItemChild,
                //     TO: item.TO,
                // };

                // try {
                //     const res = await productionApi.getFinishedGoodsDetail(params);
                //     console.log("Chi tiết thành phẩm: ", res);
                onModalOpen();
                // } catch (error) {
                //     toast.error(
                //         error.response.data.error || "Có lỗi khi lấy dữ liệu item."
                //     );
                //     console.error(error);
                // }

                break;


            default:
                break;
        }
        setLoading(false);
    }

    const handleProcessOutput = async () => {
        onModalClose();
    }

    return (
        <>
            <div className="border-2 border-[#c6d3da] rounded-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center justify-between px-2 pr-4 bg-[#F6F8F9] rounded-t-xl ">
                    <div className="text-[#17506B] xl:text-xl font-semibold text-lg px-4 py-3 w-[85%]">
                        <span>Mã {type == "CT" ? "chi tiết" : type == "DG" ? "hộp" : "mã bộ sản xuất"} - </span>
                        Test
                    </div>
                </div>
                <div className="pallet-line gap-4 flex flex-col bg-white py-3 px-4 rounded-b-xl">
                    <div className="grid xl:grid-cols-2 md:grid-cols-2 grid-cols-2  gap-4">
                        <div>
                            <label
                                htmlFor="company"
                                className="block mb-2 text-md font-medium text-gray-900 "
                            >
                                Sản lượng kế hoạch
                            </label>
                            <input
                                type="text"
                                id="inStock"
                                className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                placeholder="0"
                                readOnly={true}
                                required
                                value={
                                    formatNumber(
                                        Number(
                                            detailsData?.plannedAmount
                                        )
                                    ) || 0}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="company"
                                className="block mb-2 text-md font-medium text-gray-900 "
                            >
                                Sản lượng thực nhận
                            </label>
                            <input
                                type="text"
                                id="inStock"
                                className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                placeholder="0"
                                readOnly={true}
                                required
                                value={
                                    formatNumber(
                                        Number(
                                            detailsData?.receivedAmount
                                        )
                                    ) || 0}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        className="flex w-full items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl px-5 py-2.5 text-center gap-x-2 active:scale-[.99] active:duration-75 transition-all"
                        onClick={handleOpenDetails}
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                onClose={closeInputModal}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent className="!px-0">
                    <ModalHeader>
                        <div className="xl:ml-6 serif font-bold text-2xl ">
                            Ghi nhận {type == 'CT' ? "sản lượng chi tiết" : type == 'DG' ? "sản lượng đóng gói" : "tiến độ lắp đặt"}
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-[#DADADA]"></div>
                    <ModalBody px={0} py={0}>
                        <div className="flex flex-col justify-center pb-4 bg-[#FAFAFA] ">
                            <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                <>
                                    <div className="flex flex-col md:flex-row justify-between pt-4 items-center xl:px-0 md:px-0 lg:px-0 px-4">
                                        <div className="flex flex-col w-full">
                                            <label className="font-medium">
                                                {type == 'CT' ? "Mã chi tiết" : type == 'DG' ? "Mã hộp" : "Mã bộ sản xuất"}
                                            </label>
                                            <span className="text-[#17506B] text-2xl font-bold">
                                                {detailsData?.detailsCode}
                                            </span>
                                        </div>
                                    </div>
                                    {
                                        type != "LD" && (
                                            <div className="flex justify-between py-3 border-2 divide-x-2 border-[#DADADA] shadow-sm rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-4 bg-white">
                                                <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                    <label className="font-medium uppercase text-sm text-gray-400">
                                                        Dự Án
                                                    </label>
                                                    <span className="text-[20px] font-bold">
                                                        {detailsData?.projectName || 0}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                    <label className="font-medium uppercase text-sm text-gray-400">
                                                        Sơ Đồ Cắt
                                                    </label>
                                                    <span className="text-[20px] font-bold">
                                                        {detailsData?.cuttingDiagram || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    }

                                    <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                        <div className="flex gap-2 items-center justify-between py-3 px-0 pr-2 ">
                                            <Text className="font-semibold">
                                                Sản lượng kế hoạch:
                                            </Text>
                                            <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                                {detailsData?.plannedAmount >
                                                    0
                                                    ? parseInt(
                                                        detailsData?.plannedAmount ||
                                                        0
                                                    ).toLocaleString()
                                                    : 0}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-0 pr-2 justify-between">
                                            <Text className="font-semibold">
                                                Sản lượng thực nhận:
                                            </Text>
                                            <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                                {formatNumber(
                                                    Number(
                                                        detailsData?.receivedAmount
                                                    )
                                                ) || 0}
                                            </span>
                                        </div>

                                        <Box className="px-0">
                                            <label className="mt-6 font-semibold">
                                                Sản lượng {type == "LD" ? "lắp đặt thêm" : "ghi nhận"}:
                                            </label>
                                            {/* <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                <MdDangerous className="w-6 h-6" />
                                                <div>
                                                    Không đủ số lượng để
                                                    ghi nhận
                                                </div>
                                            </div> */}
                                            <NumberInput
                                                // ref={receipInput}
                                                step={1}
                                                min={1}
                                                max={detailsData?.receivedAmount}
                                                value={amount}
                                                className="mt-2 mb-2"
                                                onChange={
                                                    (value) => {
                                                        setAmount(
                                                            value
                                                        );
                                                    }}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                            {/* )} */}
                                        </Box>
                                        {
                                            type == "DG" && (
                                                <Box className="px-0">
                                                    <label className="mt-6 font-semibold">
                                                        Sản lượng lỗi trả về:
                                                    </label>
                                                    {/* <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                <MdDangerous className="w-6 h-6" />
                                                <div>
                                                    Không đủ số lượng để
                                                    ghi nhận
                                                </div>
                                            </div> */}
                                                    <NumberInput
                                                        // ref={receipInput}
                                                        step={1}
                                                        min={1}
                                                        max={detailsData?.receivedAmount}
                                                        value={errorAmount}
                                                        className="mt-2 mb-2"
                                                        onChange={
                                                            (value) => {
                                                                setErrorAmount(
                                                                    value
                                                                );
                                                            }}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                    {/* )} */}
                                                </Box>
                                            )
                                        }
                                        {
                                            type == "CT" && (
                                                <>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            Công đoạn hiện tại:
                                                        </label>
                                                        <Select
                                                            // isDisabled={true}
                                                            ref={currentStageSelectRef}
                                                            options={stageListOptions}
                                                            value={stages?.selectedCurrentState}
                                                            // defaultValue={selectedGroup}
                                                            onChange={(value) => {
                                                                setStages(prev => ({
                                                                    ...prev,
                                                                    selectedCurrentState: value
                                                                }))
                                                                console.log("Selected current stage: ", value);
                                                            }}
                                                            placeholder="Chọn công đoạn hiện tại"
                                                            className="mt-2 mb-4 "
                                                        />
                                                    </Box>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            Công đoạn tiếp theo:
                                                        </label>
                                                        <Select
                                                            // isDisabled={true}
                                                            ref={nextStageSelectRef}
                                                            options={stageListOptions}
                                                            // defaultValue={selectedGroup}
                                                            onChange={(value) => {
                                                                setStages(prev => ({
                                                                    ...prev,
                                                                    selectedNextState: value
                                                                }))
                                                                console.log("Selected next stage: ", value);
                                                            }}
                                                            placeholder="Chọn công đoạn tiếp theo"
                                                            className="mt-2 mb-4 "
                                                        />
                                                    </Box>
                                                </>
                                            )
                                        }
                                        {
                                            type == "LD" && (
                                                <>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            % Tiến độ hoàn thành:
                                                        </label>
                                                        <NumberInput
                                                            // ref={receipInput}
                                                            step={1}
                                                            min={1}
                                                            max={100 - detailsData?.currentProgress}
                                                            className="mt-2 mb-2"
                                                            value={installationProgressInfo?.progressPercent}
                                                            onChange={(value) => setInstallationProgressInfo(prev => ({ ...prev, progressPercent: value }))}
                                                        >
                                                            <NumberInputField />
                                                        </NumberInput>
                                                    </Box>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            % Tiến độ gần nhất:
                                                        </label>
                                                        <NumberInput
                                                            // ref={receipInput}
                                                            step={1}
                                                            min={1}
                                                            className="bg-gray-100 mt-2 mb-2"
                                                            readOnly
                                                            value={detailsData?.currentProgress}
                                                        >
                                                            <NumberInputField />
                                                        </NumberInput>
                                                    </Box>
                                                    <Box className="px-0">
                                                        <Checkbox className="my-2" isChecked={installationProgressInfo?.isAcceptedByInvestor} onChange={() => setInstallationProgressInfo(prev => ({ ...prev, isAcceptedByInvestor: !prev.isAcceptedByInvestor }))}>Đã nghiệm thu với chủ đầu tư</Checkbox>
                                                    </Box>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col grid-cols-1">
                                                            <label className="font-semibold">
                                                                Từ căn:
                                                            </label>
                                                            <Select
                                                                // ref={currentStageSelectRef}
                                                                options={roomListOptions}
                                                                value={installationProgressInfo?.fromRoom}
                                                                onChange={(value) => {
                                                                    setInstallationProgressInfo(prev => ({
                                                                        ...prev,
                                                                        fromRoom: value
                                                                    }))
                                                                }}
                                                                placeholder=""
                                                                className="mt-2 mb-4 "
                                                            />
                                                        </div>

                                                        <div className="flex flex-col grid-cols-1">
                                                            <label className="font-semibold">
                                                                Đến căn:
                                                            </label>
                                                            <Select
                                                                // ref={currentStageSelectRef}
                                                                options={roomListOptions}
                                                                value={installationProgressInfo?.toRoom}
                                                                onChange={(value) => {
                                                                    setInstallationProgressInfo(prev => ({
                                                                        ...prev,
                                                                        toRoom: value
                                                                    }))
                                                                }}
                                                                placeholder=""
                                                                className="mt-2 mb-4 "
                                                            />
                                                        </div>
                                                    </div>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            Tầng:
                                                        </label>
                                                        <Select
                                                            // ref={currentStageSelectRef}
                                                            options={floorListOptions}
                                                            value={installationProgressInfo?.floor}
                                                            onChange={(value) => {
                                                                setInstallationProgressInfo(prev => ({
                                                                    ...prev,
                                                                    floor: value
                                                                }))
                                                            }}
                                                            placeholder="Chọn tầng"
                                                            className="mt-2 mb-4 "
                                                        />
                                                    </Box>
                                                    <Box className="px-0">
                                                        <label className="mt-6 font-semibold">
                                                            Toà:
                                                        </label>
                                                        <Select
                                                            // ref={currentStageSelectRef}
                                                            options={blockListOptions}
                                                            value={installationProgressInfo?.block}
                                                            onChange={(value) => {
                                                                setInstallationProgressInfo(prev => ({
                                                                    ...prev,
                                                                    block: value
                                                                }))
                                                            }}
                                                            placeholder="Chọn toà"
                                                            className="mt-2 mb-4 "
                                                        />
                                                    </Box>
                                                </>
                                            )
                                        }
                                    </div>

                                    {
                                        type == "DG" && (
                                            <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                                <section
                                                    onClick={() => {
                                                    }}
                                                    className="rounded-b-xl duration-200 ease-linear"
                                                >
                                                    <label className="font-medium uppercase text-sm text-gray-400">
                                                        Chi tiết đóng gói
                                                    </label>
                                                    <div className="mb-2 mt-1 overflow-hidden rounded-lg border-2 border-[#c4cfe7]">
                                                        <table className="w-full divide-y divide-[#c4cfe7] border-collapse bg-[#ECEFF5] text-left text-sm text-gray-500">
                                                            <thead className="bg-[#dae0ec] ">
                                                                <tr>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-3 py-2 text-xs font-medium uppercase text-gray-500 "
                                                                    >
                                                                        Lệnh sản xuất
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-2 py-2 text-xs font-medium uppercase text-right text-gray-500"
                                                                    >
                                                                        Sản lượng
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-2 py-2 text-xs font-medium uppercase  text-right text-gray-500"
                                                                    >
                                                                        Đã làm
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
                                                                        Còn lại
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className=" border-t border-[#c4cfe7]  ">
                                                                <tr
                                                                    className="bg-[#ECEFF5] border-[#c4cfe7] border-b"
                                                                >
                                                                    <th
                                                                        scope="row"
                                                                        className="px-2 py-1 font-medium text-[#17506B] whitespace-nowrap"
                                                                    >
                                                                        1
                                                                    </th>
                                                                    <td className="px-2 py-2 text-right text-gray-800">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right text-gray-900">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right text-gray-900">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2  py-2 text-right text-gray-800">
                                                                        1
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td className="font-bold text-gray-700 px-2 py-2">
                                                                        Tổng
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                        1
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                        1
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </section>
                                            </div>
                                        )
                                    }
                                </>

                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0">
                        {/* <Alert status="info">
                            <TbPlayerTrackNextFilled className="text-[#155979] xl:mr-2 lg:mr-2 md:mr-2 mr-4 xl:text-xl lg:text-xl md:text-xl text-2xl" />
                            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col">
                                <span className="text-[15px] mr-1 sm:text-base">
                                    Công đoạn sản xuất tiếp theo:{"  "}
                                </span>
                                <span className="xl:text-[15px] lg:text-[15px] md:text-[15px] text-[17px] sm:text-base font-bold xl:ml-1 lg:ml-1 md:ml-1 ml-0">
                                    "Chưa được thiết lập ở SAP"
                                </span>
                            </div>
                        </Alert> */}

                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                            <button
                                onClick={() => {
                                    closeInputModal();
                                    // setSelectedFaultItem({
                                    //     ItemName: "",
                                    //     ItemCode: "",
                                    //     SubItemName: "",
                                    //     SubItemCode: "",
                                    //     SubItemBaseQty: "",
                                    //     OnHand: "",
                                    // });
                                    // setFaultyAmount("");
                                    // setIsItemCodeDetech(false);
                                    // setRongData(null);
                                }}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-gray-800 p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full text-white"
                                type="button"
                                disabled={
                                    type == "CT" ?
                                        (amount == 0 || !stages.currentStageId || !stages?.nextStageId) :
                                        type == "DG" ? (amount == 0 && errorAmount == 0) :
                                            (amount == 0 || !installationProgressInfo?.progressPercent)
                                }
                                onClick={handleProcessOutput}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {loading && <Loader />}
        </>
    );
}
export default DomesticOutputCard;
