import { FaArrowDown, FaArrowLeft, FaArrowRotateLeft, FaArrowUpRightFromSquare, FaCheck } from "react-icons/fa6";
import Layout from "../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { IoClose, IoSearch } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { useEffect, useRef, useState } from "react";
import { getFirstDayOfCurrentMonth } from '../../../utils/date.utils';
import { danhSachNhaMayCBG } from "../../../api/MasterDataApi";
import toast from "react-hot-toast";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import { layDanhSachToTheoNhaMayCBG } from "../../../api/ORSCApi";
import { Checkbox, Radio, RadioGroup, Spinner } from "@chakra-ui/react";
import { baoCaoSanLuongQuyDoiCBG } from "../../../api/ReportSAPApi";
import { AgGridReact } from "ag-grid-react";
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import moment from "moment";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Select from "react-select";

const SanLuongQuyDoi = () => {
    const navigate = useNavigate();

    const gridRef = useRef();

    const [filter, setFilter] = useState({
        fromDate: getFirstDayOfCurrentMonth(),
        toDate: new Date(),
        factory: ''
    });

    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reports, setReports] = useState([]);
    const [factoryOptions, setFactoryOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);

    const getFactories = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            setFactories(res.data.factories);
            let options = [];
            res.data.factories.forEach(item => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            })
            console.log("options", options);

            setFactoryOptions(options);

        } catch (error) {
            toast.error('Lấy danh sách nhà máy có lỗi.');
        }
    }

    const handleSelectFactory = async (value) => {
        setTeam(null);
        setTeams([]);
        setSelectedFactory(value);
        await getTeams(value);
    }

    const getTeams = async (factory) => {
        try {
            setLoading(true);
            let res = await layDanhSachToTheoNhaMayCBG(factory);
            setTeams(res);
            setLoading(false);

            let options = [];

            res.forEach(item => {
                options.push({
                    label: item.Name,
                    value: item.Code
                })
            })
            options = options.sort((a, b) => a.label.localeCompare(b.label, 'vi', { numeric: true }));

            setTeamOptions(options)
        } catch (error) {
            toast.error('Lấy danh sách tổ có lỗi.');
            setLoading(false);
        }
    }

    const getReports = async () => {
        try {
            setLoadingReport(true);
            let _t = teams.find(item => item.Code == team);
            let res = await baoCaoSanLuongQuyDoiCBG({
                fromDate: filter.fromDate,
                toDate: filter.toDate,
                team: team,
                CD: _t.CDOAN

            });
            res = res.sort((item1, item2) => new Date(item1.DocDate) - new Date(item2.DocDate))
            res.forEach(item => {
                item.QUANTITY = Number(item.QUANTITY);
            });
            setReports(res);
            setLoadingReport(false);
        } catch (error) {
            toast.error('Lấy báo cáo có lỗi.');
            setLoadingReport(false);
        }
    }

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: "#F6F6F6" };
        }
        return { background: "#ffffff" };
    };

    const [colDefs] = useState([
        {
            headerName: "LSX",
            field: "U_GRID",
            filter: true,
            width: 150,
            rowGroup: true,
            enableRowGroup: true,
            hide: true,
            sort: "asc",
            pinned: "left",
        },
        {
            headerName: "Ngày",
            field: "DocDate",
            filter: true,
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return moment(param.value).format('DD/MM/YYYY')
            },
            width: 150
        },
        {
            headerName: "Mã SP",
            field: "ItemCode",
            filter: true,
            width: 150
        },
        {
            headerName: "Tên SP",
            field: "ItemName",
            filter: true,
            minWidth: 250,
            flex: 1
        },
        {
            headerName: "CĐ",
            field: "U_CDOAN",
            filter: true,
            width: 100
        },
        {
            headerName: "Số lượng",
            field: "QUANTITY",
            filter: true,
            width: 170,
            aggFunc: "sum",
            headerComponentParams: { displayName: "Số lượng" }
        },
        {
            headerName: "Tổ giao",
            field: "U_To",
            filter: true,
            width: 170
        },
        {
            headerName: "Ngày giao",
            field: "CreateDate",
            filter: true,
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return moment(param.value).format('DD/MM/YYYY')
            },
            width: 170
        },
        {
            headerName: "Tổ nhận",
            field: "U_Next",
            filter: true,
            width: 170
        },
        {
            headerName: "Ngày nhận",
            field: "CreateDate",
            filter: true,
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return moment(param.value).format('DD/MM/YYYY')
            },
            width: 170
        },
        {
            headerName: "Dày",
            field: "U_CDay",
            filter: true,
            width: 150
        },
        {
            headerName: "Rộng",
            field: "U_CRong",
            filter: true,
            width: 150
        },
        {
            headerName: "Dài",
            field: "U_CDai",
            filter: true,
            width: 150
        }
    ]);

    const handleExportExcel = () => {
        const fileName = `Báo cáo sản lượng quy đổi.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }

    useEffect(() => {
        getFactories();
    }, []);

    useEffect(() => {
        if (!team && !selectedFactory) return;
        getReports();

    }, [filter.fromDate, filter.toDate, team]);

    return (
        <Layout>
            <div className="overflow-x-hidden over xl:h-fit lg:h-fit md:h-fit h-screen">
                <div className="w-screen h-full p-6 px-5 xl:p-5 xl:px-12 ">
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-center justify-between xL:space-x-6 lg:space-x-6 md:space-x-6 space-x-0 xL:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={() => navigate(`/reports?tab=wood-working`)}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm  text-[#17506B]">
                                    Báo cáo chế biến gỗ
                                </div>
                                <div className="serif text-3xl font-bold xl:block lg:block md:block hidden">
                                    Báo cáo sản lượng quy đổi
                                </div>
                                <div className="serif text-3xl font-bold xl:hidden lg:hidden md:hidden block">
                                    Báo cáo sản lượng quy đổi
                                </div>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="xl:w-1/2 lg:w-1/2 md:w-1/2 w-full items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1 rounded-lg bg-[#F9FAFB] xl:display:flex lg:flex md:flex hidden">
                            <div className="flex items-center space-x-3 xl:w-2/3 lg:w-3/4 md:w-3/4 w-[90%] ">
                                <IoSearch className="w-6 h-6 text-gray-500 " />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tất cả..."
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                />
                            </div>

                            <div className="flex justify-end items-center divide-x-2 xl:w-1/3 lg:w-1/4 md:w-1/4 w-[10%">
                                <div className="mx-2.5"></div>
                                {/* <div>
                                    <FaArrowRotateLeft
                                        className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleResetFilter}
                                    />
                                </div> */}
                                <div>
                                    <FaArrowUpRightFromSquare
                                        className="mx-2.5 w-5 h-5 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all xl:display:inline-block lg:inline-block md:inline-block hidden"
                                        onClick={handleExportExcel}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="xl:w-1/2 lg:w-1/2 md:w-1/2 w-full flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1 rounded-lg bg-[#F9FAFB] xl:display:hidden lg:hidden md:hidden  ">
                            <div className="flex items-center space-x-3 xl:w-2/3 lg:w-3/4 md:w-3/4 w-[90%] ">
                                <IoSearch className="w-6 h-6 text-gray-500 " />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm"
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                // value={searchTerm}
                                // onChange={(e) =>
                                //     setSearchTerm(e.target.value)
                                // }
                                />
                            </div>
                        </div>
                    </div>

                    <div className=" bg-white rounded-xl py-2 pb-3 xl:display:block lg:block md:block hidden">
                        {/* Filter */}
                        <div className="flex items-center space-x-3 divide-x-2 divide-gray-100 px-4 mt-1">
                            <div className="flex space-x-3 w-1/4">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, fromDate: date }));
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900 "
                                    >
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.toDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, toDate: date }));
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>
                            <div className="w-3/4 px-3">
                                <div className="">
                                    <label className="block mb-1 text-sm font-medium text-gray-900">
                                        Chọn nhà máy
                                    </label>
                                </div>
                                <div className="flex gap-x-3">
                                    {
                                        factories.map((factory, i) => (
                                            <div key={i}
                                                className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all 
                                            ${selectedFactory === factory.U_FAC
                                                        ? "border-[#86ABBE] bg-[#eaf8ff]"
                                                        : "border-gray-300"
                                                    }`}
                                                onClick={() => handleSelectFactory(factory.U_FAC)}
                                            >
                                                {selectedFactory === factory.U_FAC ? (
                                                    <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
                                                ) : (
                                                    <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
                                                )}
                                                <div
                                                    className={`${selectedFactory === factory.U_FAC
                                                        ? "text-[#17506B] font-medium"
                                                        : "text-gray-400 group-hover:text-[#17506B]"
                                                        }`}
                                                >
                                                    {factory.Name}
                                                </div>
                                            </div>
                                        ))
                                    }

                                </div>
                            </div>
                        </div>

                        {/* Team Select */}
                        {selectedFactory && (
                            <div className=" border-2 border-[#C6D2D9] bg-[#f0faff] rounded-lg p-2 py-2 px-4 pb-4  m-2 mt-3 mx-4">
                                {
                                    loading ? (
                                        <div className="text-center my-3 mt-6">
                                            <Spinner
                                                thickness="7px"
                                                speed="0.65s"
                                                emptyColor="gray.200"
                                                color="#155979"
                                                size="xl"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between space-x-3">
                                                <div className="font-semibold">
                                                    Chọn các tổ thực hiện:
                                                </div>
                                            </div>
                                            <div className="w-full grid grid-cols-5">
                                                <div className="col-span-1 space-y-2">
                                                    <div className="text-[#155979] uppercase font-medium">
                                                        Runnen
                                                    </div>
                                                    <RadioGroup onChange={setTeam} value={team}>
                                                        {teams
                                                            ?.filter(
                                                                (item) =>
                                                                    item.CDOAN === "RN"
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <Radio
                                                                        value={
                                                                            item.Code
                                                                        }
                                                                    >
                                                                        {item.Name}
                                                                    </Radio>
                                                                </div>
                                                            ))}
                                                    </RadioGroup>
                                                </div>
                                                <div className="col-span-1 space-y-2 ">
                                                    <div className="text-[#155979] uppercase font-medium">
                                                        Sơ chế
                                                    </div>
                                                    <RadioGroup onChange={setTeam} value={team}>
                                                        {teams
                                                            ?.filter(
                                                                (item) =>
                                                                    item.CDOAN === "SC"
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <Radio
                                                                        value={
                                                                            item.Code
                                                                        }
                                                                    >
                                                                        {item.Name}
                                                                    </Radio>
                                                                </div>
                                                            ))}
                                                    </RadioGroup>

                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <div className="text-[#155979] uppercase font-medium">
                                                        Tinh chế
                                                    </div>
                                                    <RadioGroup onChange={setTeam} value={team}>
                                                        {teams
                                                            ?.filter(
                                                                (item) =>
                                                                    item.CDOAN === "TC"
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <Radio
                                                                        value={
                                                                            item.Code
                                                                        }
                                                                    >
                                                                        {item.Name}
                                                                    </Radio>
                                                                </div>
                                                            ))}
                                                    </RadioGroup>

                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <div className="text-[#155979] uppercase font-medium">
                                                        Hoàn thiện
                                                    </div>
                                                    <RadioGroup onChange={setTeam} value={team}>
                                                        {teams
                                                            ?.filter(
                                                                (item) =>
                                                                    item.CDOAN === "HT"
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <Radio
                                                                        value={
                                                                            item.Code
                                                                        }
                                                                    >
                                                                        {item.Name}
                                                                    </Radio>
                                                                </div>
                                                            ))}
                                                    </RadioGroup>

                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <div className="text-[#155979] uppercase font-medium">
                                                        Đóng gói
                                                    </div>
                                                    <RadioGroup onChange={setTeam} value={team}>
                                                        {teams
                                                            ?.filter(
                                                                (item) =>
                                                                    item.CDOAN === "DG"
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <Radio
                                                                        value={
                                                                            item.Code
                                                                        }
                                                                    >
                                                                        {item.Name}
                                                                    </Radio>
                                                                </div>
                                                            ))}
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>

                    <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3 xl:display:hidden lg:hidden md:hidden block">
                        {/*Filter */}
                        <div className="flex-col items-center space-y-3 px-4 mt-1 mb-1">
                            {/* Date Filter */}
                            <div className="flex space-x-3">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, fromDate: date }));
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 font-medium text-gray-900 "
                                    >
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.toDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, toDate: date }));
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 w-full">
                                <div className="w-full">
                                    <label
                                        htmlFor="first_name"
                                        className="block mb-1 font-medium text-gray-900"
                                    >
                                        Chọn nhà máy
                                    </label>
                                    <Select
                                        placeholder="Chọn nhà máy..."
                                        options={factoryOptions}
                                        defaultOptions
                                        onChange={(option) => {
                                            // setTeam(value);
                                            console.log("value", option);
                                            setFilter(prev => ({ ...prev, factory: option.value }));
                                            handleSelectFactory(option.value);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Team Filter */}
                            <div className="flex space-x-3 w-full">
                                <div className="w-full">
                                    <label
                                        htmlFor="first_name"
                                        className="block mb-1 font-medium text-gray-900"
                                    >
                                        Chọn công đoạn
                                    </label>
                                    <Select
                                        placeholder="Chọn công đoạn..."
                                        options={teamOptions}
                                        defaultOptions
                                        onChange={(option) => {
                                            setTeam(option.value);
                                            console.log("option", option);

                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        loadingReport ? (
                            <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg xl:flex lg:flex md:flex hidden">
                                <div className="dots my-1"></div>
                            </div>
                        ) : (
                            reports.length > 0 ? (
                                <>
                                    <div className="xl:display:block lg:block md:block hidden">
                                        <div
                                            className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                            style={{
                                                height: 630,
                                                fontSize: 16,
                                            }}
                                            id="app-ag-grid"
                                        >
                                            <AgGridReact
                                                ref={gridRef}
                                                rowData={reports}
                                                columnDefs={colDefs}
                                                groupDisplayType={"multipleColumns"}
                                                getRowStyle={getRowStyle}
                                                grandTotalRow={"bottom"}
                                                localeText={AG_GRID_LOCALE_VI}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:display:hidden lg:hidden md:hidden sm:block block mt-3 ">
                                        {
                                            reports.map((report, i) => (
                                                <div className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mt-4" key={i}>
                                                    <div className="flex-col w-full">
                                                        <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                            {report.ItemName}
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold">
                                                            <span>LSX: </span>
                                                            <span className="font-normal">
                                                                {report.U_GRID}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold">
                                                            <span>Quy cách: </span>
                                                            <span className="font-normal">
                                                                {Number(report.U_CDay)}*
                                                                {Number(report.U_CRong)}
                                                                *{Number(report.U_CDai)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Số lượng: </span>
                                                            <span className="font-normal">
                                                                {parseInt(report.QUANTITY)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex items-center w-full pl-3 ">
                                                            <div className="space-y-3 border-l-2 border-dashed border-gray-400 w-full">
                                                                <div className="relative w-full">
                                                                    <FaArrowDown className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-blue-600 p-1" />
                                                                    <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                        <div className="flex-col  ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Tổ giao:{" "}
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.U_To
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex text-gray-500 space-x-2 items-center">
                                                                            <div>
                                                                                {moment(report.CreateDate).format(`DD/MM/YYYY`)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="relative w-full ">
                                                                    <FaCheck className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-green-500 p-1" />
                                                                    <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                        <div className="flex-col ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Tổ nhận:{" "}
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.U_Next
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex text-gray-500 space-x-2 items-center">
                                                                            <div>
                                                                                {moment(report.CreateDate).format(`DD/MM/YYYY`)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB] items-center justify-center text-center p-2 px-4 pr-1 rounded-lg w-full">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )
                        )}
                </div>
            </div>
        </Layout>
    )
}

export default SanLuongQuyDoi;