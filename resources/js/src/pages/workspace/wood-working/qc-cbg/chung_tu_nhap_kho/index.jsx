import DatePicker from "react-datepicker";
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import QCApi from "../../../../../api/QCApi";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import ViewMobileNhapKhoQC from "./view-mobile";
import ViewTableNhapKhoQc from "./view-table";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import Swal from "sweetalert2";

const ChungTuNhapKho = ({ factories, loaiChungTu }) => {
    const navigate = useNavigate();
    const [queryParam] = useSearchParams();

    const firstDayOfMonth = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    const [filter, setFilter] = useState({
        fromDate: queryParam.get('fromDate') ? new Date(queryParam.get('fromDate')) : firstDayOfMonth,
        toDate: queryParam.get('toDate') ? new Date(queryParam.get('toDate')) : new Date(),
        factory: queryParam.get('factory') ? queryParam.get('factory') : null
    });

    const [data, setData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [nlgSelected, setNlgSelected] = useState(null);
    const [nlgQCR, setNLGQCR] = useState({
        data: [],
        loading: false
    });

    const [listChecked, setListChecked] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const onSelectNLGQC = (isChecked, itemNLGQC) => {
        setListChecked((prev) => {
            if (isChecked) {
                // Add item if not already in the list
                return [...prev, itemNLGQC];
            } else {
                // Remove item
                return prev.filter((item) => item.lineId !== itemNLGQC.lineId);
            }
        })
    }

    const qcReturn = async () => {
        if (listChecked.length == 0) return;

        const data = {
            listChecked
        }


        Swal.fire({
            title: "Trả lại NCC",
            text: "Xác nhận trả lại NCC",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await QCApi.qcReturn(data);
                    toast.success("Trả lại NCC thành công!");
                    let res = await QCApi.getNLGTraLaiNCC(nlgSelected.sapId);
                    setNLGQCR({ loading: false, data: res });
                    setListChecked([]);
                } catch (error) {
                    toast.error("Trả lại NCC có lỗi!");
                }
            }
        });
    }

    const qcReturnAll = () => {
        let data = {
            qcData: {
                sapId: nlgSelected.sapId,
                qcNote: nlgSelected.qcNote
            }
        }

        Swal.fire({
            title: "Trả lại NCC",
            text: "Xác nhận trả lại toàn bộ",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await QCApi.qcReturnAll(data);
                    toast.success("Trả lại toàn bộ thành công!");
                    let res = await QCApi.getNLGTraLaiNCC(nlgSelected.sapId);
                    setNLGQCR({ loading: false, data: res });
                    setListChecked([]);
                } catch (error) {
                    toast.error("Trả lại NCC có lỗi!");
                }
            }
        });
    }


    const getQcCbgData = async () => {
        if (!filter.factory) return;
        if (loadingData) return;

        let dataFilter = {
            fromDate: convertDateTime(filter.fromDate),
            toDate: convertDateTime(filter.toDate),
            factory: filter.factory
        }

        try {
            setLoadingData(true);
            let res = await QCApi.getQcCBG(dataFilter);


            let sorted = res.sort((a, b) => b.sapId - a.sapId);
            setData(sorted);
            setLoadingData(false);
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu", {
                duration: 3000
            });
            setLoadingData(false);
        }
    }

    const convertDateTime = (_date) => {
        let date = new Date(_date);

        let yyyy = date.getFullYear();
        let mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        let dd = String(date.getDate()).padStart(2, '0');

        let formatted = `${yyyy}-${mm}-${dd}`;

        return formatted
    }

    const selecteNLG = async (itemNLG) => {
        try {
            setNlgSelected(itemNLG);
            setNLGQCR({ ...nlgQCR, loading: true })
            let res = await QCApi.getNLGTraLaiNCC(itemNLG.sapId);
            setNLGQCR({ loading: false, data: res });
            onOpen();
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu", {
                duration: 3000
            })
            setNLGQCR({ loading: false, data: [] });
        }
    }

    const onCloseModalReturnSuplier = () => {
        setNlgSelected(null)
        setNLGQCR({ loading: false, data: [] });
        onClose();
    }

    const fixedNumber = (num, numberFixed) => {
        return num ? Number(num).toFixed(numberFixed) : "";
    }

    const countQuantity = () => {
        let count = {
            soBo: 0,
            soThanh: 0,
            tongThanh: 0,
            khoiLuong: 0,
            slDaTraNCC: 0,
            slConlai: 0,
            traLaiNCC: 0
        }

        nlgQCR.data.forEach(item => {
            count.soBo += item.soBo ? Number(item.soBo) : 0;
            count.soThanh += item.soThanh ? Number(item.soThanh) : 0;
            count.tongThanh += item.tongThanh ? Number(item.tongThanh) : 0;
            count.khoiLuong += item.khoiLuong ? Number(item.khoiLuong) : 0;
            count.slDaTraNCC += item.slDaTraNCC ? Number(item.slDaTraNCC) : 0;
            count.slConlai += item.slConLai ? Number(item.slConLai) : 0;
            count.traLaiNCC += item.traLaiNCC ? Number(item.traLaiNCC) : 0;
        })

        return count;
    }

    useEffect(() => {
        getQcCbgData();
    }, [filter])

    return <>
        {/* Responsive Header */}
        <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3 block">
            {/*Filter */}
            <div className="px-4">
                {/* Date Filter */}
                <div className="flex flex-col gap-y-3 md:flex-row md:space-y-0 md:gap-x-3">
                    <div className="w-full">
                        <label
                            htmlFor="select-fac"
                            className="block mb-1 font-medium text-gray-900"
                        >
                            Chọn nhà máy
                        </label>
                        <Select
                            id="select-fac"
                            className="cursor-pointer"
                            placeholder="Chọn nhà máy..."
                            options={factories}
                            value={factories.find(item => item.value == filter.factory)}
                            onChange={(selected) => setFilter({ ...filter, factory: selected.value })}
                        />
                    </div>
                    <div className="w-full">
                        <label
                            className="block mb-1 font-medium text-gray-900 "
                        >
                            Từ ngày
                        </label>
                        <DatePicker
                            selected={filter.fromDate}
                            dateFormat="dd/MM/yyyy"
                            onChange={(date) => {
                                setFilter({ ...filter, fromDate: date })
                            }}
                            className=" border border-gray-300 text-gray-900 text-base rounded-md cursor-pointer focus:border-none block w-full p-1.5"
                        />
                    </div>
                    <div className="w-full">
                        <label
                            className="block mb-1 font-medium text-gray-900 "
                        >
                            Đến ngày
                        </label>
                        <DatePicker
                            selected={filter.toDate}
                            dateFormat="dd/MM/yyyy"
                            onChange={(date) => {
                                setFilter({ ...filter, toDate: date })
                            }}
                            className=" border border-gray-300 text-gray-900 text-base rounded-md  cursor-pointer focus:border-none block w-full p-1.5"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div>
            {
                loadingData ? (
                    <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                        <div className="dots my-1"></div>
                    </div>
                ) : (
                    (data.length > 0) && (
                        <div>
                            <div className="">
                                <ViewMobileNhapKhoQC data={data} navigate={navigate} selecteNLG={selecteNLG} filter={filter} loaiChungTu={loaiChungTu.value} />
                            </div>
                        </div>
                    )
                )
            }
        </div>

        <div className="">
            {
                nlgSelected && (
                    <div>
                        <Modal isOpen={isOpen} onClose={onCloseModalReturnSuplier} size="full" scrollBehavior="inside" blockScrollOnMount={false}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Trả hàng NCC</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <div className="w-full overflow-x-auto">
                                        {
                                            nlgQCR.loading ? (
                                                <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                                    <div className="dots my-1"></div>
                                                </div>
                                            ) : (
                                                nlgQCR.data.length == 0 ? (
                                                    <div className="w-full mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                                        Không có dữ liệu để hiển thị.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <table className="w-full table-auto hidden sm:hidden md:hidden lg:block xl:block 2xl:block">
                                                            <thead class="font-bold">
                                                                {/* INFO report */}
                                                                <tr className="bg-[#17506B] text-[#FFFFFF]">
                                                                    <td className="border-r border-b border-gray-400 p-2 font-bold !w-[40px]"></td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[100px]">
                                                                        Quy cách
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[72px]">
                                                                        Dày
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[72px]">
                                                                        Rộng
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[72px]">
                                                                        Dài
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[70px]">
                                                                        Số bó
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[100px]">
                                                                        Số thanh
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[120px]">
                                                                        Tổng thanh
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold !w-[120px]">
                                                                        Khối lượng
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold truncate " title="SL đã trả NCC">
                                                                        SL đã trả NCC
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold truncate" title="SL còn lại">
                                                                        SL còn lại
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold truncate" title="Trả lại NCC">
                                                                        Trả lại NCC
                                                                    </td>
                                                                    <td className="border-r border-b border-gray-400 p-2 text-center font-bold w-[700px]" >
                                                                        Ghi chú
                                                                    </td>
                                                                    {/* <td className="border-r border-b border-gray-400 p-2 text-center font-bold w-[100px]" >
                                                                    SAPID
                                                                </td> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    nlgQCR.data.map((item, index) => (
                                                                        <tr key={index} className="bg-white !text-[13px]">
                                                                            {
                                                                                !item.slDaTraNCC ? (
                                                                                    <td className="border-l border-r border-b border-gray-400 p-2 text-center">
                                                                                        <input onChange={e => onSelectNLGQC(e.target.checked, item)} type="checkbox" name="nlgCheckbox" className="cursor-pointer" />
                                                                                    </td>
                                                                                ) : <td className="border-l border-r border-b border-gray-400 p-2 text-center"></td>
                                                                            }

                                                                            <td className=" border-r border-b border-gray-400 p-2">{item.quyCach}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.day, 2)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.rong, 2)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.dai, 2)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{item.soBo}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{item.soThanh}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{item.tongThanh}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.khoiLuong, 6)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.slDaTraNCC, 0)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.slConLai, 0)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2 text-right">{fixedNumber(item.traLaiNCC, 0)}</td>
                                                                            <td className=" border-r border-b border-gray-400 p-2">{item.qcGhiChu}</td>
                                                                            {/* <td className=" border-r border-b border-gray-400 p-2 text-right">{item.sapId}</td> */}
                                                                        </tr>
                                                                    ))
                                                                }
                                                                <tr className="bg-white !text-[17px]">
                                                                    <td className="border-l border-r border-b border-gray-400 p-2"></td>
                                                                    <td className=" border-r border-b border-gray-400 p-2"></td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right"></td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right"></td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right"></td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().soBo != 0 ? countQuantity().soBo : ""}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().soThanh != 0 ? countQuantity().soThanh : ""}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().tongThanh != 0 ? countQuantity().tongThanh : ""}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{fixedNumber(countQuantity().khoiLuong != 0 ? countQuantity().khoiLuong : "", 6)}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().slDaTraNCC != 0 ? countQuantity().slDaTraNCC : ""}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().slConlai != 0 ? countQuantity().slConlai : ""}</td>
                                                                    <td className=" border-r border-b border-gray-400 p-2 text-right bg-blue-100">{countQuantity().traLaiNCC != 0 ? countQuantity().traLaiNCC : ""}</td>
                                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                                    {/* <td className=" border-r border-b border-gray-400 p-2 text-right"></td> */}
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <div className="w-full block sm:block md:block lg:hidden xl:hidden 2xl:hidden">
                                                            {
                                                                nlgQCR.data.map((item, index) => (
                                                                    <div key={index} className="bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mb-2">
                                                                        <div className="flex-col">
                                                                            <div className="text-xl font-semibold text-[#17506B] mb-1 flex justify-between items-center">
                                                                                <div>
                                                                                    {item.quyCach}
                                                                                </div>
                                                                                {
                                                                                    !item.slDaTraNCC && <div>
                                                                                        <input onChange={e => onSelectNLGQC(e.target.checked, item)} type="checkbox" className="cursor-pointer w-5 h-5" />
                                                                                    </div>
                                                                                }

                                                                            </div>
                                                                            <div className="grid grid-cols-2 font-semibold mb-2">
                                                                                <span>Mã SAP: </span>
                                                                                <span className="font-normal">
                                                                                    {item.sapId}
                                                                                </span>
                                                                            </div>

                                                                            <hr className="mb-2" />

                                                                            <div className="grid grid-cols-2 font-semibold">
                                                                                <span>Số bó:</span>
                                                                                <span className="font-normal">
                                                                                    {item.soBo}
                                                                                </span>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 font-semibold">
                                                                                <span>Số thanh:</span>
                                                                                <span className="font-normal">
                                                                                    {item.soThanh}
                                                                                </span>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 font-semibold">
                                                                                <span>Tổng:</span>
                                                                                <span className="font-normal">
                                                                                    {item.tongThanh}
                                                                                </span>
                                                                            </div>

                                                                            <hr className="mt-2 mb-2" />

                                                                            <div className="mt-3 flex items-center w-full">
                                                                                <div className="space-y-3 w-full">
                                                                                    <div className="relative w-full">
                                                                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                                                                            <div className="flex-col  ">
                                                                                                <div className="font-bold text-[15px]">
                                                                                                    Khối lượng
                                                                                                </div>
                                                                                                <div className="text-[13px]">
                                                                                                    {fixedNumber(item.khoiLuong, 6)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                                                                            <div className="flex-col  ">
                                                                                                <div className="font-bold text-[15px]">
                                                                                                    SL đã trả
                                                                                                </div>
                                                                                                <div className="text-[13px]">
                                                                                                    {item.slDaTraNCC ? fixedNumber(item.slDaTraNCC, 0) : 0}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                                                                            <div className="flex-col  ">
                                                                                                <div className="font-bold text-[15px]">
                                                                                                    SL còn lại
                                                                                                </div>
                                                                                                <div className="text-[13px]">
                                                                                                    {fixedNumber(item.slConLai, 0)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>


                                                                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                                                                            <div className="flex-col  ">
                                                                                                <div className="font-bold text-[15px]">
                                                                                                    Trả lại NCC
                                                                                                </div>
                                                                                                <div className="text-[13px]">
                                                                                                    {fixedNumber(item.traLaiNCC, 0)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                                                                            <div className="flex-col  ">
                                                                                                <div className="font-bold text-[15px]">
                                                                                                    Ghi chú
                                                                                                </div>
                                                                                                <div className="text-[13px]">
                                                                                                    {item.qcGhiChu ? item.qcGhiChu : '-'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            )
                                        }
                                    </div>
                                </ModalBody>

                                <ModalFooter>
                                    {
                                        listChecked.length > 0 && (
                                            <button
                                                onClick={qcReturn}
                                                className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center mr-3">
                                                Trả theo QC
                                            </button>
                                        )
                                    }

                                    <button
                                        onClick={qcReturnAll}
                                        className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                        Trả toàn bộ
                                    </button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </div>
                )
            }
        </div>

    </>
}

export default ChungTuNhapKho;