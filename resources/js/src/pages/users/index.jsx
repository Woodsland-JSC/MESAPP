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

function Users() {
    const gridRef = useRef();
    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: "athlete" },
        { field: "country" },
        { field: "sport" },
        { field: "age", minWidth: 100 },
        { field: "gold", minWidth: 100 },
        { field: "silver", minWidth: 100 },
        { field: "bronze", minWidth: 100 },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setQuickFilter(
            document.getElementById("filter-text-box").value
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
    // }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen mt-[70px] p-12 px-40 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            href="#"
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
                        <div className="example-header">
                            <span>Search:</span>
                            <input
                                type="text"
                                id="filter-text-box"
                                placeholder="Search..."
                                // onInput={onFilterTextBoxChanged}
                            />
                        </div>
                        <div style={gridStyle} className="ag-theme-alpine">
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                onGridReady={onGridReady}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default Users;
