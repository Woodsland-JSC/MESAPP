import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import { useEffect, useRef, useState } from "react";
import Select from 'react-select';
import { Box, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text, useDisclosure } from "@chakra-ui/react";
import { danhSachNhaMayCBG, getWhHTCBG } from "../../../api/MasterDataApi";
import { IoIosArrowBack, IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import { getItemsSFByWh } from "../../../api/oitw.api";
import { AgGridReact } from "ag-grid-react";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from '../../../utils/locale.vi';
import { getStepsQT } from "../../../api/qt-son.api";
import { FaCircleRight } from "react-icons/fa6";

const PrintWorkflow = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const gridRef = useRef();

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouse, setWarehouse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [dataQT, setDataQT] = useState([]);
    const [items, setItems] = useState([]);
    const [itemSelected, setItemSelected] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [itemQt, setItemQt] = useState({
        quantity: ''
    });

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
            let res = await getItemsSFByWh(warehouse.value);
            setItems(res.items)
            setIsLoading(false)
        } catch (error) {
            console.log(error);
            setIsLoading(false)
            toast.error('Lấy danh sách Items có lỗi.');
        }
    }

    const colDefs = [
        {
            headerName: "Mã sản phẩm",
            field: "ItemCode",
            filter: true,
            width: 250,
            cellRenderer: (params) => {
                if (params.node.id == 'rowGroupFooter_ROOT_NODE_ID' || params.node.group) return "";

                return (
                    <div className="cursor-pointer" onClick={e => setItemSelected(params.data)}>
                        {params.value}
                    </div>
                )
            }
        },
        {
            headerName: "Tên sản phẩm",
            field: "ItemName",
            filter: true,
            width: 500
        },
        {
            headerName: "Kho",
            field: "WhsCode",
            filter: true,
            width: 200
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
        }
    ]

    const loadItemQT = async () => {
        try {
            setIsLoading(true);
            let res = await getStepsQT(itemSelected.ItemCode);
            setDataQT(res.data.map(item => ({
                label: `${item.QtName} - ${item.CDOAN} - Bước ${item.Step}`,
                value: `${item.ItemCode}-${item.CDOAN}-${item.Step}`,
                ...item
            })));
            setIsLoading(false);
            onOpen();
        } catch (error) {
            setIsLoading(false);
            toast.error(error.response.data.message ?? 'Lấy dữ liệu item có lỗi');
        }
    }

    const onCloseQt = () => {
        onClose();
        setItemSelected(null);
        setDataQT([]);
    }

    const clearDataChangeFactory = () => {
        setItems([]);
        setWarehouses([]);
        setWarehouse(null);
    }

    const addItem = () => {
        if (!itemQt.quantity) {
            toast.error('Vui lòng nhập số lượng.');
            return;
        }

        if (!itemQt.ItemCode || !itemQt.CDOAN || !itemQt.QtCode) {
            toast.error('Vui lòng chọn công đoạn');
            return;
        }

        let find = data.some(item => item.ItemCode == itemQt.ItemCode && item.CDOAN == itemQt.CDOAN && item.Step == itemQt.Step);

        if (find) {
            toast.error('Công đoạn và bước hiện tại đã được tạo.');
            return;
        }        

        let _data = [...data, itemQt];

        setData(_data);
        setItemQt(pre => ({
            quantity: '',
            ...pre
        }));
    }

    const removeItem = (index) => {
        let _data = [...data];
        _data = _data.filter((_, i) => i != index);
        setData(_data);
    }

    useEffect(() => {
        if (itemSelected) loadItemQT();
    }, [itemSelected])

    useEffect(() => {
        if (warehouse) getItems();
    }, [warehouse])

    useEffect(() => {
        clearDataChangeFactory();
        getWarehouses();
    }, [factory])

    useEffect(() => {
        getFactoryCBG();
    }, []);

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
                        <div className="serif text-xl md:text-4xl font-bold">Quy trình sơn</div>
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

            {
                itemSelected && (
                    <Modal
                        isCentered
                        isOpen={isOpen}
                        size="full"
                        onClose={onCloseQt}
                        scrollBehavior="inside"
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                        <ModalContent h="100vh" display="flex" flexDirection="column">
                            <ModalHeader className="!p-2.5 text-center">
                                <h1 className="pl-4 text-xl lg:text-2xl serif font-bold ">
                                    Quy trình sơn tại công đoạn
                                </h1>
                            </ModalHeader>
                            <div className="border-b-2 border-gray-200"></div>
                            <ModalBody px={0} py={0} flex="1" overflowY="auto">
                                <div className="flex flex-col pb-4 bg-[#FAFAFA] h-full">
                                    <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[80%] space-y-3 ">
                                        <div className="flex flex-col md:flex-row justify-between pt-2 items-center xl:px-0 md:px-0 lg:px-0 px-3">
                                            <div className="flex flex-col  w-full">
                                                <label className="font-medium">
                                                    Sản phẩm/Chi tiết
                                                </label>
                                                <span className="text-[#17506B] text-2xl font-bold">
                                                    {
                                                        itemSelected.ItemName
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between py-3 border-2 divide-x-2 border-[#DADADA] shadow-sm rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-3 bg-white">
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Mã SP
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {itemSelected.ItemCode}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400 ">
                                                    Kho
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {itemSelected.WhsCode}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Tồn kho
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {Number(itemSelected.OnHand)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex justify-between pb-1 ">
                                                <div className="flex items-center space-x-2">
                                                    <FaCircleRight className="w-7 h-7 text-blue-700" />
                                                    <div className="font-semibold text-lg ">
                                                        Nhập số lượng công đoạn
                                                    </div>
                                                </div>
                                                <div>
                                                    <Button colorScheme="green" onClick={addItem}>
                                                        Lưu
                                                    </Button>
                                                </div>
                                            </div>

                                            <Box className="px-0">
                                                <label className="mt-6 font-semibold">
                                                    Chọn công đoạn
                                                </label>
                                                <Select
                                                    options={dataQT}
                                                    placeholder="Chọn công đoạn"
                                                    className="w-full mt-2 cursor-pointer"
                                                    onChange={(cd) => {
                                                        setItemQt(pre => ({ ...pre, ...cd }));
                                                    }}
                                                />
                                            </Box>
                                            <Box className="px-0">
                                                <label className="mt-6 font-semibold">
                                                    Số lượng
                                                </label>
                                                <NumberInput
                                                    step={1}
                                                    min={0}
                                                    className="mt-2 mb-2"
                                                    onChange={(value) => {
                                                        setItemQt(pre => ({ ...pre, quantity: value }));
                                                    }}
                                                >
                                                    <NumberInputField />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </Box>
                                        </div>
                                        {
                                            data.length > 0 && (
                                                <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                                    <div className="flex justify-between pb-1 ">
                                                        <div className="flex items-center space-x-2">
                                                            {/* <FaCircleRight className="w-7 h-7 text-blue-700" /> */}
                                                            <div className="font-semibold text-lg ">
                                                                Dữ liệu hiện tại
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Box className="px-0">
                                                        <table class="w-full xl:inline-table lg:inline-table md:inline-table hidden text-left text-gray-500 ">
                                                            <thead class="font-semibold xl:text-base text-gray-700 bg-gray-50 ">
                                                                <tr>
                                                                    <th scope="col" class="py-3 text-left px-2">Quy trình</th>
                                                                    <th scope="col" class="py-3 text-left px-2">Công đoạn</th>
                                                                    <th scope="col" class="py-3 text-left px-2">Bước</th>
                                                                    <th scope="col" class="py-3 text-left px-2">Số lượng</th>
                                                                    <th scope="col" class="py-3 text-left px-2 "></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    data.map((item, index) => (
                                                                        <tr class="bg-white xl:text-base border-b " key={index}>
                                                                            <td scope="row" class="py-4 px-2 ">{item.QtName}</td>
                                                                            <td class="py-4 px-2">{item.CDOAN}</td>
                                                                            <td class="py-4 px-2">{item.Step}</td>
                                                                            <td class="py-4 px-2">{item.quantity}</td>
                                                                            <td class="py-4 px-2 float-right">
                                                                                <IoMdTrash color="#dc2626" cursor="pointer" size={28} onClick={() => removeItem(index)}/>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }

                                                            </tbody>
                                                        </table>
                                                    </Box>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="gap-3">
                                <Button
                                    onClick={onCloseQt}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    isDisabled={data.length == 0}
                                >
                                    Xác nhận
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                )
            }
        </Layout>
    )
}

export default PrintWorkflow;