import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import Layout from "../../layouts/layout";
import usersApi from "../../api/userApi";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";
import "../../assets/styles/index.css";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

const sizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
];

var checkboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
};

function Users() {
    const gridRef = useRef();
    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: "Athlete",
            field: "athlete",
            minWidth: 170,
            maxHeight: 100,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        { field: "age" },
        { field: "country" },
        { field: "year" },
        { field: "date" },
        { field: "sport" },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" },
    ]);

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: "Group",
            minWidth: 170,
            field: "athlete",
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
            editable: true,
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

    const onGridReady = useCallback((params) => {
        fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    const onGridReady2 = useCallback((params) => {
        fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    const onFirstDataRendered = useCallback((params) => {
        gridRef.current.api.paginationGoToPage(4);
    }, []);

    const onPageSizeChanged = (selectedOption) => {
        // console.log("Hello World!");
        var value = selectedOption.label;
        gridRef.current.api.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const [users, setUsers] = useState([
        {
            name: "An Nguyen",
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRElC5salTwd8NsAM0VasrsPWGm8_ReyQykSkd8kLlPd4EDxHA6oe8__CAW1KnY9zAxlfY&usqp=CAU",
        },
    ]);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen xl:mb-4 mb-6 p-6 px-5 xl:p-12 xl:px-32 ">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/users"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Quản lý người dùng
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">
                        Quản lý người dùng
                    </div>

                    {/* Main content */}

                    <section className="bg-white rounded-lg border-2 mb-2 border-gray-200">
                        <Tabs size="lg">
                            <TabList className="">
                                <Tab>
                                    <div className="text-base font-medium">
                                        Danh sách người dùng
                                    </div>
                                </Tab>
                                <Tab>
                                    <div className="text-base font-medium">
                                        Phân quyền
                                    </div>
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Controller */}
                                    <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center">
                                        <div className="flex xl:w-1/3 md:w-1/3 gap-x-4 items-center ">
                                            Page Size:
                                            <Select
                                                id="page-size"
                                                options={sizeOptions}
                                                onChange={onPageSizeChanged}
                                                defaultValue={{
                                                    value: "10",
                                                    label: "10",
                                                }}
                                            />
                                        </div>
                                        <div className="flex w-full justify-end space-x-4">
                                            <div className="">
                                                <label
                                                    for="search"
                                                    className="mb-2 font-medium text-gray-900 sr-only"
                                                >
                                                    Search
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
                                                        placeholder="Search"
                                                        onInput={
                                                            onFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Link
                                                to="/users/create"
                                                className="h-full"
                                            >
                                                <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                                    <FaPlus />
                                                    <div className="">
                                                        Tạo User
                                                    </div>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4 ">
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={columnDefs}
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
                                            paginationPageSize={10}
                                            paginationNumberFormatter={
                                                paginationNumberFormatter
                                            }
                                            onGridReady={onGridReady}
                                            onFirstDataRendered={
                                                onFirstDataRendered
                                            }
                                        />
                                    </div>
                                </TabPanel>
                                            
                                {/* Phân quyền */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Controller */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex xl:w-1/3 md:w-1/3 gap-x-4 items-center ">
                                            Page Size:
                                            <Select
                                                id="page-size"
                                                options={sizeOptions}
                                                onChange={onPageSizeChanged}
                                                defaultValue={{
                                                    value: "10",
                                                    label: "10",
                                                }}
                                            />
                                        </div>
                                        <div className="flex w-full justify-end space-x-4">
                                            <div className="">
                                                <label
                                                    for="search"
                                                    className="mb-2 font-medium text-gray-900 sr-only"
                                                >
                                                    Search
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
                                                        placeholder="Search"
                                                        onInput={
                                                            onFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Link
                                                to="/users/roles"
                                                className="h-full"
                                            >
                                                <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                                    <FaPlus />
                                                    <div className="">
                                                        Tạo Quyền
                                                    </div>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4 ">
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={columnDefs}
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
                                            paginationPageSize={10}
                                            paginationNumberFormatter={
                                                paginationNumberFormatter
                                            }
                                            onGridReady={onGridReady2}
                                            onFirstDataRendered={
                                                onFirstDataRendered
                                            }
                                        />
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </section>
                    <div className="py-4"></div>
                </div>
            </div>
        </Layout>
    );
}

export default Users;
