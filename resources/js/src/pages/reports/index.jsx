import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import Select from "react-select";
import { dateToDateTime } from "../../utils/convertDatetime";
import { MdOutlineRefresh } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Switch,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import Layout from "../../layouts/layout";
import useAppContext from "../../store/AppContext";
import Loader from "../../components/Loader";
import AG_GRID_LOCALE_VI from "../../utils/locale.vi";

const sizeOptions = [
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
];

const exampleData = [
    {
        id: "0001",
        name: "Báo cáo xếp sấy khối chế biến gỗ",
        link: "/reports/wood-processing-kiln-stacking",
    },
    {
        id: "0002",
        name: "Báo cáo xếp chờ xấy",
        link: "/reports/wood-awaiting-drying",
    },
    {
        id: "0003",
        name: "Báo cáo tồn sấy lựa",
        link: "/reports/selected-dried-inventory",
    },
    {
        id: "0004",
        name: "Báo cáo lò đang sấy",
        link: "/reports/current-drying-kiln",
    },
];

const exampleData1 = [
    {
        id: "0001",
        name: "Biên bản kiểm tra lò sấy",
        link: "/reports/kiln-inspection",
    },
    {
        id: "0002",
        name: "Biên bản lịch sử vào lò",
        link: "/reports/drying-kiln-history",
    },
    {
        id: "0003",
        name: "Biên bản kiểm tra độ ẩm",
        link: "/reports/humidity-checking",
    },
];

var checkboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

