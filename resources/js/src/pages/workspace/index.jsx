import { useState, useEffect, useRef, useMemo } from "react";
import Layout from "../../layouts/layout";
import { HiSearchCircle, HiBadgeCheck } from "react-icons/hi";
import {
    HiSquare3Stack3D,
    HiClipboardDocumentList,
    HiHomeModern,
    HiRectangleStack,
    HiHandThumbUp,
    HiArchiveBoxArrowDown,
    HiViewColumns,
    HiMiniTruck,
    HiArrowsRightLeft
} from "react-icons/hi2";
import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Box,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    SimpleGrid,
    Text
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useAppContext from "../../store/AppContext";
import "../../assets/styles/customTabs.css";
import "../../assets/styles/index.css";
import { getTeamsCBG } from "../../api/MasterDataApi";
import Select from 'react-select'
import { FaDiceD6 } from "react-icons/fa6";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { baoLoiSayAm } from "../../api/qc.api";
import Loader from "../../components/Loader";

function Workspace() {
    const { user } = useAppContext();

    const FirstTab = useRef();
    const SecondTab = useRef();
    const ThirdTab = useRef();

    const [openInlandSelect, setOpenInlandSelect] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState(null);

    const [data, setData] = useState({
        team: null,
        day: '',
        rong: '',
        dai: '',
        quantity: '',
        m3: ''
    });

    const handleMenuClick = (type) => {
        switch (type) {
            case "ND":
                setOpenInlandSelect(!openInlandSelect);
                console.log("Tào lao vị: ", !openInlandSelect);
                break;

            default:
                break;
        }
    };

    const getCurrentDateTime = () => {
        const days = [
            "Chủ nhật",
            "Thứ hai",
            "Thứ ba",
            "Thứ tư",
            "Thứ năm",
            "Thứ sáu",
            "Thứ bảy",
        ];
        const now = new Date();
        const day = days[now.getDay()];
        const date = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        return `${day}, ngày ${date} tháng ${month} năm ${year}.`;
    };

    const handleTabClick = (tabName) => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tabName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
    };

    const onHandle = async () => {
        try {
            if (teams.length == 0) {
                let res = await getTeamsCBG(user?.plant);
                let data = res.data.teams.sort((item1, item2) => item1.Name.localeCompare(item2.Name))
                setTeams(data.map(item => (
                    {
                        ...item,
                        label: `${item.Name} - ${item.Code}`,
                        value: item.Code
                    }
                )))
            }

            onModalOpen();
        } catch (error) {
            toast.error("Lấy danh sách tổ có lỗi.");
        }
    }

    const onConfirm = () => {
        if (!data.team) {
            toast.error("Vui lòng chọn tổ báo lỗi.");
            return
        }

        if (!data.day) {
            toast.error("Vui lòng nhập chiều dày.");
            return
        }

        if (!data.rong) {
            toast.error("Vui lòng nhập chiều dày.");
            return
        }

        if ((!data.quantity || data.quantity == 0) && (!data.m3 || data.m3 == 0)) {
            toast.error("Vui lòng nhập số thanh hoặc khối lượng.");
            return
        }

        let postData = { ...data };

        if (postData.dai == 0 || !postData.dai) {
            postData.quantity = 0
        }

        Swal.fire({
            title: 'Xác nhận lỗi sấy ẩm.',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    let res = await baoLoiSayAm(postData);
                    onClose();
                    setLoading(false);
                    toast.success(res.message ?? "Xử lý thành công.");
                } catch (error) {
                    setLoading(false);
                    toast.error(error?.response?.data?.message ?? "Xử lý có lỗi.");
                }
            }
        });
    }

    const onClose = () => {
        onModalClose();
        setData({
            team: null,
            day: '',
            rong: '',
            dai: '',
            quantity: '',
            m3: ''
        });
    }

    useEffect(() => {
        let calc = data.day * data.rong * data.dai * data.quantity / 1000000000;
        setData(pre => ({ ...pre, m3: calc + '' }))
    }, [data.dai, data.rong, data.day, data.quantity])

    useEffect(() => {
        document.title = "Woodsland - Workspace";
        const params = new URLSearchParams(window.location.search);

        if (!params.get("tab")) {
            params.set("tab", "wood-drying");
            const defaultUrl = `${window.location.pathname
                }?${params.toString()}`;
            window.history.replaceState({}, "", defaultUrl);
        }

        const currentTab = params.get("tab");
        setTimeout(() => {
            if (currentTab === "wood-working") {
                SecondTab.current.click();
            } else if (currentTab === "goods-management") {
                ThirdTab.current.click();
            } else {
                FirstTab.current.click();
            }
        });

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            {/* Container */}
            <div className="flex overflow-x-hidden justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen bg-transparent xl:p-10 lg:p-10 md:p-8 p-6 py-4 px-5 xl:px-28 ">
                    {/* Header */}
                    <div className="flex items-center justify-between xl:mb-8 lg:mb-8 md:mb-8 mb-5">
                        <div className="">
                            <div className="text-gray-600 mb-0">
                                {getCurrentDateTime()}
                            </div>
                            <div className="xl:text-4xl lg:text-3xl md:text-3xl text-3xl  xl:mb-2 lg:mb-2 md:mb-2">
                                <span className="serif font-bold">
                                    Chào, {user?.first_name}!
                                </span>
                            </div>
                        </div>
                        {/* <div className="pr-10 xl:flex lg:flex md:flex items-center hidden space-x-2">
                            <FaRegCalendar className="text-gray-500 text-3xl" />
                            <div>
                                <div className="text-sm text-gray-500 font-medium">Tuần làm việc</div>
                                <div className="uppercase font-bold text-gray-800">Tuần 1</div>
                            </div>    
                        </div> */}
                    </div>

                    {/* Card Fields */}
                    <div className="w-full overflow-x-hidden">
                        <Tabs
                            className="gap-x-1"
                            variant="soft-rounded"
                            colorScheme="blackAlpha"
                        >
                            <TabList className="xl:overflow-x-hidden lg:overflow-x-hidden md:overflow-hidden overflow-x-scroll overscroll-x-contain xl:pb-0 lg-pb-0 md:pb-0 pb-3 xl:max-w-full max-w-sm w-full">
                                <Tab
                                    className="xl:w-fit md:w-full lg:w-full xl:h-fit md:h-fit lg:h-fit flex-nowrap "
                                    ref={FirstTab}
                                    onClick={() => handleTabClick("wood-drying")}
                                >
                                    <div className="w-[135px]">
                                        Quản lý sấy gỗ
                                    </div>
                                </Tab>
                                <Tab
                                    className="xl:w-fit md:w-full lg:w-full xl:h-fit md:h-fit lg:h-fit flex-nowrap h-fit "
                                    ref={SecondTab}
                                    onClick={() => handleTabClick("wood-working")}
                                >
                                    <div className="w-[137px]">
                                        Quản lý sản xuất
                                    </div>
                                </Tab>
                                <Tab
                                    className="xl:w-fit md:w-full lg:w-full xl:h-fit md:h-fit lg:h-fit flex-nowrap h-fit "
                                    ref={ThirdTab}
                                    onClick={() => handleTabClick("goods-management")}
                                >
                                    <div className="w-[147px]">
                                        Quản lý hàng hóa
                                    </div>
                                </Tab>
                            </TabList>

                            <TabPanels
                                px="0"
                                className="w-full flex justify-center"
                            >
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-0"
                                    style={{ padding: "1rem 0rem" }}
                                >
                                    {/* Cards List */}
                                    <div className="cusTabs w-full flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-6 gap-2 xl:gap-y-6 grid-cols-2">
                                            {[
                                                {
                                                    permission: "xepsay",
                                                    link: "/workspace/wood-sorting",
                                                    icon: <HiSquare3Stack3D />,
                                                    title: "Xếp sấy",
                                                    description:
                                                        "Tạo và xếp pallet để chuẩn bị cho vào lò.",
                                                },
                                                {
                                                    permission: "kehoachsay",
                                                    link: "/workspace/create-drying-plan",
                                                    icon: (
                                                        <HiClipboardDocumentList />
                                                    ),
                                                    title: "Tạo kế hoạch sấy",
                                                    description:
                                                        "Tạo kế hoạch sấy trên danh sách lò hiện có.",
                                                },
                                                {
                                                    permission: "vaolo",
                                                    link: "/workspace/load-into-kiln",
                                                    icon: <HiRectangleStack />,
                                                    title: "Vào lò",
                                                    description:
                                                        "Cho pallet đã tạo vào lò để chuẩn bị sấy.",
                                                },
                                                {
                                                    permission: "kiemtralo",
                                                    link: "/workspace/kiln-checking",
                                                    icon: <HiSearchCircle />,
                                                    title: "Kiểm tra lò sấy",
                                                    description:
                                                        "Kiểm tra lò sấy dựa trên các tiêu chuẩn hoạt động.",
                                                },
                                                {
                                                    permission: "losay",
                                                    link: "/workspace/kiln",
                                                    icon: <HiHomeModern />,
                                                    title: "Lò sấy",
                                                    description:
                                                        "Tiến hành khởi động quá trình sấy gỗ.",
                                                },
                                                {
                                                    permission: "danhgiame",
                                                    link: "/workspace/drying-wood-checking",
                                                    icon: <HiHandThumbUp />,
                                                    title: "Đánh giá mẻ sấy",
                                                    description:
                                                        "Đánh giá mẻ gỗ sau khi sấy và kết thúc quy trình.",
                                                },
                                                {
                                                    permission: "xulypallet",
                                                    link: "/workspace/xu-ly-dieu-chuyen-pallet",
                                                    icon: <HiArrowsRightLeft />,
                                                    title: "Xử lý Pallet",
                                                    description: "Xử lý Pallet trong lò.",
                                                }
                                            ].map(
                                                ({
                                                    permission,
                                                    link,
                                                    icon,
                                                    title,
                                                    description,
                                                }) =>
                                                    user.permissions?.includes(
                                                        permission
                                                    ) && (
                                                        <Link
                                                            to={link}
                                                            key={permission}
                                                        >
                                                            <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-7 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                    <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                        <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[22px] text-left font-bold tracking-tight text-gray-900">
                                                                            {
                                                                                title
                                                                            }
                                                                        </h5>
                                                                        <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                            {
                                                                                description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                        <div className=" text-3xl h-fit rounded-full m-1 p-3 bg-[#DAEAF1] text-[#17506b]">
                                                                            {
                                                                                icon
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-0"
                                    style={{ padding: "1rem 0rem" }}
                                >
                                    {/* Cards List */}
                                    <div className="cusTabs w-full  flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-6 gap-2 xl:gap-y-6 grid-cols-2">
                                            {[
                                                {
                                                    permission: [
                                                        "CBG",
                                                        "CBG(CX)",
                                                    ],
                                                    link: "/workspace/wood-working/finished-goods-receipt",
                                                    icon: (
                                                        <HiArchiveBoxArrowDown />
                                                    ),
                                                    title: "Sản lượng chế biến gỗ",
                                                    description:
                                                        "Nhập sản lượng theo công đoạn",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: ["QCCBG"],
                                                    link: "/workspace/wood-working/qc",
                                                    icon: <HiBadgeCheck />,
                                                    title: "Kiểm định chất lượng chế biến gỗ",
                                                    description:
                                                        "Xử lý lỗi nhập thành phẩm.",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: ["QCCBG",],
                                                    link: "/workspace/qc-che-bien-go",
                                                    icon: <HiViewColumns />,
                                                    title: "Kiểm định chất lượng chế biến gỗ đầu vào",
                                                    description:
                                                        "Kiểm định chất lượng chế biến gỗ đầu vào",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: [
                                                        "VCN",
                                                        "VCN(CX)",
                                                    ],
                                                    link: "/workspace/plywood/finished-goods-receipt",
                                                    icon: (
                                                        <HiArchiveBoxArrowDown />
                                                    ),
                                                    title: "Sản lượng ván công nghiệp",
                                                    description:
                                                        "Nhập sản lượng theo công đoạn",
                                                    type: "VCN",
                                                },
                                                {
                                                    permission: ["QCVCN"],
                                                    link: "/workspace/plywood/qc",
                                                    icon: <HiBadgeCheck />,
                                                    title: "Kiểm định chất lượng ván công nghiệp",
                                                    description:
                                                        "Xử lý lỗi nhập thành phẩm.",
                                                    type: "VCN",
                                                },
                                                {
                                                    permission: ["DAND"],
                                                    link: "/workspace/domestic/tu-bep",
                                                    icon: (
                                                        <HiArchiveBoxArrowDown />
                                                    ),
                                                    title: "Sản lượng Tủ bếp",
                                                    description:
                                                        "Nhập sản lượng lắp đặt tủ bếp",
                                                    type: "ND",
                                                },
                                                {
                                                    permission: [
                                                        "DAND",
                                                        "DAND(CX)"
                                                    ],
                                                    link: "/workspace/inland/installation-progress",
                                                    icon: <HiViewColumns />,
                                                    title: "Tiến độ lắp đặt nội địa",
                                                    description:
                                                        "Báo cáo tiến độ lắp đặt đồ nội thất.",
                                                    type: "ND",
                                                },
                                                {
                                                    permission: [
                                                        "QCCBG"
                                                    ],
                                                    link: "/workspace/wood-working/handle-qc",
                                                    icon: <HiViewColumns />,
                                                    title: "Xử lý hàng QC",
                                                    description: "Xử lý lỗi sản phẩm.",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: ["CBG"],
                                                    link: "/workspace/wood-working/bao-loi-say-lai",
                                                    icon: <HiViewColumns />,
                                                    title: "Báo lỗi xấy ẩm",
                                                    description: "Báo lỗi xấy ẩm.",
                                                    type: "CBG",
                                                }
                                            ].map(
                                                ({
                                                    permission,
                                                    link,
                                                    icon,
                                                    title,
                                                    description,
                                                    type,
                                                    select,
                                                }) =>
                                                    permission.some((perm) =>
                                                        user.permissions?.includes(
                                                            perm
                                                        )
                                                    ) ? (
                                                        select == "ND" ? (
                                                            <div
                                                                key={title}
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    handleMenuClick(
                                                                        "ND"
                                                                    )
                                                                }
                                                            >
                                                                <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                    <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                        <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                            <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                                {
                                                                                    title
                                                                                }
                                                                            </h5>
                                                                            <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                                {
                                                                                    description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                            <div
                                                                                className={`text-3xl h-fit rounded-full m-1 p-3  ${type ===
                                                                                    "CBG"
                                                                                    ? "bg-[#DAF1E8] text-green-900"
                                                                                    : type ===
                                                                                        "VCN"
                                                                                        ? "bg-[#f9eeff] text-violet-900"
                                                                                        : type ===
                                                                                            "ND"
                                                                                            ? "bg-[#ffeef2] text-red-900"
                                                                                            : "bg-[#F5F5F5]"
                                                                                    }`}
                                                                            >
                                                                                {
                                                                                    icon
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            link == "/workspace/wood-working/bao-loi-say-lai" ? (
                                                                <div
                                                                    className="cursor-pointer"
                                                                    key={title}
                                                                    onClick={() => {
                                                                        onHandle();
                                                                    }}
                                                                >
                                                                    <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                        <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                            <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                                <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                                    {
                                                                                        title
                                                                                    }
                                                                                </h5>
                                                                                <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                                    {
                                                                                        description
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                                <div
                                                                                    className={`text-3xl h-fit rounded-full m-1 p-3  ${type ===
                                                                                        "CBG"
                                                                                        ? "bg-[#DAF1E8] text-green-900"
                                                                                        : type ===
                                                                                            "VCN"
                                                                                            ? "bg-[#f9eeff] text-violet-900"
                                                                                            : type ===
                                                                                                "ND"
                                                                                                ? "bg-[#ffeef2] text-red-900"
                                                                                                : "bg-[#F5F5F5]"
                                                                                        }`}
                                                                                >
                                                                                    {
                                                                                        icon
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Link
                                                                    to={link}
                                                                    key={title}
                                                                >
                                                                    <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                        <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                            <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                                <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                                    {
                                                                                        title
                                                                                    }
                                                                                </h5>
                                                                                <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                                    {
                                                                                        description
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                                <div
                                                                                    className={`text-3xl h-fit rounded-full m-1 p-3  ${type ===
                                                                                        "CBG"
                                                                                        ? "bg-[#DAF1E8] text-green-900"
                                                                                        : type ===
                                                                                            "VCN"
                                                                                            ? "bg-[#f9eeff] text-violet-900"
                                                                                            : type ===
                                                                                                "ND"
                                                                                                ? "bg-[#ffeef2] text-red-900"
                                                                                                : "bg-[#F5F5F5]"
                                                                                        }`}
                                                                                >
                                                                                    {
                                                                                        icon
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            )

                                                        )
                                                    ) : (
                                                        <div key={title}>
                                                            <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-7 p-4 bg-[#bbbbc3] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl ">
                                                                    <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                        <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[22px] text-left font-bold tracking-tight text-transparent">
                                                                            {
                                                                                title
                                                                            }
                                                                        </h5>
                                                                        <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-transparent">
                                                                            {
                                                                                description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                        <div className=" text-3xl h-fit rounded-full m-1 p-3 bg-transparent text-transparent">
                                                                            {
                                                                                icon
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                {/* Quản lý hàng hóa */}
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-0"
                                    style={{ padding: "1rem 0rem" }}
                                >
                                    <div className="cusTabs w-full  flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-6 gap-2 xl:gap-y-6 grid-cols-2">
                                            {[
                                                {
                                                    permission: ["dieuchuyenbinkho"],
                                                    link: "/workspace/goods-management/bin-warehouse-transfer",
                                                    icon: <HiMiniTruck />,
                                                    title: "Điều chuyển hàng hóa theo bin",
                                                    description:
                                                        "Điều chuyển hàng hóa và quản lý theo bin.",
                                                    type: "DCHH",
                                                },
                                                {
                                                    permission: ["kiemkevattuson"],
                                                    link: "/workspace/goods-management/print-inventory-posting",
                                                    icon: <HiViewColumns />,
                                                    title: "Kiểm kê vật tư sơn",
                                                    description:
                                                        "Quản lý tồn kho vật tư sơn.",
                                                    type: "CBG",
                                                },
                                                // {
                                                //     permission: ["X"],
                                                //     link: "/workspace/wood-working/qc",
                                                //     icon: <HiBadgeCheck />,
                                                //     title: "Kiểm định chất lượng chế biến gỗ",
                                                //     description:
                                                //         "Xử lý lỗi nhập thành phẩm.",
                                                //     type: "CBG",
                                                // },
                                                // {
                                                //     permission: ["X"],
                                                //     link: "/workspace/plywood/finished-goods-receipt",
                                                //     icon: (
                                                //         <HiArchiveBoxArrowDown />
                                                //     ),
                                                //     title: "Sản lượng ván công nghiệp",
                                                //     description:
                                                //         "Nhập sản lượng theo công đoạn.",
                                                //     type: "VCN",
                                                // },
                                                // {
                                                //     permission: ["X"],
                                                //     link: "/workspace/plywood/qc",
                                                //     icon: <HiBadgeCheck />,
                                                //     title: "Kiểm định chất lượng ván công nghiệp",
                                                //     description:
                                                //         "Xử lý lỗi nhập thành phẩm.",
                                                //     type: "VCN",
                                                // },
                                                // {
                                                //     permission: ["X"],
                                                //     select: "ND",
                                                //     icon: (
                                                //         <HiArchiveBoxArrowDown />
                                                //     ),
                                                //     title: "Sản lượng nội địa",
                                                //     description:
                                                //         "Nhập sản lượng lắp đặt khối nội địa.",
                                                //     type: "ND",
                                                // },
                                                // {
                                                //     permission: ["X"],
                                                //     link: "/workspace/inland/installation-progress",
                                                //     icon: <HiViewColumns />,
                                                //     title: "Tiến độ lắp đặt nội địa",
                                                //     description:
                                                //         "Báo cáo tiến độ lắp đặt đồ nội thất.",
                                                //     type: "ND",
                                                // },

                                            ].map(
                                                ({
                                                    permission,
                                                    link,
                                                    icon,
                                                    title,
                                                    description,
                                                    type,
                                                    select,
                                                }) =>
                                                    permission.some((perm) =>
                                                        user.permissions?.includes(
                                                            perm
                                                        )
                                                    ) ? (
                                                        select == "ND" ? (
                                                            <div
                                                                key={title}
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    handleMenuClick(
                                                                        "ND"
                                                                    )
                                                                }
                                                            >
                                                                <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                    <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                        <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                            <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                                {
                                                                                    title
                                                                                }
                                                                            </h5>
                                                                            <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                                {
                                                                                    description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                            <div
                                                                                className={`text-3xl h-fit rounded-full m-1 p-3  ${type ===
                                                                                    "CBG"
                                                                                    ? "bg-[#DAF1E8] text-green-900"
                                                                                    : type ===
                                                                                        "VCN"
                                                                                        ? "bg-[#f9eeff] text-violet-900"
                                                                                        : type ===
                                                                                            "ND"
                                                                                            ? "bg-[#ffeef2] text-red-900"
                                                                                            : "bg-[#F5F5F5]"
                                                                                    }`}
                                                                            >
                                                                                {
                                                                                    icon
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                to={link}
                                                                key={title}
                                                            >
                                                                <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                    <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                        <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                            <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                                {
                                                                                    title
                                                                                }
                                                                            </h5>
                                                                            <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                                {
                                                                                    description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                            <div
                                                                                className={`text-3xl h-fit rounded-full m-1 p-3  ${type ===
                                                                                    "CBG"
                                                                                    ? "bg-[#DAF1E8] text-green-900"
                                                                                    : type ===
                                                                                        "VCN"
                                                                                        ? "bg-[#f9eeff] text-violet-900"
                                                                                        : type ===
                                                                                            "ND"
                                                                                            ? "bg-[#ffeef2] text-red-900"
                                                                                            : "bg-[#F5F5F5]"
                                                                                    }`}
                                                                            >
                                                                                {
                                                                                    icon
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        )
                                                    ) : (
                                                        <div key={title}>
                                                            <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-7 p-4 bg-[#bbbbc3] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl ">
                                                                    <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                        <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[22px] text-left font-bold tracking-tight text-transparent">
                                                                            {
                                                                                title
                                                                            }
                                                                        </h5>
                                                                        <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-transparent">
                                                                            {
                                                                                description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                        <div className=" text-3xl h-fit rounded-full m-1 p-3 bg-transparent text-transparent">
                                                                            {
                                                                                icon
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs >
                    </div >
                </div >
            </div >

            <Modal
                isCentered
                isOpen={isModalOpen}
                size="3xl"
                onClose={onModalClose}
                scrollBehavior="inside"
                closeOnOverlayClick={false}
                closeOnEsc={false}
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent m={0} h="100vh">
                    <ModalHeader className="!p-2.5 ">
                        <h1 className="pl-4 text-xl lg:text-2xl serif font-bold text-center">
                            Báo lỗi sấy ẩm
                        </h1>
                    </ModalHeader>
                    <div className="border-b-2 border-gray-200"></div>
                    <ModalBody className="bg-gray-100 !p-6">
                        <div className="pt-3">
                            <div className="mt-2 xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#FFFFFF]">
                                <div className="flex justify-between pb-1 ">
                                    <div className="flex items-center space-x-2">
                                        <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                        <div className="font-semibold text-md">
                                            Nhập thông tin
                                        </div>
                                    </div>
                                </div>

                                <div className="gap-2 items-center justify-between py-3 border-t">
                                    <Box className="mb-3" >
                                        <label className="font-semibold">
                                            Tổ báo lỗi
                                        </label>
                                        <Select
                                            options={teams}
                                            placeholder="Chọn tổ"
                                            className="w-full mt-2 cursor-pointer"
                                            onChange={(team) => {
                                                setTeam(team);
                                                setData(pre => ({ ...pre, team }))
                                            }}
                                        />
                                    </Box>

                                    <Box className="mb-3" >
                                        <SimpleGrid columns={3} spacing={4}>

                                            <Box>
                                                <Text className="font-semibold">
                                                    Chiều dày
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        step={1}
                                                        className="mt-2"
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setData(pre => ({ ...pre, day: Number(value) }));
                                                        }}
                                                        min={0}
                                                    >
                                                        <NumberInputField />
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box>
                                                <Text className="font-semibold">
                                                    Chiều Rộng
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        step={1}
                                                        className="mt-2"
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setData(pre => ({ ...pre, rong: Number(value) }))
                                                        }}
                                                        min={0}
                                                    >
                                                        <NumberInputField />
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box>
                                                <Text className="font-semibold">
                                                    Chiều dài
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        step={1}
                                                        className="mt-2"
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setData(pre => ({ ...pre, dai: Number(value) }))
                                                        }}
                                                        min={0}
                                                    >
                                                        <NumberInputField />
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>
                                    <Box className="mb-2">
                                        <SimpleGrid columns={1} spacing={3}>
                                            <Box>
                                                <Text className="font-semibold">
                                                    Số lượng
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        step={1}
                                                        className="mt-2"
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setData(pre => ({ ...pre, quantity: Number(value) }))
                                                        }}
                                                        min={1}
                                                    >
                                                        <NumberInputField />
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box>
                                                <Text className="font-semibold">
                                                    Khối lượng
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        className="mt-2"
                                                        value={data.m3}
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setData(pre => ({ ...pre, m3: value }))
                                                        }}
                                                        step={1}
                                                    >
                                                        <NumberInputField />
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>

                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="flex flex-col !p-0">
                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                            <button
                                onClick={onClose}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={onConfirm}
                                className="bg-[#17506B] text-[#FFFFFF] p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {loading && <Loader />}
        </Layout >
    );
}

export default Workspace;
