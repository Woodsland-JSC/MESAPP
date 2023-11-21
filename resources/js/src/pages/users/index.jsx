import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";
import { dateToDateTime } from "../../utils/convertDatetime";
import { LiaEditSolid } from "react-icons/lia";
import { RiDeleteBin6Line } from "react-icons/ri";
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
import usersApi from "../../api/userApi";
import roleApi from "../../api/roleApi";
import useAppContext from "../../store/AppContext";
import Loader from "../../components/Loader";
import AG_GRID_LOCALE_VI from "../../utils/locale.vi";

const sizeOptions = [
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
    const { loading, setLoading } = useAppContext();

    const userTab = useRef();
    const roleTab = useRef();
    const userGridRef = useRef();
    const roleGridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const [userData, setUserData] = useState([]);

    const [userColumnDefs, setUserColumnDefs] = useState([
        {
            headerName: "Họ tên",
            cellRenderer: (params) => {
                return (
                    <Link to={"/user/" + params.data.id}>
                        {(params.data.first_name
                            ? params.data.first_name + " "
                            : "") +
                            (params.data.last_name
                                ? params.data.last_name
                                : "")}
                    </Link>
                );
            },
            minWidth: 210,
            maxHeight: 100,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        {
            headerName: "Giới tính",
            valueGetter: function (params) {
                return params.data.gender == "male"
                    ? "Nam"
                    : params.data.gender == "female"
                    ? "Nữ"
                    : "";
            },
        },
        { headerName: "Email", field: "email", minWidth: 170 },
        { headerName: "Vai trò", field: "role" },
        { headerName: "Plant", field: "plant" },
        {
            headerName: "Ngày tạo",
            valueGetter: function (params) {
                return dateToDateTime(params.data.created_at) || "";
            },
            minWidth: 130,
        },
        {
            headerName: "Chặn",
            cellRenderer: (params) => {
                return (
                    <Switch
                        size="md"
                        colorScheme="red"
                        isChecked={params.data.is_block}
                        onChange={(e) => toggleBlockUser(e, params.data)}
                    />
                );
            },
        },
        {
            headerName: "Hành động",
            cellRenderer: (params) => {
                return (
                    <div className="flex gap-2 items-center h-full">
                        <Link to={"/user/" + params.data.id}>
                            <LiaEditSolid className="cursor-pointer text-yellow-700 text-[20px]" />
                        </Link>
                        {/* <RiDeleteBin6Line
                            className="cursor-pointer text-red-700 text-[18px]"
                            onClick={() => deleteUser(params.data)}
                        /> */}
                    </div>
                );
            },
        },
    ]);

    const [roleData, setRoleData] = useState([]);

    const [roleColumnDefs, setRoleColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.data.id;
            },
            maxWidth: 100,
            maxHeight: 100,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        {
            headerName: "Tên role",
            minWidth: 100,
            cellRenderer: (params) => {
                return (
                    <Link to={"/role/" + params.data.id}>
                        {params.data.name}
                    </Link>
                );
            },
        },
        {
            headerName: "Ngày tạo",
            valueGetter: function (params) {
                return dateToDateTime(params.data.created_at) || "";
            },
            minWidth: 150,
        },
        {
            headerName: "Ngày cập nhật",
            valueGetter: function (params) {
                return dateToDateTime(params.data.updated_at) || "";
            },
            minWidth: 150,
        },
        {
            headerName: "Hành động",
            cellRenderer: (params) => {
                return (
                    <div className="flex gap-2 items-center h-full">
                        <Link to={"/role/" + params.data.id}>
                            <LiaEditSolid className="cursor-pointer text-yellow-700 text-[20px]" />
                        </Link>
                        <RiDeleteBin6Line
                            className="cursor-pointer text-red-700 text-[18px]"
                            onClick={() => deleteRole(params.data)}
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

    const onUserGridReady = useCallback(async () => {
        // const res = await usersApi.getAllUsers({ pageSize: 20, page: 1 });
        showLoadingUser();
        const res = await usersApi.getAllUsers();
        setUserData(res);
        hideLoadingUser();
    }, []);

    const onRoleGridReady = useCallback(async () => {
        // const res = await usersApi.getAllUsers({ pageSize: 20, page: 1 });
        showLoadingRole();
        const res = await roleApi.getAllRole();
        setRoleData(res);
        hideLoadingRole();
    }, []);

    const onFirstDataRendered = useCallback((params) => {
        userGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onPageSizeChanged = (selectedOption) => {
        var value = selectedOption.label;
        userGridRef.current.api.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = useCallback(() => {
        userGridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const showLoadingUser = useCallback(() => {
        userGridRef.current.api.showLoadingOverlay();
    }, []);

    const showLoadingRole = useCallback(() => {
        roleGridRef.current.api.showLoadingOverlay();
    }, []);

    const hideLoadingRole = useCallback(() => {
        roleGridRef.current.api.hideOverlay();
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

    const toggleBlockUser = async (e, data) => {
        try {
            const res = await usersApi.blockUser(data.id);
            setUserData((prev) =>
                prev.map((item) =>
                    item.id == data.id
                        ? { ...item, is_block: item.is_block == 0 ? 1 : 0 }
                        : item
                )
            );
            if (!e.target.checked) toast.success("Chặn người dùng thành công.");
            else toast.success("Bỏ chặn người dùng thành công.");
        } catch (error) {
            console.error(error);
        }
    };

    // Role Actions
    const deleteRole = async (data) => {
        console.log("Xoá phân quyền");
    };

    const handleTabClick = (isRoleTab) => {
        const params = new URLSearchParams(window.location.search);

        if (isRoleTab) {
            params.set("roletab", "true");
        } else {
            params.delete("roletab");
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
    };

    useEffect(() => {
        document.title = "Woodsland - Quản lý người dùng";
        const params = new URLSearchParams(window.location.search);

        if (params.get("roletab") === "true") {
            setTimeout(() => {
                roleTab.current.click();
            });
        }

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
                                <Tab
                                    ref={userTab}
                                    onClick={() => handleTabClick(false)}
                                >
                                    <div className="text-base font-medium">
                                        Danh sách người dùng
                                    </div>
                                </Tab>
                                <Tab
                                    ref={roleTab}
                                    onClick={() => handleTabClick(true)}
                                >
                                    <div className="text-base font-medium">
                                        Phân quyền
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
                                            ref={userGridRef}
                                            rowData={userData}
                                            columnDefs={userColumnDefs}
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
                                            onGridReady={onUserGridReady}
                                            onFirstDataRendered={
                                                onFirstDataRendered
                                            }
                                            suppressRowVirtualisation={true}
                                            localeText={localeText}
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
                                            Số lượng mỗi trang:
                                            <Select
                                                id="page-size"
                                                options={sizeOptions}
                                                onChange={onPageSizeChanged}
                                                defaultValue={{
                                                    value: "20",
                                                    label: "20",
                                                }}
                                            />
                                        </div>
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
                                            <Link
                                                to="/roles/create"
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
                                            ref={roleGridRef}
                                            rowData={roleData}
                                            columnDefs={roleColumnDefs}
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
                                            onGridReady={onRoleGridReady}
                                            onFirstDataRendered={
                                                onFirstDataRendered
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

export default Users;