function Report() {
    const { loading, setLoading } = useAppContext();

    const reportTab = useRef();
    const recordTab = useRef();
    const reportGridRef = useRef();
    const recordGridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const [reportData, setReportData] = useState([]);
    const [recordData, setRecordData] = useState([]);

    const [reportColumnDefs, setReportColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.node.rowIndex + 1;
            },
            width: 70,
            maxWidth: 70,
        },
        {
            headerName: "Tên báo cáo",
            field: "name",
            cellRenderer: (params) => {
                return <Link to={params.data.link}>{params.data.name}</Link>;
            },
            minWidth: 170,
        },
    ]);

    const [recordColumnDefs, setRecordColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.node.rowIndex + 1;
            },
            width: 70,
            maxWidth: 70,
        },
        {
            headerName: "Tên biên bản",
            field: "name",
            cellRenderer: (params) => {
                return <Link to={params.data.link}>{params.data.name}</Link>;
            },
            minWidth: 170,
        },
    ]);

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: "Group",
            minWidth: 170,
            field: "id",
            valueGetter: (params) => {
                if (params.node.group) {
                    return params.node.key;
                } else {
                    return params.data[params.colDef.field];
                }
            },
            headerCheckboxSelection: true,
            cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const paginationNumberFormatter = useCallback((params) => {
        return "[" + params.value.toLocaleString() + "]";
    }, []);

    const onReportGridReady = useCallback(async () => {
        showLoadingReport();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setReportData(exampleData);
        }, 1000);
        hideLoadingReport();
    }, []);

    const onRecordGridReady = useCallback(async () => {
        showLoadingRecord();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setRecordData(exampleData1);
        }, 1000);
        hideLoadingRecord();
    }, []);

    const onFirstReportDataRendered = useCallback((params) => {
        reportGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onFirstRecordDataRendered = useCallback((params) => {
        recordGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onReportFilterTextBoxChanged = useCallback(() => {
        reportGridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const onRecordFilterTextBoxChanged = useCallback(() => {
        reportGridRef.current.api.setQuickFilter(
            document.getElementById("record-search").value
        );
    }, []);

    const showLoadingReport = useCallback(() => {
        reportGridRef.current.api.showLoadingOverlay();
    }, []);

    const showLoadingRecord = useCallback(() => {
        recordGridRef.current.api.showLoadingOverlay();
    }, []);

    const hideLoadingReport = useCallback(() => {
        reportGridRef.current.api.hideOverlay();
    }, []);

    const hideLoadingRecord = useCallback(() => {
        recordGridRef.current.api.hideOverlay();
    }, []);

    // User Actions
    // const deleteUser = async (data) => {
    //     const randomNum = Math.floor(Math.random() * 90 + 10);

    //     const userInput = prompt(
    //         `Nhập ${randomNum} để xác nhận xoá người dùng ${data.first_name}.\nLưu ý: Không thể hoàn tác xoá dữ liệu người dùng.`
    //     );

    //     if (userInput && parseInt(userInput) === randomNum) {
    //         if (data.id) {
    //             setLoading(true);
    //             try {
    //                 const res = await usersApi.deleteUser(data.id);
    //                 console.log("Result xoá: ", res);
    //                 toast.success("Xoá người dùng thành công.");
    //                 setUserData(userData.filter((item) => item.id != data.id));
    //             } catch (error) {
    //                 console.error(error);
    //                 toast.error("Có lỗi xảy ra.");
    //             }
    //             setLoading(false);
    //         }
    //     } else if (userInput && parseInt(userInput) !== randomNum) {
    //         toast.error("Đã huỷ xoá người dùng.");
    //     }
    // };

    const handleRetryGrid = async () => {
        toast("Chức năng đang được phát triển.");
    };

    useEffect(() => {
        document.title = "Woodsland - Báo cáo";
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent h-screen ">
                {/* Section */}
                <div className="w-screen xl:mb-4 mb-6 p-6 px-5 xl:p-12 xl:px-32 ">
                    {/* Breadcrumb */}
                    {/* <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/integration"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Tích hợp
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div> */}

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">
                        Danh sách báo cáo
                    </div>

                    {/* Main content */}

                    <section className="bg-white rounded-lg border-2 mb-2 border-gray-200">
                        <Tabs size="lg">
                            <TabList className="">
                                <Tab
                                    ref={reportTab}
                                    // onClick={() => handleTabClick(false)}
                                >
                                    <div className="text-base font-medium">
                                        Báo cáo
                                    </div>
                                </Tab>
                                <Tab
                                    ref={recordTab}
                                    // onClick={() => handleTabClick(true)}
                                >
                                    <div className="text-base font-medium">
                                        Biên bản
                                    </div>
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* Báo cáo */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Controller */}
                                    <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center">
                                        <div className="flex w-full justify-end space-x-4">
                                            <div className="">
                                                <label
                                                    for="search"
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
                                                        className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Tìm kiếm"
                                                        onInput={
                                                            onReportFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4 ">
                                        <AgGridReact
                                            ref={reportGridRef}
                                            rowData={reportData}
                                            columnDefs={reportColumnDefs}
                                            autoGroupColumnDef={
                                                autoGroupColumnDef
                                            }
                                            defaultColDef={defaultColDef}
                                            suppressRowClickSelection={true}
                                            groupSelectsChildren={true}
                                            rowSelection={"multiple"}
                                            rowGroupPanelShow={"always"}
                                            pivotPanelShow={"always"}
                                            pagination={true}
                                            paginationPageSize={20}
                                            // paginationNumberFormatter={
                                            //     paginationNumberFormatter
                                            // }
                                            onGridReady={onReportGridReady}
                                            onFirstDataRendered={
                                                onFirstReportDataRendered
                                            }
                                            suppressRowVirtualisation={true}
                                            localeText={localeText}
                                        />
                                    </div>
                                </TabPanel>

                                {/* Biên bản */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Controller */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex w-full justify-end space-x-4">
                                            <div className="">
                                                <label
                                                    for="record-search"
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
                                                        type="text"
                                                        id="record-search"
                                                        className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Tìm kiếm"
                                                        onInput={
                                                            onRecordFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4 ">
                                        <AgGridReact
                                            ref={recordGridRef}
                                            rowData={recordData}
                                            columnDefs={recordColumnDefs}
                                            autoGroupColumnDef={
                                                autoGroupColumnDef
                                            }
                                            defaultColDef={defaultColDef}
                                            suppressRowClickSelection={true}
                                            groupSelectsChildren={true}
                                            rowSelection={"multiple"}
                                            rowGroupPanelShow={"always"}
                                            pivotPanelShow={"always"}
                                            pagination={true}
                                            paginationPageSize={20}
                                            // paginationNumberFormatter={
                                            //     paginationNumberFormatter
                                            // }
                                            onGridReady={onRecordGridReady}
                                            onFirstDataRendered={
                                                onFirstRecordDataRendered
                                            }
                                            localeText={localeText}
                                        />
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </section>
                    <div className="py-4"></div>
                </div>
            </div>

            {loading && <Loader />}
        </Layout>
    );
}

export default Report;
