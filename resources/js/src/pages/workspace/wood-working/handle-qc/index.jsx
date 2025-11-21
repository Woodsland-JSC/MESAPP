import { IoIosArrowBack, IoIosTrash } from "react-icons/io";
import Layout from "../../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllWhQC, getItemByWhQC, getWhSL, handleItemsCH, handleSL } from "../../../../api/qc.api";
import toast from "react-hot-toast";
import useAppContext from "../../../../store/AppContext";
import Select from 'react-select';
import { AgGridReact } from "ag-grid-react";
import LoadingUI from "../../../../components/loading/Loading";
import AG_GRID_LOCALE_VI from '../../../../utils/locale.vi';
import { BiConfused } from "react-icons/bi";
import { HXL_QC_DATA, HXL_QC } from '../../../../shared/data';
import { Box, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Radio, RadioGroup, SimpleGrid, Spinner, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { FaDiceD6 } from "react-icons/fa6";
import Swal from "sweetalert2";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { getTeamProductionByFactory } from "../../../../api/ORSCApi";
import Loader from '../../../../components/Loader';

const HandleItemQc = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const gridRef = useRef();
    const facRef = useRef();
    const facRef1 = useRef();
    const [tab, setTab] = useState(0)

    const [wareHouseQC, setWarehouseQC] = useState([]);
    const [wareHouseSL, setWarehouseSL] = useState([]);
    const [warehouse, setWarehouse] = useState();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [row, setRow] = useState([]);
    const [hxl, setHXL] = useState();
    const [dataSL, setDataSL] = useState({
        dataSL: [],
        ToWhsCode: null
    });

    const [dataCH, setDataCH] = useState({
        selectedItem: [],
        Data: [],
        team: null
    });

    const [itemCH, setItemCH] = useState({
        CDay: "",
        CRong: "",
        CDai: "",
        Quantity: "",
        M3: 0
    });

    const [processing, setProcessing] = useState(false);

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const {
        isOpen: isModalCHOpen,
        onOpen: onModalCHOpen,
        onClose: onModalCHClose,
    } = useDisclosure();

    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState();
    const [loadingTeam, setLoadingTeam] = useState(false);

    const isLoading = useMemo(() => {
        return loadingTeam || processing || loading;
    }, [loadingTeam, processing, loading])

    const getAllWarehouseQC = async () => {
        try {
            let res = await getAllWhQC();
            let options = [];

            res.forEach(item => {
                if (user?.role == 1) {
                    options.push({
                        value: item.WhsCode,
                        label: item.WhsName,
                        fac: item.U_FAC
                    });
                } else {
                    if (user?.plant == item.U_FAC) {
                        options.push({
                            value: item.WhsCode,
                            label: item.WhsName,
                            fac: item.U_FAC
                        });
                    }
                }
            });

            setWarehouseQC(options);

        } catch (error) {
            console.log(error);
            toast.error("Lấy danh sách kho QC có lỗi.");
        }
    }

    const getItems = async () => {
        try {
            setLoading(true);
            let res = await getItemByWhQC({ whCode: warehouse.value });
            setItems(res);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error("Lấy danh sách items có lỗi.");
        }
    }

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: "#F6F6F6" };
        }
        return { background: "#ffffff" };
    };

    const [colDefs] = useState([
        {
            width: 50,
            pinned: 'left',
            checkboxSelection: (params) => {
                return !params.node.footer
            },
            headerComponentParams: { displayName: " " },
            suppressMenu: true,
            sortable: false
        },
        {
            headerName: "Mã sản phẩm",
            field: "ItemCode",
            filter: true,
            width: 250,
        },
        {
            headerName: "Tên sản phẩm",
            field: "ItemName",
            filter: true,
            width: 150,
            flex: 1
        },
        {
            headerName: "Batch",
            field: "BatchNum",
            filter: true,
            width: 150,
            flex: 1
        },
        {
            headerName: "Số lượng",
            field: "BatchQuantity",
            filter: true,
            width: 150,
        },
        {
            headerName: "Tồn kho",
            field: "Quantity",
            filter: true,
            width: 200,
            valueFormatter: node => {
                return Number(node.value || "")
            }
        },
        {
            headerName: "Kho",
            field: "WhsCode",
            filter: true,
            width: 200
        },
        {
            headerName: "Chiều dày",
            field: "U_CDay",
            filter: true,
            width: 150,
            valueFormatter: node => {
                return Number(node.value || "")
            }
        },
        {
            headerName: "Chiều rộng",
            field: "U_CRong",
            filter: true,
            width: 150,
            valueFormatter: node => {
                return Number(node.value || "")
            }
        },
        {
            headerName: "Chiều dài",
            field: "U_CDai",
            filter: true,
            width: 150,
            valueFormatter: node => {
                return Number(node.value || "")
            }
        }
    ]);

    const onSelectionChanged = useCallback((event) => {
        let selectedRows = event.api.getSelectedRows();
        setRow(selectedRows);
    }, []);

    const handleQC = (hxl) => {
        setHXL(hxl);
        let obj = [];

        row.forEach(item => {
            obj.push({ ...item, qtySL: Number(0) });
        });

        console.log('obj', obj);
        setDataSL(pre => ({...pre, dataSL: obj}));
        onModalOpen();
    }

    const handleQCCH = (hxl) => {
        setHXL(hxl);

        let items = [];

        row.forEach(item => {
            items.push({
                ItemCode: item.ItemCode,
                Quantity: item.Quantity,
                WhsCode: item.WhsCode,
                ToWhsCode: facRef?.current?.getValue()[0].value,
                ...item
            })
        });

        setDataCH({
            selectedItem: items,
            Data: []
        });
        onModalCHOpen();
    }

    const clearDataSL = () => {
        setDataSL({
            dataSL: [],
            ToWhsCode: null
        });
    }

    const clearDataCH = () => {
        setDataCH({
            Data: [],
            team: null,
            selectedItem: []
        })
    }

    const closeModalSL = () => {
        onModalClose();
        clearDataSL();
    }

    const closeModalCH = () => {
        onModalCHClose();
        clearDataCH();
    }

    const confirmHXLSayLai = () => {
        let invalid = false;
        dataSL.dataSL.forEach(item => {
            let qty = item.BatchQuantity ? Number(item.BatchQuantity) : Number(item.Quantity);
            if (item.qtySL > qty) {
                invalid = true;
                toast.error(`Số lượng sấy lại ${item.qtySL} đang lớn hơn tồn kho ${qty} của mã sản phẩm ${item.ItemCode}`);
                return;
            }
        })

        if(invalid) return;

        let data = {
            dataSL: dataSL.dataSL,
            ToWhsCode: dataSL.ToWhsCode ? dataSL.ToWhsCode : facRef?.current?.getValue()[0].value
        }

        Swal.fire({
            title: 'Chuyển kho sấy lại',
            text: `Xác nhận chuyển đến kho ${wareHouseSL.find(fac => fac.value == data.ToWhsCode).label}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (processing) return;
                    setProcessing(true);
                    let res = await handleSL(data);
                    setProcessing(false);
                    closeModalSL();
                    toast.success(res.message || 'Chuyển lấy lại thành công.');
                    getItems();
                } catch (error) {
                    setProcessing(false);
                    toast.error("Chuyển sấy lại có lỗi.")
                }
            }
        });

    }

    const confirmHXLCH = () => {
        console.log("data", dataCH);

        if (!dataCH.team) {
            toast.error("Vui lòng chọn tổ chuyển về");
            return;
        }

        if (dataCH.Data.length == 0) {
            toast.error("Vui lòng nhập 1 quy cách");
            return;
        }

        if (newM3 > currentM3) {
            toast.error(`Khối lượng mới ${newM3} đang lớn hơn khối lượng items ${currentM3}`);
            return;
        }

        Swal.fire({
            title: 'Xác nhận cắt hạ sản phẩm',
            text: `Xác nhận cắt hạ các items đã chọn?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (processing) return;
                    setProcessing(true);
                    let res = await handleItemsCH(dataCH);
                    console.log("res", res);

                    setProcessing(false);
                    closeModalSL();
                    toast.success(res.message || 'Xử lý cắt hạ các items thành công.');
                    getItems();

                    closeModalCH();
                } catch (error) {
                    setProcessing(false);
                    toast.error(error.response.data.message || "Xử lý cắt hạ có lỗi.")
                }
            }
        });
    }

    const loadWhSL = async () => {
        try {
            let res = await getWhSL();
            let options = [];

            res.forEach(item => {
                if (user?.role == 1) {
                    options.push({
                        value: item.WhsCode,
                        label: item.WhsName,
                        fac: item.U_FAC
                    });
                } else {
                    if (user?.plant == item.U_FAC) {
                        options.push({
                            value: item.WhsCode,
                            label: item.WhsName,
                            fac: item.U_FAC
                        });
                    }
                }
            });

            setWarehouseSL(options);
        } catch (error) {
            console.log(error);
            toast.error("Lấy danh sách kho sấy lại có lỗi.");
        }
    }

    const addItemCH = () => {
        let isExist = dataCH.Data.some(item => item.CDay == itemCH.CDay && item.CRong == itemCH.CRong && item.CDai == itemCH.CDai);

        if (isExist) {
            toast.error('Quy cách đã tồn tại');
            return;
        }

        if (!itemCH.CDay) {
            toast.error('Vui lòng nhập chiều dày quy cách');
            return;
        }

        if (!itemCH.Quantity) {
            toast.error('Vui lòng nhập số lượng');
            return;
        }

        if (itemCH.M3 == 0 || !itemCH.M3) {
            toast.error('Khối lượng phải lớn hơn 0.');
            return;
        }

        let currentData = [...dataCH.Data];
        currentData.push(itemCH);

        setDataCH(pre => ({ ...pre, Data: currentData }))

        setItemCH({
            CDay: "",
            CRong: "",
            CDai: "",
            Quantity: "",
            M3: 0
        });
    }

    const removeItem = (index) => {
        let data = [...dataCH.Data];
        let filtered = data.filter((item, i) => i != index);
        setDataCH(pre => ({ ...pre, Data: filtered }));
    }

    const loadTeams = async () => {
        try {
            setLoadingTeam(true);
            let res = await getTeamProductionByFactory(warehouse.fac);

            let options = [];

            res = res.sort((item1, item2) => item1.Name.localeCompare(item2.Name))

            res.forEach(item => {
                options.push({
                    value: item.Code,
                    label: `${item.Name}-${item.Code}`,
                    whCode: item.WhsCode
                });
            });

            setTeams(options);
            setLoadingTeam(false);
        } catch (error) {
            setLoadingTeam(false);
            toast.error("Lấy danh sách tổ có lỗi.");
        }
    }

    const currentM3 = useMemo(() => {
        let total = 0;

        row.forEach(item => {
            let m3 = (item.Quantity * item.U_CDai * item.U_CDay * item.U_CRong) / 1000000000;
            total += m3;
        });

        row.forEach(item => {
            total += Number(item.BatchQuantity);
        })

        return total;
    }, [row])

    const newM3 = useMemo(() => {
        let total = 0;

        dataCH.Data.forEach(item => {
            total += item.M3;
        })

        return total;
    }, [dataCH.Data])

    useEffect(() => {
        if (warehouse) {
            getItems();
            loadTeams();
        }
    }, [warehouse])

    useEffect(() => {
        getAllWarehouseQC();
        loadWhSL();
    }, [])

    return <>
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-20 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/workspace?tab=wood-working`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    <div className="flex space-x-4 mb-4 justify-between">
                        <div className="serif text-xl md:text-4xl font-bold">Xử lý hàng lỗi trong kho</div>
                    </div>

                    <div className="flex justify-between xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4 gap-x-2 gap-y-2 items-center">
                        <div className="md:w-1/4 w-full">
                            <label className="text-sm font-medium text-gray-900">
                                Chọn kho QC
                            </label>
                            <Select
                                options={wareHouseQC}
                                placeholder="Chọn nhà máy"
                                className="w-full mt-2 cursor-pointer"
                                onChange={(factory) => {
                                    setRow([]);
                                    setWarehouse({ ...factory });
                                }}
                            />
                        </div>

                        {
                            row && row.length > 0 && (
                                <div className="md:w-1/6 w-full flex items-center justify-end gap-x-2">
                                    {
                                        HXL_QC_DATA.map((hxl, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={` mt-0 self-end flex cursor-pointer items-center justify-center text-white bg-[#155979] font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                                onClick={() => {
                                                    if (hxl.id == HXL_QC.SAY_LAI) {
                                                        handleQC(hxl)
                                                    } else {
                                                        handleQCCH(hxl);
                                                    }
                                                }}
                                            >
                                                {hxl.name}
                                            </button>
                                        ))
                                    }

                                </div>
                            )
                        }
                    </div>

                    {
                        loading ? <LoadingUI /> : (
                            items.length > 0 ? (
                                <>
                                    <div className="xl:display:block lg:block md:block hidden">
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
                                                getRowStyle={getRowStyle}
                                                localeText={AG_GRID_LOCALE_VI}
                                                onSelectionChanged={onSelectionChanged}
                                                rowSelection="multiple"
                                                suppressRowClickSelection={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:display:hidden lg:hidden md:hidden sm:block block mt-3 ">
                                        {/* <div className="w-full">
                                        <label
                                            htmlFor="search"
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
                                                className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Tìm theo mã lò"
                                                onChange={e => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div> */}
                                        {/* {
                                            reports.filter(report => {
                                                return statusPallet.value == 1 ? report.CompletedBy : !report.CompletedBy
                                            }).filter(report => {
                                                if (search == "") {
                                                    return report
                                                } else {
                                                    return report.Oven.includes(search.toUpperCase())
                                                }
                                            }).map((report, i) => (
                                                <div className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mt-4" key={i}>
                                                    <div className="flex-col w-full">
                                                        <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                            {report.Oven}
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Mã lò: </span>
                                                            <span className="font-normal">
                                                                {report.OvenCode}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Quy cách: </span>
                                                            <span className="font-normal">
                                                                {report.QuyCach}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Ngày vào lò: </span>
                                                            <span className="font-normal">
                                                                {moment(report.LoadedIntoKilnDate).format(`DD/MM/YYYY HH:mm:ss`)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Ngày ra lò: </span>
                                                            <span className="font-normal">
                                                                {moment(report.CompletedDate).format(`DD/MM/YYYY HH:mm:ss`)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Người thao tác: </span>
                                                            <span className="font-normal">
                                                                {report.username}_{report.first_name} {report.last_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        } */}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full mt-10 flex flex-col items-center justify-center text-center">
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                    <div className="  text-lg text-gray-400">
                                        Không tìm thấy dữ liệu để hiển thị.
                                    </div>
                                </div>
                            )
                        )
                    }
                </div>
            </div>
        </Layout>
        {
            (hxl && row.length > 0) && (
                <>
                    <Modal
                        isCentered
                        isOpen={isModalOpen}
                        size="full"
                        onClose={onModalClose}
                        scrollBehavior="inside"

                    >
                        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                        <ModalContent m={0}
                            h="100vh">
                            <ModalHeader className="!p-2.5 ">
                                <h1 className="pl-4 text-xl lg:text-2xl serif font-bold text-center">
                                    Xử lý sản phẩm lỗi - {hxl.name}
                                </h1>
                            </ModalHeader>
                            <div className="border-b-2 border-gray-200"></div>
                            <ModalBody className="bg-gray-100 !p-4">
                                <div className=" p-4">
                                    <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#FFFFFF]">
                                        <div className="flex justify-between pb-1 ">
                                            <div className="flex items-center space-x-2">
                                                <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                <div className="font-semibold text-md">
                                                    Thông tin sản phẩm
                                                </div>
                                            </div>
                                        </div>

                                        <div className=" border-t pt-3">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="uppercase">
                                                        <th>
                                                            Mã sản phẩm
                                                        </th>
                                                        <th>
                                                            Tên sản phẩm
                                                        </th>
                                                        <th>
                                                            Số lượng
                                                        </th>
                                                        <th>
                                                            Tổng tồn kho
                                                        </th>
                                                        <th>
                                                            Số lượng SL
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        dataSL?.dataSL?.map((item, i) => (
                                                            <tr className="text-center" key={i}>
                                                                <td>{item.ItemCode}</td>
                                                                <td>{item.ItemName}</td>
                                                                <td>{Number(item.BatchQuantity)}</td>
                                                                <td>{Number(item.Quantity)}</td>
                                                                <td className="w-[250px]">
                                                                    <NumberInput
                                                                        min={0}
                                                                        value={item.qtySL}
                                                                        className="mt-2"
                                                                        onChange={value => {
                                                                            let items = [...dataSL.dataSL];
                                                                            items[i].qtySL = value;
                                                                            setDataSL(pre => ({ ...pre, dataSL: items }));
                                                                        }}
                                                                        max={item.BatchQuantity ? Number(item.BatchQuantity) : Number(item.Quantity)}
                                                                    >
                                                                        <NumberInputField />
                                                                        {/* <NumberInputStepper>
                                                                            <NumberIncrementStepper />
                                                                            <NumberDecrementStepper />
                                                                        </NumberInputStepper> */}
                                                                    </NumberInput>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="mt-2 xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#FFFFFF]">
                                        <div className="flex justify-between pb-1 ">
                                            <div className="flex items-center space-x-2">
                                                <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                <div className="font-semibold text-md">
                                                    Nhà máy sấy lại
                                                </div>
                                            </div>
                                        </div>

                                        <div className="gap-2 items-center justify-between py-3 border-t ">
                                            {/* <Box className="mb-2">
                                                <label className="font-semibold">
                                                    Khối lượng hiện tại
                                                </label>
                                                <span className="">
                                                    <NumberInput
                                                        isDisabled={true}
                                                        value={currentM3}
                                                        className="mt-2"
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box className="mb-2">
                                                <Text className="font-semibold">
                                                    Số lượng
                                                </Text>
                                                <span className="">
                                                    <NumberInput
                                                        className="mt-2"
                                                        onChange={(
                                                            value
                                                        ) => {
                                                            setDataSL(pre => ({ ...pre, QuantitySL: value }))

                                                            if (!value) {
                                                                setDataSL(pre => ({ ...pre, M3: 0 }))
                                                            } else {
                                                                let m3 = (value * row[0].U_CDai * row[0].U_CDay * row[0].U_CRong) / 1000000000;
                                                                setDataSL(pre => ({ ...pre, M3: m3 }))
                                                            }
                                                        }}
                                                        min={1}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box className="mb-2">
                                                <label className="font-semibold">
                                                    Khối lượng
                                                </label>
                                                <span className="">
                                                    <NumberInput
                                                        className="mt-2"
                                                        value={dataSL.M3}
                                                        onChange={value => {
                                                            setDataSL(pre => ({ ...pre, M3: value }))
                                                        }}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </span>
                                            </Box> */}
                                            <Box>
                                                <label className="font-semibold">
                                                    Chuyển đến nhà máy:
                                                </label>
                                                <Select
                                                    ref={facRef}
                                                    className="mt-2 mb-2"
                                                    placeholder="Lựa chọn"
                                                    options={wareHouseSL}
                                                    defaultValue={wareHouseSL.find(fac => fac.fac == warehouse.fac)}
                                                    isClearable
                                                    isSearchable
                                                    onChange={(option) => {
                                                        setDataSL(pre => ({ ...pre, ToWhsCode: option.value }))
                                                    }}
                                                />
                                            </Box>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex flex-col !p-0">
                                <div className="border-b-2 border-gray-100"></div>
                                <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                                    <button
                                        onClick={closeModalSL}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        disabled={processing}
                                        onClick={confirmHXLSayLai}
                                        className="bg-[#17506B] text-[#FFFFFF] p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        {
                                            processing ? "Đang xử lý..." : "Xác nhận"
                                        }

                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal
                        isCentered
                        isOpen={isModalCHOpen}
                        size="5xl"
                        onClose={onModalCHClose}
                        scrollBehavior="inside"
                    >
                        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                        <ModalContent m={0}
                            h="100vh">
                            <ModalHeader className="!p-2.5 ">
                                <h1 className="pl-4 text-xl lg:text-2xl serif font-bold text-center">
                                    Xử lý sản phẩm lỗi - {hxl.name}
                                </h1>
                            </ModalHeader>
                            <div className="border-b-2 border-gray-200"></div>
                            <ModalBody className="bg-gray-100 !p-4">
                                <div className=" p-4">
                                    <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#f0faff]">
                                        <div className="flex justify-between pb-1 ">
                                            <div className="flex items-center space-x-2">
                                                <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                <div className="font-semibold text-md">
                                                    Thông tin sản phẩm
                                                </div>
                                            </div>
                                        </div>

                                        <div className=" border-t pt-3">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="uppercase">
                                                        <th>
                                                            Mã sản phẩm
                                                        </th>
                                                        <th>
                                                            Tên sản phẩm
                                                        </th>
                                                        <th>
                                                            Tồn kho
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        row.map((item, i) => (
                                                            <tr className="text-center" key={i}>
                                                                <td>{item.ItemCode}</td>
                                                                <td>{item.ItemName}</td>
                                                                <td>{Number(item.Quantity)}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mt-2 xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#FFFFFF]">
                                        <div className="flex justify-between pb-1 ">
                                            <div className="flex items-center space-x-2">
                                                <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                <div className="font-semibold text-md">
                                                    Nhập số lượng cắt hạ
                                                </div>
                                            </div>
                                        </div>

                                        <div className="gap-2 items-center justify-between py-3 border-t ">
                                            <Box className="mb-2">
                                                <label className="font-semibold">
                                                    Khối lượng tổng
                                                </label>
                                                <span className="">
                                                    <NumberInput
                                                        isDisabled={true}
                                                        value={currentM3}
                                                        className="mt-2"
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </span>
                                            </Box>
                                            <Box>
                                                <label className="font-semibold">
                                                    Chuyển đến tổ:
                                                </label>
                                                <Select
                                                    ref={facRef1}
                                                    className="mt-2 mb-2"
                                                    placeholder="Lựa chọn"
                                                    options={teams}
                                                    value={team}
                                                    onChange={team => {
                                                        setDataCH(pre => ({ ...pre, team }))
                                                    }}
                                                />
                                            </Box>

                                            <Box className="mb-2" >
                                                <SimpleGrid columns={3} spacing={4}>
                                                    <Box>
                                                        <Text className="font-semibold">
                                                            Chiều dài
                                                        </Text>
                                                        <span className="">
                                                            <NumberInput
                                                                step={1}
                                                                className="mt-2"
                                                                value={itemCH.CDai}
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setItemCH(pre => ({ ...pre, CDai: value }));

                                                                    if (!value) {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }

                                                                    if (value && itemCH.CDay && itemCH.CRong && itemCH.Quantity) {
                                                                        let total = (itemCH.Quantity * value * itemCH.CDay * itemCH.CRong) / 1000000000;
                                                                        setItemCH(pre => ({ ...pre, M3: total }))
                                                                    } else {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }
                                                                }}
                                                                min={1}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </span>
                                                    </Box>
                                                    <Box>
                                                        <Text className="font-semibold">
                                                            Chiều Rộng
                                                        </Text>
                                                        <span className="">
                                                            <NumberInput
                                                                step={1}
                                                                value={itemCH.CRong}
                                                                className="mt-2"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setItemCH(pre => ({ ...pre, CRong: value }));

                                                                    if (!value) {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }

                                                                    if (itemCH.CDai && itemCH.CDay && value && itemCH.Quantity) {
                                                                        let total = (itemCH.Quantity * itemCH.CDai * itemCH.CDay * value) / 1000000000;
                                                                        setItemCH(pre => ({ ...pre, M3: total }))
                                                                    } else {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }
                                                                }}
                                                                min={1}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </span>
                                                    </Box>
                                                    <Box>
                                                        <Text className="font-semibold">
                                                            Chiều dày
                                                        </Text>
                                                        <span className="">
                                                            <NumberInput
                                                                step={1}
                                                                value={itemCH.CDay}
                                                                className="mt-2"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setItemCH(pre => ({ ...pre, CDay: value }));

                                                                    if (!value) {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }


                                                                    if (itemCH.CDai && value && itemCH.CRong && itemCH.Quantity) {
                                                                        let total = (itemCH.Quantity * itemCH.CDai * value * itemCH.CRong) / 1000000000;
                                                                        setItemCH(pre => ({ ...pre, M3: total }))
                                                                    } else {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }
                                                                }}
                                                                min={1}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </span>
                                                    </Box>
                                                </SimpleGrid>

                                            </Box>
                                            <Box className="mb-2">
                                                <SimpleGrid columns={1} spacing={4}>
                                                    <Box>
                                                        <Text className="font-semibold">
                                                            Số lượng
                                                        </Text>
                                                        <span className="">
                                                            <NumberInput
                                                                step={1}
                                                                className="mt-2"
                                                                value={itemCH.Quantity}
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setItemCH(pre => ({ ...pre, Quantity: value }))
                                                                    if (!value) {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }

                                                                    if (itemCH.CDai && itemCH.CDay && itemCH.CRong && value) {
                                                                        let total = (value * itemCH.CDai * itemCH.CDay * itemCH.CRong) / 1000000000;
                                                                        setItemCH(pre => ({ ...pre, M3: total }))
                                                                    } else {
                                                                        setItemCH(pre => ({ ...pre, M3: 0 }))
                                                                    }
                                                                }}
                                                                min={1}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </span>
                                                    </Box>
                                                    <Box>
                                                        <Text className="font-semibold">
                                                            Khối lượng
                                                        </Text>
                                                        <span className="">
                                                            <NumberInput
                                                                className="mt-2"
                                                                value={itemCH.M3}
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setItemCH(pre => ({ ...pre, M3: Number(value) }));
                                                                }}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </span>
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>
                                            <Box className="flex justify-end">
                                                <button
                                                    onClick={addItemCH}
                                                    className="bg-[#17506B] text-[#FFFFFF] p-2 rounded-xl px-4 h-fit w-full"
                                                >
                                                    {
                                                        processing ? "Đang xử lý..." : "Thêm mới"
                                                    }

                                                </button>
                                            </Box>
                                        </div>
                                    </div>

                                    {
                                        dataCH?.Data?.length > 0 && (
                                            <div className="mt-2 xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#FFFFFF]">
                                                <Box className="mb-2 mt-2" >
                                                    <SimpleGrid columns={3} spacing={4}>
                                                        {
                                                            dataCH.Data.map((item, index) => {
                                                                return (
                                                                    <Box key={index} className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#C6D2D9] shadow-sm rounded-xl space-y-2 bg-[#e4f4ee]">
                                                                        <div className="flex gap-2 items-center justify-between py-3">
                                                                            <Text className="font-semibold">
                                                                                Quy cách
                                                                            </Text>
                                                                            <span className="">
                                                                                {item.CDay}x{item.CRong}x{item.CDai}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex gap-2 items-center justify-between py-3 border-t ">
                                                                            <Text className="font-semibold">
                                                                                Số lượng
                                                                            </Text>
                                                                            <span className="">
                                                                                {item.Quantity}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex gap-2 items-center justify-between py-3 border-t ">
                                                                            <Text className="font-semibold">
                                                                                Khối lượng
                                                                            </Text>
                                                                            <span className="">
                                                                                {item.M3}
                                                                            </span>
                                                                        </div>

                                                                        <div className="gap-2 items-center py-3 border-t !mt-0 flex justify-center">
                                                                            <button className="bg-red-400 text-[#FFFFFF] p-2 rounded-xl px-4 w-full" onClick={() => removeItem(index)}>
                                                                                Xóa
                                                                            </button>
                                                                        </div>
                                                                    </Box>
                                                                )
                                                            })
                                                        }
                                                    </SimpleGrid>
                                                </Box>
                                            </div>
                                        )
                                    }

                                </div>
                            </ModalBody>
                            <ModalFooter className="flex !p-0 justify-between">
                                <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center py-4 gap-x-3 text-green-500">
                                    Khối lượng hiện tại: {newM3}
                                </div>
                                <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                                    <button
                                        disabled={processing}
                                        onClick={closeModalCH}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        disabled={processing || dataCH.Data.length == 0}
                                        onClick={confirmHXLCH}
                                        className={`${(processing || dataCH.Data.length == 0) ? 'cursor-not-allowed' : ''} bg-[#17506B] text-[#FFFFFF] p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full`}
                                    >
                                        {
                                            processing ? "Đang xử lý..." : "Xác nhận"
                                        }

                                    </button>
                                </div>

                            </ModalFooter>
                        </ModalContent >
                    </Modal >
                </>
            )
        }

        {isLoading && <Loader />}
    </>
}

export default HandleItemQc;