import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaFilePen } from "react-icons/fa6";
import { IoIosArrowBack, IoMdArrowRoundBack } from "react-icons/io";
import { danhSachNhaMayCBG, getWhHTCBG } from "../../../api/MasterDataApi";
import toast from "react-hot-toast";
import useAppContext from "../../../store/AppContext";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from 'react-select';
import { getItemsByFactory } from "../../../api/oitw.api";
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

const PrintInventoryPosting = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const gridRef = useRef();

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouse, setWarehouse] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [gridApi, setGridApi] = useState(null);
    const [data, setData] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenItem, onOpen: onOpenItem, onClose: onCloseItem } = useDisclosure();
    const [searchBarCode, setSearchBarCode] = useState("");
    const [rowSelected, setRowSelected] = useState(null);

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

    const clearData = () => {
        setData([]);
    }

    const colDefs = useMemo(() => {
        return [
            {
                headerName: "Mã sản phẩm",
                field: "CodeBars",
                filter: true,
                width: 300,
                onCellClicked: (params) => {
                    if (params.data) {
                        setRowSelected(params);
                        onOpenItem();
                    }
                },
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

    useEffect(() => {
        if (warehouse) getItems();
    }, [warehouse])

    useEffect(() => {
        getWarehouses();
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

                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4 gap-x-2 gap-y-2 items-center">

                        {user?.role == 1 && (
                            <div className="md:w-1/6 w-full">
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
                        <div className="md:w-2/6 w-full">
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
                    </div>

                    {
                        items.length > 0 ? (
                            <>
                                <div className="">
                                    <div className="block md:hidden">
                                        <Input bg={"#FFFFFF"} borderColor={"gray.300"} placeholder="Nhập mã ..." onChange={e => setSearchBarCode(e.target.value)} />
                                    </div>
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
                                            rowData={items.filter(i => i.CodeBars.includes(searchBarCode))}
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
                            Xác nhận kiểm kê kho {`${warehouse?.label} - ${warehouse?.value}`}
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
                            <Button bg="#155979" color={"#FFFFFF"} _hover={{ bg: "#155979" }} onClick={onConfirm} ml={3}>
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
                            Xác nhận kiểm kê cho mã {rowSelected.data.CodeBars}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <div className="mb-2">
                                <span>Tồn trong kho</span>
                                <NumberInput
                                    className="bg-gray-100"
                                    value={Number(rowSelected.data.OnHand)}
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
                                        rowSelected.node.setDataValue("quantity", value);
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
                            <Button onClick={handleSave} ml={3} className="chakra-wl-confirm-btn">
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>}
        </Layout>
    )
}

export default PrintInventoryPosting;