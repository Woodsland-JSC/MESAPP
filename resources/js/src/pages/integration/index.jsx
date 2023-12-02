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
        type: "GET",
        status: "Success",
    },
    {
        id: "0002",
        type: "GET",
        status: "Success",
    },
    {
        id: "0003",
        type: "DELETE",
        status: "Success",
    },
    {
        id: "0004",
        type: "POST",
        status: "Failed",
    },
    {
        id: "0005",
        type: "POST",
        status: "Success",
    },
    {
        id: "0006",
        type: "POST",
        status: "Failed",
    },
];

var checkboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

function Integration() {
    const { loading, setLoading } = useAppContext();

    const integrationTab = useRef();
    const integrationGridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const [integrationData, setIntegrationrData] = useState([]);

    const [integrationColumnDefs, setIntegrationColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.node.rowIndex + 1;
            },
            // cellRenderer: (params) => {
            //     return (
            //         <Link to={"/user/" + params.data.id}>
            //             {(params.data.first_name
            //                 ? params.data.first_name + " "
            //                 : "") +
            //                 (params.data.last_name
            //                     ? params.data.last_name
            //                     : "")}
            //         </Link>
            //     );
            // },
            width: 90,
            maxWidth: 100,
            maxHeight: 100,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        {
            headerName: "ID",
            valueGetter: function (params) {
                return params.data.id;
            },
        },
        { headerName: "Loại", field: "type", minWidth: 170 },
        { headerName: "Trạng thái", field: "status",  minWidth: 350 },
        {
            headerName: "Ngày tạo",
            valueGetter: function (params) {
                return dateToDateTime(params.data.created_at) || "";
            },
            minWidth: 130,
        },
        {
            headerName: "Hành động",
            cellRenderer: (params) => {
                return (
                    <div className="flex gap-2 items-center h-full">
                        <TbRefresh
                            className="cursor-pointer text-indigo-700 text-[18px]"
                            onClick={() => toast("Chức năng chưa phát triểnI")}
                        />
                    </div>
                );
            },
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

    const onIntegrationGridReady = useCallback(async () => {
        showLoadingIntegration();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setIntegrationrData(exampleData);
        }, 1000);
        hideLoadingIntegration();
    }, []);

    const onFirstDataRendered = useCallback((params) => {
        integrationGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onPageSizeChanged = (selectedOption) => {
        var value = selectedOption.label;
        integrationGridRef.current.api.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = useCallback(() => {
        integrationGridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const showLoadingIntegration = useCallback(() => {
        integrationGridRef.current.api.showLoadingOverlay();
    }, []);

    const hideLoadingIntegration = useCallback(() => {
        integrationGridRef.current.api.hideOverlay();
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
        toast("Chức năng đang được phát triển.")
    }

    useEffect(() => {
        document.title = "Woodsland - Quản lý tích hợp";
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
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
                    <div className="text-3xl font-bold mb-6">Tích hợp</div>

                    {/* Main content */}

                    <section className="bg-white rounded-lg border-2 mb-2 border-gray-200">
                        <Tabs size="lg">
                            <TabList className="">
                                <Tab ref={integrationTab}>
                                    <div className="text-base font-medium">
                                        Danh sách tích hợp
                                    </div>
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* Người dùng */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Controller */}
                                    <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center">
                                        <div className="flex xl:w-1/3 md:w-1/3 gap-x-4 items-center ">
                                            Số lượng mỗi trang:
                                            <Select
                                                id="page-size"
                                                options={sizeOptions}
                                                onChange={onPageSizeChanged}
                                                defaultValue={{
                                                    value: "20",
                                                    label: "20",
                                                }}
                                                className="z-[9]"
                                            />
                                        </div>
                                        <div className="flex w-full justify-between sm:justify-end space-x-4">
                                            <div className="w-3/5 sm:w-auto">
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
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                stroke-width="2"
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
                                                            onFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="h-full w-3/7 sm:w-auto">
                                                <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                                    <MdOutlineRefresh />
                                                    <div onClick={handleRetryGrid}>
                                                        Tải lại
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4 ">
                                        <AgGridReact
                                            ref={integrationGridRef}
                                            rowData={integrationData}
                                            columnDefs={integrationColumnDefs}
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
                                            paginationNumberFormatter={
                                                paginationNumberFormatter
                                            }
                                            onGridReady={onIntegrationGridReady}
                                            onFirstDataRendered={
                                                onFirstDataRendered
                                            }
                                            suppressRowVirtualisation={true}
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

export default Integration;
