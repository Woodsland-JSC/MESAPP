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

    // useEffect(async () => {
    // 	try {
    // 		const res = await usersApi.getAllUsers();
    // 		console.log("Danh sách người dùng: ", res);
    // 	} catch (error) {
    // 		console.error(error);
    // 	}
    // }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen md:py-12 p-4 md:px-8 lg:px-40 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/workspace/kiln"
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
                    <div className="text-3xl font-bold mb-12">
                        Quản lý người dùng
                    </div>
                    {/* Main content */}
                    <section style={containerStyle}>
                        <div className="flex justify-between my-4">
                            <div className="md:w-1/4 w-1/2">
                                <label
                                    for="search"
                                    className="mb-2 text-sm font-medium text-gray-900 sr-only"
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
                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search"
                                        onInput={onFilterTextBoxChanged}
                                        required
                                    />
                                </div>
                            </div>
                            <Link
                                to="/users/create"
                                className="flex items-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-2/5 text-left sm:w-auto px-5 py-2.5 sm:text-center gap-x-2"
                            >
                                Tạo User
                                <FaPlus />
                            </Link>
                        </div>
                        <div className="flex w-2/3 md:w-1/3 gap-4 items-center mb-3">
                            Page Size:
                            <Select
                                id="page-size"
                                options={sizeOptions}
                                onChange={onPageSizeChanged}
                                defaultValue={{ value: "10", label: "10" }}
                            />
                        </div>
                        <div style={gridStyle} className="ag-theme-alpine">
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                autoGroupColumnDef={autoGroupColumnDef}
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
                                onFirstDataRendered={onFirstDataRendered}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default Users;
