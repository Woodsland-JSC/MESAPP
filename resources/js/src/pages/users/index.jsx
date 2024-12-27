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
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { set } from "date-fns";

const sizeOptions = [
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
];


function Users() {
    const { user,loading, setLoading } = useAppContext();
    const currentBranch = user?.branch || 0;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteUserOpen, onOpen: onDeleteUserOpen, onClose: onDeleteUserClose } = useDisclosure();
    
    const [selectedUser, setSelectedUser] = useState(null);

    const [deleteUserLoading, setDeleteUserLoading] = useState(false);
    const [deleteRoleLoading, setDeleteRoleLoading] = useState(false);

    const [modalParam, setModalParam] = useState(null);

    const handleOpenModal = (params) => {
        setModalParam(params);
        onOpen();
    };
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
                        {(params.data.last_name
                            ? params.data.last_name + " "
                            : "") +
                            (params.data.first_name
                                ? params.data.first_name
                                : "")}
                    </Link>
                );
            },
            minWidth: 210,
            maxHeight: 100,
        },
        {
            headerName: "Hidden Column",
            field: "hiddenField",
            minWidth: 210,
            hide: true,
            valueGetter: (params) =>
                (params.data.first_name ? params.data.first_name + " " : "") +
                (params.data.last_name ? params.data.last_name : ""),
        },
        {
            headerName: "Mã nhân viên",
            field: "employeeecode",
            minWidth: 210,
            hide: true,
            valueGetter: (params) =>
                params.data.username ? params.data.username + " " : "",
        },
        { headerName: "Email", field: "email", minWidth: 170 },
        {
            headerName: "Chi nhánh",
            field: "branch",
            minWidth: 210,
            filter: true,
            valueGetter: (params) =>
                params.data.branch === "1"
                    ? "Woodsland Thuận Hưng"
                    : params.data.branch === "3"
                    ? "Woodsland Tuyên Quang"
                    : params.data.branch === "4"
                    ? "Viforex"
                    : params.data.branch === null
                    ? ""
                    : "",
        },
        { headerName: "Nhà máy", field: "plant", minWidth: 130 },
        {
            headerName: "Nghiệp vụ",
            field: "branch",
            minWidth: 150,
            valueGetter: (params) =>
                params.data.plant === "TH"
                    ? "CBG"
                    : params.data.plant === "YS1"
                    ? "CBG"
                    : params.data.plant === "YS2"
                    ? "VCN"
                    : params.data.plant === "TB"
                    ? "CBG"
                    : params.data.plant === "CH"
                    ? "VCN"
                    : params.data.plant === "HG"
                    ? "VCN"
                    : params.data.plant === null
                    ? ""
                    : "",
        },
        {
            headerName: "SAP ID",
            minWidth: 120,
            valueGetter: (params) => params.data.sap_id || "",
        },
        {
            headerName: "Chặn",
            minWidth: 120,
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
                        <RiDeleteBin6Line
                            className="cursor-pointer text-red-700 text-[18px]"
                            // onClick={() => deleteUser(params.data)}
                            onClick={() => {
                                onDeleteUserOpen();
                                setSelectedUser(params.data);
                            }}
                        />
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
        },
        {
            headerName: "Tên role",
            minWidth: 300,
            cellRenderer: (params) => {
                return (
                    <Link to={"/roles/" + params.data.id}>
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
                        <Link to={"/roles/" + params.data.id}>
                            <LiaEditSolid className="cursor-pointer text-yellow-700 text-[20px]" />
                        </Link>
                        <RiDeleteBin6Line
                            className="cursor-pointer text-red-700 text-[18px]"
                            onClick={() => {
                                handleOpenModal(params.data.id);
                            }}
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

    // const onUserGridReady = useCallback(async () => {
    //     // const res = await usersApi.getAllUsers({ pageSize: 20, page: 1 });
    //     // console.log("currentBranch: ", currentBranch);
    //     showLoadingUser();
    //     const res = await usersApi.getAllUsers();
    //     setUserData(res);
    //     hideLoadingUser();
    // }, []);

    const onUserGridReady = useCallback(async (params) => {
        showLoadingUser();
        const res = await usersApi.getAllUsers();
        setUserData(res);
        hideLoadingUser();

        // Set default filter for branch
        const branchFilter = currentBranch ? { branch: { filterType: 'text', type: 'equals', filter: currentBranch } } : null;
        if (branchFilter) {
            params.api.setFilterModel(branchFilter);
        }
    }, [currentBranch]);

    const onRoleGridReady = useCallback(async () => {
        // const res = await usersApi.getAllUsers({ pageSize: 20, page: 1 });
        showLoadingRole();
        const res = await roleApi.getAllRole();
        setRoleData(
            res.map((item) => ({
                ...item,
                name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            }))
        );
        hideLoadingRole();
    }, []);

    const onFirstUserDataRendered = useCallback((params) => {
        userGridRef?.current?.api?.paginationGoToPage(0);
    }, []);

    const onFirstRoleDataRendered = useCallback((params) => {
        roleGridRef?.current?.api?.paginationGoToPage(0);
    }, []);

    const onUserPageSizeChanged = (selectedOption) => {
        var value = selectedOption.label;
        userGridRef?.current?.api?.paginationSetPageSize(Number(value));
    };

    const onRolePageSizeChanged = (selectedOption) => {
        var value = selectedOption.label;
        roleGridRef?.current?.api?.paginationSetPageSize(Number(value));
    };

    const onUserFilterTextBoxChanged = useCallback(() => {
        userGridRef?.current?.api?.setGridOption(
            "quickFilterText",
            document.getElementById("user-search").value
        );
    }, []);

    const onRoleFilterTextBoxChanged = useCallback(() => {
        roleGridRef?.current?.api?.setGridOption(
            "quickFilterText",
            document.getElementById("role-search").value
        );
    }, []);

    const showLoadingUser = useCallback(() => {
        userGridRef?.current?.api?.showLoadingOverlay();
    }, []);

    const showLoadingRole = useCallback(() => {
        roleGridRef?.current?.api?.showLoadingOverlay();
    }, []);

    const hideLoadingUser = useCallback(() => {
        userGridRef?.current?.api?.hideOverlay();
    }, []);

    const hideLoadingRole = useCallback(() => {
        roleGridRef?.current?.api?.hideOverlay();
    }, []);

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
    const deleteUser= async (userId) => {
        setDeleteUserLoading(true);
        try {
            const res = await usersApi.deleteUser(userId);
            toast.success("Xóa người dùng thành công.");
            setDeleteUserLoading(false);
            onDeleteUserClose();
            onUserGridReady();
        } catch (error) {
            toast.error("Không thể xóa người dùng. Hãy thử lại sau.");
            onDeleteUserClose();
            setDeleteUserLoading(false);
        }
    };

    const deleteRole = async (roleId) => {
        setDeleteRoleLoading(true);
        if(roleId == 1){
            toast.error("Bạn không thể xóa vai trò này.");
            setDeleteRoleLoading(false);
            onClose();
        } else {
            try {
                const res = await roleApi.deleteRole(roleId);
                toast.success("Xóa role thành công.");
                setDeleteRoleLoading(false);
                onClose();
                onRoleGridReady();
            } catch (error) {
                toast.error("Có lỗi xảy ra. Hãy thử lại sau.");
                onClose();
                setDeleteRoleLoading(false);
            }
        }
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
            <div className="flex justify-center bg-transparent h-screen ">
                {/* Section */}
                <div className="w-screen xl:mb-4 mb-6 p-6 px-5 xl:p-8 xl:px-32 ">
                    {/* Header */}
                    <div className="serif text-4xl font-bold mb-4">
                        Quản lý người dùng
                    </div>

                    {/* Main content */}
                    <section className="bg-white rounded-lg mb-2">
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
                                                onChange={onUserPageSizeChanged}
                                                defaultValue={{
                                                    value: "20",
                                                    label: "20",
                                                }}
                                                className="z-[9]"
                                            />
                                        </div>
                                        <div className="flex w-full justify-between sm:justify-end space-x-4">
                                            <div className="w-1/2 sm:w-auto">
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
                                                        id="user-search"
                                                        className="block w-[300px] p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg text-[14px] bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Nhập tên hoặc mã nhân viên"
                                                        onInput={
                                                            onUserFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Link
                                                to="/users/create"
                                                className="h-full w-5/12 sm:w-auto"
                                            >
                                                <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                                    <FaPlus className="w-3 h-3" />
                                                    <div className="text-[15px]">
                                                        Tạo User
                                                    </div>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine pb-4">
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
                                            pivotPanelShow={"always"}
                                            pagination={true}
                                            paginationPageSize={20}
                                            paginationNumberFormatter={
                                                paginationNumberFormatter
                                            }
                                            onGridReady={onUserGridReady}
                                            onFirstDataRendered={
                                                onFirstUserDataRendered
                                            }
                                            suppressRowVirtualisation={true}
                                            localeText={localeText}
                                            includeHiddenColumnsInQuickFilter={
                                                true
                                            }
                                            
                                        />
                                    </div>
                                    <Modal
                                        closeOnOverlayClick={false}
                                        isOpen={isDeleteUserOpen}
                                        onClose={onDeleteUserClose}
                                        isCentered
                                        size="sm"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                Xác nhận hành động
                                            </ModalHeader>
                                            <ModalBody pb={6}>
                                                Bạn chắc chắn muốn xóa người
                                                dùng{" "}
                                                <span className="font-semibold text-[#155979]">
                                                    {selectedUser?.last_name}{" "}
                                                    {selectedUser?.first_name}?
                                                </span>
                                            </ModalBody>

                                            <ModalFooter>
                                                <div className="flex w-full xl:justify-end lg:justify-end md:justify-end gap-x-3">
                                                    <button
                                                        onClick={
                                                            onDeleteUserClose
                                                        }
                                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                                                    >
                                                        Đóng
                                                    </button>
                                                    <button
                                                        className="flex justify-center items-center bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                                                        onClick={() =>
                                                            deleteUser(
                                                                selectedUser.id
                                                            )
                                                        }
                                                    >
                                                        {deleteUserLoading ? (
                                                            <div className="flex justify-center items-center space-x-4">
                                                                <Spinner
                                                                    size="sm"
                                                                    color="white"
                                                                />
                                                                <div>
                                                                    Đang tải
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            "Xác nhận"
                                                        )}
                                                    </button>
                                                </div>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </TabPanel>

                                {/* Phân quyền */}
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
                                                onChange={onRolePageSizeChanged}
                                                defaultValue={{
                                                    value: "20",
                                                    label: "20",
                                                }}
                                            />
                                        </div>
                                        <div className="flex w-full justify-between sm:justify-end space-x-4">
                                            <div className="w-1/2 sm:w-auto">
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
                                                        id="role-search"
                                                        className="block w-[300px] p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
                                                        placeholder="Tìm kiếm tên Role"
                                                        onInput={
                                                            onRoleFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Link
                                                to="/roles/create"
                                                className="h-full w-5/12 sm:w-auto"
                                            >
                                                <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                                    <FaPlus className="w-3 h-3" />
                                                    <div className="text-[15px]">
                                                        Tạo Role
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
                                            pivotPanelShow={"always"}
                                            pagination={true}
                                            paginationPageSize={20}
                                            paginationNumberFormatter={
                                                paginationNumberFormatter
                                            }
                                            onGridReady={onRoleGridReady}
                                            onFirstDataRendered={
                                                onFirstRoleDataRendered
                                            }
                                            localeText={localeText}
                                        />
                                    </div>
                                </TabPanel>
                                <Modal
                                    closeOnOverlayClick={false}
                                    isOpen={isOpen}
                                    onClose={onClose}
                                    isCentered
                                    size="sm"
                                >
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader>
                                            Bạn chắc chắn muốn xóa role?
                                        </ModalHeader>
                                        <ModalBody pb={6}>
                                            Sau khi bấm xác nhận sẽ không thể
                                            thu hồi hành động.
                                        </ModalBody>

                                        <ModalFooter>
                                            <div className="flex w-full xl:justify-end lg:justify-end md:justify-end gap-x-3">
                                                <button
                                                    onClick={onClose}
                                                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                                                >
                                                    Đóng
                                                </button>
                                                <button
                                                    className="flex justify-center items-center bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                                                    onClick={() =>
                                                        deleteRole(modalParam)
                                                    }
                                                >
                                                    {deleteRoleLoading ? (
                                                        <div className="flex justify-center items-center space-x-4">
                                                            <Spinner
                                                                size="sm"
                                                                color="white"
                                                            />
                                                            <div>Đang tải</div>
                                                        </div>
                                                    ) : (
                                                        "Xác nhận"
                                                    )}
                                                </button>
                                            </div>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
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
