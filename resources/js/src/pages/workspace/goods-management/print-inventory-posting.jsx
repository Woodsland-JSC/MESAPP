import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaFilePen } from "react-icons/fa6";
import { IoIosArrowBack, IoMdArrowRoundBack, IoIosEye } from "react-icons/io";
import { danhSachNhaMayCBG, getWhHTCBG } from "../../../api/MasterDataApi";
import toast from "react-hot-toast";
import useAppContext from "../../../store/AppContext";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from 'react-select';
import { findItemByWh, getItemsByFactory } from "../../../api/oitw.api";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from '../../../utils/locale.vi';
import { AgGridReact } from "ag-grid-react";
import {
    NumberInput,
    NumberInputField,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Input
} from "@chakra-ui/react";
import { inventoryPostingItems } from "../../../api/inventory-posting.api";
import Swal from "sweetalert2";
import {getTeamCdoanHT} from "../../../api/ORSCApi";

const PrintInventoryPosting = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const gridRef = useRef();

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouse, setWarehouse] = useState(null);
    const [items, setItems] = useState([]);
    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [gridApi, setGridApi] = useState(null);
    const [data, setData] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenItem, onOpen: onOpenItem, onClose: onCloseItem } = useDisclosure();
    const { isOpen: isOpenAddItem, onOpen: onOpenAddItem, onClose: onCloseAddItem } = useDisclosure();
    const [searchBarCode, setSearchBarCode] = useState("");
    const [rowSelected, setRowSelected] = useState(null);
    const [itemAdded, setItemAdded] = useState({
        code: "",
        error: "",
    });

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const getFactoryCBG = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            let options = [];
            res.data.factories.forEach(item => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            });
            setFactories(options);
        } catch (error) {
            toast.error('Lấy danh sách nhà máy có lỗi.');
        }
    }

    const getWarehouses = async () => {
        try {
            let fac = factory ? factory.value : user?.plant;
            let res = await getWhHTCBG(fac);

            let options = [];
            res.data.warehouses.forEach(item => {
                options.push({
                    label: `${item.WhsCode} - ${item.WhsName}`,
                    value: item.WhsCode
                })
            });

            setWarehouses(options);
        } catch (error) {
            toast.error('Lấy danh sách kho có lỗi.');
        }
    }

    const getItems = async () => {
        try {
            setIsLoading(true)
            let res = await getItemsByFactory(warehouse.value);
            setItems(res.items.map(item => ({ ...item, quantity: "" })));
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            toast.error('Lấy danh sách Items có lỗi.');
        }
    }

    const handleSave = async () => {
        const rows = [];
        const current = [];

        gridApi.forEachNode(node => {
            if (node.data.quantity !== "" && node.data.quantity != null) {
                rows.push({ ...node.data });
            }
            current.push({ ...node.data });
        });

        if (rows.length == 0) {
            toast.error("Chưa có dữ liệu.");
            return
        }

        if(!team){
            toast.error("Vui lòng chọn tổ.");
            return;
        }

        setData(rows);
        setItems(current);
        onOpen();
    }

    const onConfirm = async () => {
        if (data.length == 0) {
            toast.error("Chưa có dữ liệu.");
            return
        }

        try {
            setIsLoading(true);
            await inventoryPostingItems({
                data: data,
                whCode: warehouse.value,
                team: team.value
            });

            getItems();
            clearData();
            onClose();
            setIsLoading(false);
            onCloseItem();
            setRowSelected(null);

            toast.success("Điều chỉnh tồn thành công.");
        } catch (error) {
            toast.error("Điều chỉnh tồn có lỗi.");
            setIsLoading(false);
        }
    }

    const handleSaveItem = async () => {
        if (!rowSelected) { return }
        Swal.fire({
            title: "Xác nhận cập nhật",
            text: "Xác nhận cập nhật số lượng tồn thực tế cho vật tư này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const rows = [];

                rows.push({ ...rowSelected });

                if (rows.length == 0) {
                    toast.error("Chưa có dữ liệu.");
                    return
                }

                try {
                    setIsLoading(true);
                    await inventoryPostingItems({
                        data: rows,
                        whCode: warehouse.value
                    });

                    getItems();
                    clearData();
                    onClose();
                    setIsLoading(false);
                    onCloseItem();
                    setRowSelected(null);

                    toast.success("Điều chỉnh tồn thành công.");
                } catch (error) {
                    toast.error("Điều chỉnh tồn có lỗi.");
                    setIsLoading(false);
                }
            }
        });
    }

    const clearData = () => {
        setData([]);
    }

    const colDefs = useMemo(() => {
        return [
            {
                headerName: "Codebars",
                field: "CodeBars",
                filter: true,
                width: 300,
                pinned: 'left',
            },
            {
                headerName: "Mã sản phẩm",
                field: "ItemCode",
                filter: true,
                width: 300,
                pinned: 'left',
            },
            {
                headerName: "Tên sản phẩm",
                field: "ItemName",
                filter: true,
                width: 300
            },
            {
                headerName: "Tồn trong kho",
                field: "OnHand",
                filter: true,
                width: 200,
                valueFormatter: (params) => {
                    if (params.node.id == 'rowGroupFooter_ROOT_NODE_ID' || params.node.group) return "";
                    if (params) {
                        return Number(params.value)
                    }
                    return ""
                }
            },
            {
                headerName: "Tồn thực tế",
                field: "quantity",
                width: 200,
                cellRenderer: (params) => {
                    if (params.node.id == 'rowGroupFooter_ROOT_NODE_ID' || params.node.group) return "";

                    return (
                        <NumberInput
                            min={0}
                            className=""
                            onChange={value => {
                                params.node.setDataValue(params.colDef.field, value);
                            }}
                            value={params.node.data.quantity}
                        >
                            <NumberInputField />
                        </NumberInput>
                    )
                }
            }
        ]
    }, [])

    const onConfirmAddItem = async () => {
        if(itemAdded.code == '' || !itemAdded.code) {
            toast.error("Vui lòng nhập mã hoặc barcode vật tư.");
            return;
        }

        let item = items.find(i => i.CodeBars === itemAdded.code || i.ItemCode === itemAdded.code);

        if(item) {
            toast.error("Mã vật tư đã có trong danh sách.");
            return;
        }

        try {
            const response = await findItemByWh(warehouse.value, itemAdded.code);

            if(!response.data) {
                toast.error("Không tìm thấy mã vật tư.");
                return
            }
            
            let item = response.data;
            item.quantity = "";
            setItems([...items, item]);
            toast.success("Thêm vật tư thành công.");
            onCloseAddItem();
            setItemAdded({
                code: "",
                error: "",
            });
        } catch (error) {
            toast.error("Tìm vật tư có lỗi.");
            console.log(error);
        }
    }

    const getTeamsHT = async (factory) => {
        try {
            let res = await getTeamCdoanHT(factory);
            setTeams(res.map(team => (
                {
                    label: `${team.Name}`,
                    value: team.Code
                }
            )))
        } catch (error) {
            toast.error('Lấy danh sách tổ có lỗi.');
        }
    }

    useEffect(() => {
        if (warehouse) getItems();
    }, [warehouse])

    useEffect(() => {
        getWarehouses();
        if(factory){
            getTeamsHT(factory.value)
        }
    }, [factory])

    useEffect(() => {
        getFactoryCBG();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-20 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/workspace?tab=goods-management`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    <div className="flex space-x-4 mb-4 justify-between">
                        <div className="serif text-xl md:text-4xl font-bold">Kiểm kê vật tư sơn</div>
                        <div className="md:block hidden">
                            {
                                gridApi && items.length > 0 && (
                                    <button
                                        onClick={handleSave}
                                        type="button"
                                        className={`mt-0 self-end flex cursor-pointer items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                    >
                                        <FaFilePen /> Lưu
                                    </button>
                                )
                            }
                        </div>
                    </div>

                    <div className="flex justify-between bg-white mb-4 p-4 pt-3">
                        <div className="w-[75%] flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0  rounded-xl  gap-x-2 gap-y-2 items-center">
                            {user?.role == 1 && (
                                <div className="md:w-1/3 w-full">
                                    <label className=" text-sm font-medium text-gray-900">
                                        Nhà máy
                                    </label>
                                    <Select
                                        options={factories}
                                        placeholder="Chọn nhà máy"
                                        className="w-full mt-2 cursor-pointer"
                                        onChange={(factory) => {
                                            setFactory(factory);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="md:w-1/3 w-full">
                                <label className=" text-sm font-medium text-gray-900">
                                    Kho
                                </label>
                                <Select
                                    options={warehouses}
                                    placeholder="Chọn kho"
                                    className="w-full mt-2 cursor-pointer"
                                    onChange={(warehouse) => {
                                        setWarehouse(warehouse);
                                    }}
                                />
                            </div>
                            <div className="md:w-1/3 w-full">
                                <label className=" text-sm font-medium text-gray-900">
                                    Tổ
                                </label>
                                <Select
                                    options={teams}
                                    placeholder="Chọn tổ"
                                    className="w-full mt-2 cursor-pointer"
                                    onChange={(team) => {
                                        setTeam(team);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-[25%] md:flex hidden md:items-center md:justify-end">
                            <button
                                onClick={onOpenAddItem}
                                type="button"
                                className={`mt-0 cursor-pointer items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94]  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                            >
                                Thêm mới
                            </button>
                        </div>
                    </div>

                    {
                        items.length > 0 ? (
                            <>
                                <div className="hidden md:block">

                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2"
                                        style={{
                                            height: 630,
                                            fontSize: 16,
                                        }}
                                        id="app-ag-grid"
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={items}
                                            columnDefs={colDefs}
                                            groupDisplayType={"multipleColumns"}
                                            getRowStyle={(params) => {
                                                return { background: "#ffffff" };
                                            }}
                                            grandTotalRow={"bottom"}
                                            localeText={AG_GRID_LOCALE_VI}
                                            onGridReady={onGridReady}
                                        />
                                    </div>
                                </div>

                                <div className="block md:hidden">
                                    <div className="">
                                        <Input bg={"#FFFFFF"} borderColor={"gray.300"} placeholder="Tìm theo mã, tên sản phẩm ..." onChange={e => setSearchBarCode(e.target.value)} />
                                        <div className="mt-3">
                                            {
                                                items.filter(i => {
                                                    if (!searchBarCode) return i;
                                                    if (
                                                        i?.CodeBars && i?.CodeBars?.toLowerCase().includes(searchBarCode?.toLowerCase()) ||
                                                        i?.ItemName && i?.ItemName?.toLowerCase().includes(searchBarCode?.toLowerCase()) ||
                                                        i?.ItemCode && i?.ItemCode?.toLowerCase().includes(searchBarCode?.toLowerCase())
                                                    ) return i;
                                                }).map((item, index) => (
                                                    <div className="relative bg-[#F9FAFB] border-2 border-[#76929e] rounded-xl w-[100%] mb-2" key={index} >
                                                        <div className="absolute -top-1 -right-2.5 bg-gray-800 text-white w-7 h-7 items-center justify-center rounded-full cursor-pointer active:scale-[.84] active:duration-75 transition-all hidden">
                                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="text-white " height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-col justify-center font-semibold p-4 py-3 border-b border-gray-200 bg-[#d6e4eb] w-full h-[80px] rounded-t-xl">
                                                            <div className="text-md mb-1">{item.ItemName}</div>
                                                            <div className="w-full flex items-center">
                                                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="text-[#17506B] w-2 h-2 mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M256 23.05C127.5 23.05 23.05 127.5 23.05 256S127.5 488.9 256 488.9 488.9 384.5 488.9 256 384.5 23.05 256 23.05z"></path>
                                                                </svg>
                                                                <span className="w-full">{item.ItemCode}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-600 space-y-1 py-3 p-4 text-sm">
                                                            <div className="">SL: {Number(item.OnHand)} ({item.IUoMEntry} {item.UomCode})</div>
                                                            <div className="">Mã: {item?.CodeBars}</div>
                                                        </div>
                                                        <div className="border border-t">
                                                            <button onClick={() => {
                                                                setRowSelected(item);
                                                                onOpenItem();
                                                            }} type="button" className="flex items-center justify-center font-medium rounded-xl  w-full px-5 py-2.5 text-center gap-x-2 ">
                                                                Cập nhật
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            (items.length == 0 && warehouse) && (
                                <div className="mt-4 bg-[#C2C2CB] items-center justify-center text-center p-2 px-4 pr-1 rounded-lg w-full">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )
                        )
                    }
                </div>
            </div>

            {isLoading && <Loader />}

            <AlertDialog
                isOpen={isOpen}
                onClose={onClose}
                size={'2xl'}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='md' fontWeight='bold'>
                            Xác nhận kiểm kê kho {`${warehouse?.label} - ${warehouse?.value}`} (Tổ {team?.label} - {team?.value})
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {
                                data.map((item, index) => (
                                    <div key={index}>
                                        <span className="text-green-600 font-bold">{item.ItemCode} ({item.CodeBars})</span> -
                                        Số lượng tồn <span className="text-green-600 font-bold">{Number(item.OnHand)}</span> -
                                        Số lượng sau kiểm kê <span className="text-green-600 font-bold">{item.quantity}</span>
                                    </div>
                                ))
                            }
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => {
                                onClose();
                                setData([]);
                            }}>
                                Hủy
                            </Button>
                            <Button className="chakra-wl-confirm-btn" onClick={onConfirm} ml={3}>
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {rowSelected && <AlertDialog
                isOpen={isOpenItem}
                onClose={onCloseItem}
                size={'xl'}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='md' fontWeight='bold'>
                            Xác nhận kiểm kê cho mã {rowSelected.CodeBars}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <div className="mb-2">
                                <span>Tồn trong kho</span>
                                <NumberInput
                                    className="bg-gray-100"
                                    value={Number(rowSelected.OnHand)}
                                    isReadOnly={true}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </div>
                            <div>
                                <span>Tồn thực tế</span>
                                <NumberInput
                                    min={0}
                                    className=""
                                    onChange={value => {
                                        setRowSelected({ ...rowSelected, quantity: value });
                                    }}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </div>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => {
                                onCloseItem();
                                setData([]);
                                setRowSelected(null);
                            }}>
                                Hủy
                            </Button>
                            <Button onClick={handleSaveItem} ml={3} className="chakra-wl-confirm-btn">
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>}

            <AlertDialog
                isOpen={isOpenAddItem}
                onClose={onCloseAddItem}
                size={'2xl'}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='md' fontWeight='bold'>
                            Thêm vật tư kiểm kê
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Input placeholder="Tìm theo barcode hoặc mã sản phẩm" className="mb-2" onChange={e => setItemAdded({
                                    ...itemAdded,
                                    code: e.target.value
                                })}
                            />
                            {
                                itemAdded.error && (<span className="mt-2 text-red-600">{itemAdded.error}</span>)
                            }
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => {
                                onCloseAddItem();
                                setItemAdded({
                                    code: "",
                                    error: "",
                                });
                            }}>
                                Hủy
                            </Button>
                            <Button className="chakra-wl-confirm-btn" onClick={onConfirmAddItem} ml={3}>
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Layout>
    )
}

export default PrintInventoryPosting;