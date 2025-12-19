import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../../../../../layouts/layout"
import { FaArrowLeft, FaRegTrashCan, FaPencil, FaArrowRotateLeft, FaMagnifyingGlass } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import QCApi from "../../../../../../api/QCApi";
import toast from "react-hot-toast";
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
    Input
} from '@chakra-ui/react'

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useFormik } from "formik";

import * as Yup from 'yup';

import Swal from 'sweetalert2';
import QcDetailViewMobile from "./qc-detail-mobile";
import QcDetail from "./qc-detail";
import ViewMobile from "./view-mobile";
import ViewDefault from "./view-default";
import Loader from "../../../../../../components/Loader";

const ChungTuNhapKhoChiTiet = () => {
    const navigate = useNavigate();
    const { sapId } = useParams();
    const [searchParams] = useSearchParams();
    
    const [dataNLGBQCDetail, setDataNLGBQCDetail] = useState([]);
    const [selectedNLGBQCD, setSelectedNLGBQCD] = useState(null);
    const [loading, setLoading] = useState(false);
    const [infoGetQCDetail, setInfoGetQCDetail] = useState([]);
    const [qcTypes, setQcType] = useState([]);
    const [gqcSelected, setGqcSelected] = useState(null)
    const [loadingGQC, setLoadingGQC] = useState(false);
    const [loadingNLGBQCDetail, setLoadingNLGBQCDetail] = useState(false);

    // chakra-ui Modal State
    const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure()
    const { isOpen: isOpenModifyQC, onOpen: onOpenModifyQCModal, onClose: onCloseModifyQCModal } = useDisclosure();
    const { isOpen: isOpenQCModal, onOpen: onOpenQCModal, onClose: onCloseQCModal } = useDisclosure();

    const [gqc, setGqc] = useState([]);

    const [qcFilter, setQcFilter] = useState({
        pageSize: 20,
        totalPage: 0,
        search: '',
        totalRecord: 0,
        currentPage: 0
    });

    const [existingQcType, setExistingQcType] = useState([]);

    const initialValues = {
        id: null,
        sapId: sapId,
        phanLoai: "-",
        quyCachQC: "",
        day: 0,
        rong: 0,
        dai: 0,
        soThanhKLMau: 0,
        datYCHCLoai: 0,
        tiLe: 0,
        gapDoi: false,
        ghiChu: "",
        loaiLoi: ""
    }

    const formik = useFormik({
        initialValues,
        validationSchema: Yup.object({
            soThanhKLMau: Yup.number().required('Không được để trống').typeError("Dữ liệu không hợp lệ"),
            datYCHCLoai: Yup.number().required('Không được để trống').typeError("Dữ liệu không hợp lệ"),
            quyCachQC: Yup.string().required('Chọn quy cách QC')
        }),
        validateOnBlur: true,
        onSubmit: async (data) => {
            const postData = { ...data };

            postData.lineId = selectedNLGBQCD.lineId;

            let dataQC = {
                oDocEntry: postData.sapId,
                oLineId: selectedNLGBQCD.lineId,
                oU_QCK: postData.quyCachQC,
                oU_QCType: postData.phanLoai,
                oU_TTHANH: selectedNLGBQCD.tongThanh,
                oU_MTHANH: postData.soThanhKLMau,
                oU_QTHANH: postData.datYCHCLoai,
                oU_Rate: postData.tiLe,
                oU_GDOI: postData.gapDoi ? "Y" : "N",
                oU_LineMemo: postData.ghiChu,
                oU_ERR: "",
                oU_DayQC: postData.day,
                oU_RongQC: postData.rong,
                oU_DaiQC: postData.dai,
                oU_DayCP: selectedNLGBQCD.day,
                oU_RongCP: selectedNLGBQCD.rong,
                oU_DaiCP: selectedNLGBQCD.dai
            }

            try {
                let res = await QCApi.insertQC(dataQC);

                toast.success("Tạo QC thành công", {
                    duration: 3000
                });

                onCloseModifyQCModal();
                clearModifyData();

                getInfoGetQCDetail(selectedNLGBQCD);
            } catch (error) {
                toast.error("Lỗi tạo QC", {
                    duration: 3000
                })
            }
        },
        enableReinitialize: true,
    });

    const getNLGBQCDetail = async () => {
        try {
            setLoading(true)
            let res = await QCApi.getQcCBGDetail(sapId);

            setDataNLGBQCDetail(res);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error("Lỗi khi lấy dữ liệu.");
        }
    }

    const getInfoGetQCDetail = async (lineData) => {
        try {
            setLoadingNLGBQCDetail(true)
            setInfoGetQCDetail([]);

            let res = await QCApi.getQcDetail(sapId, lineData.lineId)

            res.sort((a, b) => b.id - a.id);

            setSelectedNLGBQCD(lineData);

            let existingQcTypes = []

            res.forEach(item => {
                if (!existingQcType.includes(item.phanLoai)) {
                    existingQcTypes.push(item.phanLoai);
                }
            })

            setExistingQcType(existingQcTypes);
            setInfoGetQCDetail(res);
            onOpen();
            setLoadingNLGBQCDetail(false)
        } catch {
            setLoadingNLGBQCDetail(false)
            setInfoGetQCDetail([]);
            setExistingQcType([]);
            setSelectedNLGBQCD(null);
            toast.error("Lỗi khi lấy dữ liệu.");
        }
    }

    const getQcType = async () => {
        try {
            let res = await QCApi.getQCType();
            setQcType(res);
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu.");
        }
    }

    const onCloseInfoGetQCDetailModal = () => {
        onClose();
        setInfoGetQCDetail([]);
        setSelectedNLGBQCD(null);
    }

    const onCloseModifyModal = () => {
        formik.setValues(initialValues);
        onCloseModifyQCModal();
    }

    const onOpenModifyModal = () => {
        onOpenModifyQCModal();
    }

    const onChangeQCType = (event) => {
        let value = event.target.value;

        let itemMain = getItemMainType();

        if (value == '-') {
            formik.setFieldValue('quyCachQC', '')
            formik.setFieldValue('day', 0)
            formik.setFieldValue('rong', 0)
            formik.setFieldValue('dai', 0)

            setGqcSelected(null);
        }

        if (value == 'Chính phẩm') {
            formik.setFieldValue('quyCachQC', selectedNLGBQCD?.quyCach ?? '')
            formik.setFieldValue('day', selectedNLGBQCD?.day ?? 0)
            formik.setFieldValue('rong', selectedNLGBQCD?.rong ?? 0)
            formik.setFieldValue('dai', selectedNLGBQCD?.dai ?? 0)
        }

        if (value == 'Hạ Cấp 1' || value == 'Hạ Cấp 2' || value == 'Hạ Cấp 3') {
            formik.setFieldValue('quyCachQC', '')
            formik.setFieldValue('day', 0)
            formik.setFieldValue('rong', 0)
            formik.setFieldValue('dai', 0)
        }

        if (value == 'Hàng Loại C' || value == 'Hàng Loại') {
            formik.setFieldValue('quyCachQC', '')
            formik.setFieldValue('day', 0)
            formik.setFieldValue('rong', 0)
            formik.setFieldValue('dai', 0)
        }

        if (value == 'Trả Lại NCC' || value == 'Hàng Lỗi Nhập Kho') {
            formik.setFieldValue('quyCachQC', '')
            formik.setFieldValue('day', 0)
            formik.setFieldValue('rong', 0)
            formik.setFieldValue('dai', 0)
        }

        if (value == 'Loại 1' || value == 'Loại 2' || value == 'Loại 3' || value == 'Loại 4') {
            formik.setFieldValue('quyCachQC', '')
            formik.setFieldValue('day', 0)
            formik.setFieldValue('rong', 0)
            formik.setFieldValue('dai', 0)
        }

        formik.setFieldValue('tiLe', 0)
        formik.setFieldValue('ghiChu', 0)
        formik.setFieldValue('soThanhKLMau', itemMain ? itemMain.soThanhKLMau : 0)
        formik.setFieldValue('datYCHCLoai', 0)
        formik.setFieldValue('ghiChu', '')
        formik.setFieldValue('loaiLoi', '')
        formik.setFieldValue('gapDoi', false)
    }

    const getGQC = async (page = 0, search = '') => {
        try {
            setLoadingGQC(true)
            let res = await QCApi.getGQC({
                currentPage: page,
                search
            });
            setGqc(res.value);
            setQcFilter({
                ...qcFilter,
                totalPage: Math.ceil((res["odata.count"] ?? 0) / qcFilter.pageSize),
                totalRecord: res["odata.count"] ?? 0,
                currentPage: Number(res["currentPage"])
            });
            setLoadingGQC(false)
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu.");
            setLoadingGQC(false)
        }
    }

    const onChangeSearchGQC = () => {
        let value = qcFilter.search;

        if (value == '') {
            getGQC(0, '');
        } else {
            getGQC(0, value);
        }
    }

    const onChangePage = (page) => {
        setQcFilter({ ...qcFilter, currentPage: page })
        getGQC(page, qcFilter.search);
    }

    const onSelectGQC = () => {
        formik.setFieldValue('quyCachQC', gqcSelected?.Code);
        formik.setFieldValue('day', gqcSelected?.U_Day ?? 0);
        formik.setFieldValue('rong', gqcSelected?.U_Rong ?? 0);
        formik.setFieldValue('dai', gqcSelected?.U_Dai ?? 0);

        if (gqcSelected.Code != selectedNLGBQCD.quyCach) {
            Swal.fire({
                icon: 'warning',
                text: 'Sai quy cách.'
            });

            formik.setFieldValue('quyCachQC', '');
            formik.setFieldValue('day', 0);
            formik.setFieldValue('rong', 0);
            formik.setFieldValue('dai', 0);
        }

        onCloseQCModal();
    }

    const closeQcModal = () => {
        formik.setFieldValue('quyCachQC', gqcSelected?.Code ?? '');
        formik.setFieldValue('day', gqcSelected?.U_Day ?? 0);
        formik.setFieldValue('rong', gqcSelected?.U_Rong ?? 0);
        formik.setFieldValue('dai', gqcSelected?.U_Dai ?? 0);

        onCloseQCModal();
    }

    const clearModifyData = () => {
        formik.setFieldValue('phanLoai', '-')
        formik.setFieldValue('quyCachQC', '')
        formik.setFieldValue('day', 0)
        formik.setFieldValue('rong', 0)
        formik.setFieldValue('dai', 0)
        formik.setFieldValue('tiLe', 0)
        formik.setFieldValue('ghiChu', 0)

        formik.setValues(initialValues);

        formik.resetForm();

        formik.setFieldValue("sapId", sapId);

        setGqcSelected(null);
    }

    const onChangeQuantityT = (value) => {
        try {
            let rate = (formik.values.datYCHCLoai / value) * 100;

            if (!Number.isFinite(rate)) {
                formik.setFieldValue('tiLe', 0)
            } else {
                formik.setFieldValue('tiLe', rate)
            }
        } catch (error) {
            formik.setFieldValue('tiLe', 0)
        }

        // let rate = (qty / formik.values.datYCHCLoai) * 100;

        // formik.setFieldValue('tiLe', rate)
    }

    const onChangeQuantityH = (value) => {
        
        try {
            if (Number(value) + getTotalQuantityH() > (getItemMainType() ? getItemMainType()?.soThanhKLMau : 0)) {
                Swal.fire({
                    icon: 'warning',
                    text: 'Số lượng đạt YC, Hạ cấp, Loại không được lớn hơn KL Mẫu.'
                });
                formik.setFieldValue('datYCHCLoai', 0)
                return;
            }

            let rate = (value / formik.values.soThanhKLMau) * 100;

            if (!Number.isFinite(rate)) {
                formik.setFieldValue('tiLe', 0)
            } else {
                formik.setFieldValue('tiLe', rate)
            }
        } catch (error) {
            formik.setFieldValue('tiLe', 0)
        }
    }

    const deleteQc = async (id) => {
        Swal.fire({
            title: 'Xóa QC?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await QCApi.deleteQC(id, sapId, selectedNLGBQCD.lineId);
                    getInfoGetQCDetail(selectedNLGBQCD);

                    toast.success("Xóa QC thành công", {
                        duration: 3000
                    });
                } catch (error) {
                    toast.error("Lỗi khi xóa QC", {
                        duration: 3000
                    });
                }
            }
        });
    }

    const getItemMainType = () => {
        let item = infoGetQCDetail.find(item => item.phanLoai == 'Chính phẩm');
        return item;
    }

    const getTotalQuantityH = () => {
        let total = 0;
        infoGetQCDetail.forEach(item => {
            total += Number(item.datYeuCauHaCapLoai);
        })
        return total;
    }

    const onChangeQcQc = (item) => {
        setGqcSelected(item)
    }

    const onClickOpenModifyModal = () => {
        let existingQcTypes = []

        infoGetQCDetail.forEach(item => {
            if (!existingQcType.some((type) => type === item)) {
                existingQcTypes.push(item.phanLoai);
            }
        });

        setExistingQcType(existingQcTypes);

        onOpenModifyModal();
    }

    useEffect(() => {
        getQcType();
        getGQC(0);
        getNLGBQCDetail();
    }, [])

    return (
        <Layout>
            <div className="">
                <div className="p-6 px-5 xl:p-5 xl:px-12">
                    {/* Title */}
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-center justify-between xL:space-x-6 lg:space-x-6 md:space-x-6 space-x-0 xL:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={() => navigate(`/workspace/qc-che-bien-go?factory=${searchParams.get('factory')}&fromDate=${searchParams.get('fromDate')}&toDate=${searchParams.get('toDate')}&loaiChungTu=${searchParams.get('loaiChungTu')}`)}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm  text-[#17506B]">
                                    Quản lý QC Chế biến gỗ
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Chi tiết Chứng từ nhập kho - Mã SAP: {sapId}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block mb-2 mt-2">
                        {
                            <div className="text-left text-sm text-gray-500 ">
                                {dataNLGBQCDetail.length} kết quả
                            </div>
                        }
                    </div>

                    <div>
                        {
                            loading ? (
                                <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    <div className="dots my-1"></div>
                                </div>
                            ) : (
                                dataNLGBQCDetail.length == 0 ? (
                                    <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                        Không có dữ liệu để hiển thị.
                                    </div>
                                ) : (
                                    <div>
                                        <div className="lg:hidden xl:hidden 2xl:hidden">
                                            <ViewMobile dataNLGBQCDetail={dataNLGBQCDetail} getInfoGetQCDetail={getInfoGetQCDetail} />
                                        </div>
                                        <div className="hidden sm:hidden md:hidden lg:block xl:block 2xl:block">
                                            <ViewDefault dataNLGBQCDetail={dataNLGBQCDetail} getInfoGetQCDetail={getInfoGetQCDetail} />
                                        </div>
                                    </div>
                                )
                            )
                        }
                    </div>
                </div>
            </div>

            {
                selectedNLGBQCD && (
                    <Modal isOpen={isOpen} onClose={onCloseInfoGetQCDetailModal} size="full" scrollBehavior="inside" blockScrollOnMount={false}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Thông tin QC</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <div>
                                    <Tabs>
                                        <TabList>
                                            <Tab>Ghi nhận QC</Tab>
                                            <Tab>Trả lại NCC</Tab>
                                        </TabList>
                                        <TabPanels>
                                            <TabPanel style={{ paddingLeft: 0, paddingRight: 0 }}>
                                                {
                                                    infoGetQCDetail.length == 0 ? (
                                                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                                            Không có dữ liệu để hiển thị.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="mt-4">
                                                                <QcDetailViewMobile infoGetQCDetail={infoGetQCDetail} selectedNLGBQCD={selectedNLGBQCD} deleteQc={deleteQc}></QcDetailViewMobile>

                                                            </div>
                                                            {/* <div className="mt-4 xl:block">
                                                                <QcDetail />
                                                            </div> */}
                                                        </>
                                                        // view content
                                                    )
                                                }
                                            </TabPanel>
                                            <TabPanel>
                                                <div className="mb-3 flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4">
                                                    <div className="flex-col w-full">
                                                        <div>
                                                            <div className="font-semibold text-[#17506B] mb-1">
                                                                Quy cách kho: {selectedNLGBQCD?.quyCach}
                                                            </div>
                                                            <div className="font-semibold">
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>Dày (CP): </span>
                                                                    <span className="font-normal">
                                                                        {selectedNLGBQCD?.day}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>Rộng (CP): </span>
                                                                    <span className="font-normal">
                                                                        {selectedNLGBQCD?.rong}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>Dài (CP): </span>
                                                                    <span className="font-normal">
                                                                        {selectedNLGBQCD?.dai}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 mb-3">
                                                                <hr />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>Mã SAP: </span>
                                                                    <span className="font-normal">
                                                                        {sapId}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>ID: </span>
                                                                    <span className="font-normal">

                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 font-semibold text-sm">
                                                                    <span>Còn lại: </span>
                                                                    <span className="font-normal">
                                                                        {selectedNLGBQCD?.tongThanhConLai}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 mb-3">
                                                                <hr />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <button
                                    onClick={onClickOpenModifyModal}
                                    className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                    Tạo mới
                                </button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                )
            }

            {/* Modal for Create of Update */}
            <Modal isOpen={isOpenModifyQC} onClose={onCloseModifyModal} size="full" scrollBehavior="inside" blockScrollOnMount={false}>
                <form onSubmit={formik.handleSubmit}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{formik.values.id ? 'Cập nhật QC' : 'Tạo mới QC'}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>

                            <div className="mb-3 flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4">
                                <div className="flex-col w-full">
                                    <div>
                                        <div className="font-semibold text-[#17506B] mb-1">
                                            Quy cách kho: {selectedNLGBQCD?.quyCach}
                                        </div>
                                        <div className="font-semibold">
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Dày (CP): </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.day ?? 0}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Rộng (CP): </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.rong ?? 0}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Dài (CP): </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.dai ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 mb-3">
                                            <hr />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Mã SAP: </span>
                                                <span className="font-normal">
                                                    {sapId}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>ID: </span>
                                                <span className="font-normal">
                                                    {formik.values.id}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Tổng thanh: </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.tongThanh}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Trả lại NCC: </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.traLaiNCC}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Còn lại: </span>
                                                <span className="font-normal">
                                                    {selectedNLGBQCD?.tongThanhConLai}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Tổng mẫu: </span>
                                                <span className="font-normal">
                                                    {getItemMainType() ? getItemMainType()?.soThanhKLMau : 0}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm">
                                                <span>Tổng PL: </span>
                                                <span className="font-normal">
                                                    {getTotalQuantityH()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 mb-3">
                                            <hr />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="font-semibold mb-1">
                                            Phân loại
                                        </div>
                                        <div className="font-semibold text-[#17506B] mb-1">
                                            <select
                                                className="border border-gray-300 rounded-md p-2 w-full"
                                                name="phanLoai"
                                                onChange={(e) => {
                                                    formik.handleChange(e)
                                                    onChangeQCType(e)
                                                }}
                                                defaultValue={formik.values.phanLoai}
                                            >
                                                {
                                                    qcTypes.filter((qcItem) => !existingQcType.includes(qcItem.Code)).map((item, index) => {
                                                        return (
                                                            <option key={index} value={item.Code}> {item.Name == '-' ? '-' : item.Name + " - " + item.Code}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-1">
                                                <span>Quy cách QC: </span>
                                                <span className="font-normal">
                                                    <button
                                                        type="button"
                                                        onClick={onOpenQCModal}
                                                        disabled={formik.values.phanLoai == "Chính phẩm" || formik.values.phanLoai == "-"}
                                                        className="px-2 py-1 text-sm rounded w-full border"
                                                    >
                                                        {formik.values.phanLoai == "-" ? 'Chọn' : (formik.values.quyCachQC ? formik.values.quyCachQC : 'Chọn QC')}
                                                    </button>
                                                </span>
                                            </div>
                                            {
                                                formik?.errors?.quyCachQC && (
                                                    <div className="grid grid-cols-2 font-semibold text-sm mb-2">
                                                        <span className="text-red-500">* {formik?.errors?.quyCachQC}</span>
                                                    </div>
                                                )
                                            }
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3">
                                                <span>Dày: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border rounded-md"
                                                        type="text"
                                                        name="day"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.day}
                                                        disabled={true}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3">
                                                <span>Rộng: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border  rounded-md"
                                                        type="text"
                                                        name="rong"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.rong}
                                                        disabled={true}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3">
                                                <span>Dài: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border rounded-md"
                                                        type="text"
                                                        name="dai"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.dai}
                                                        disabled={true}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3">
                                                <span>Số thanh, KL mẫu: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={formik?.errors?.soThanhKLMau ? 'red.500' : 'gray.400'}
                                                        className="border rounded-md"
                                                        type="text"
                                                        name="soThanhKLMau"
                                                        size="xs"
                                                        onChange={e => {
                                                            formik.handleChange(e);
                                                            onChangeQuantityT(e.target.value)
                                                        }}
                                                        value={formik.values.soThanhKLMau}
                                                        disabled={
                                                            !formik.values.phanLoai == "Chính phẩm" ||
                                                            formik.values.phanLoai == "-" ||
                                                            formik.values.phanLoai == "Hạ Cấp 1" ||
                                                            formik.values.phanLoai == "Hạ Cấp 2" ||
                                                            formik.values.phanLoai == "Hạ Cấp 3" ||
                                                            formik.values.phanLoai == "Hàng Loại C" ||
                                                            formik.values.phanLoai == "Hàng Loại" ||
                                                            formik.values.phanLoai == "Trả Lại NCC" ||
                                                            formik.values.phanLoai == "Hàng Lỗi Nhập Kho" ||
                                                            formik.values.phanLoai == "Loại 1" ||
                                                            formik.values.phanLoai == "Loại 2" ||
                                                            formik.values.phanLoai == "Loại 3" ||
                                                            formik.values.phanLoai == "Loại 4"
                                                        }
                                                    />
                                                </span>
                                            </div>
                                            {
                                                formik?.errors?.soThanhKLMau && (
                                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                                        <span className="text-red-500">* {formik?.errors?.soThanhKLMau}</span>
                                                    </div>
                                                )
                                            }
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-1">
                                                <span>Đạt YC, Hạ cấp, Loại: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={formik?.errors?.datYCHCLoai ? 'red.500' : 'gray.400'}
                                                        className={`border rounded-md`}
                                                        type="text"
                                                        name="datYCHCLoai"
                                                        size="xs"
                                                        onChange={(e) => {
                                                            formik.handleChange(e);
                                                            onChangeQuantityH(e.target.value)
                                                        }}
                                                        value={formik.values.datYCHCLoai}
                                                        disabled={formik.values.phanLoai == "-"}
                                                    />
                                                </span>
                                            </div>
                                            {
                                                formik?.errors?.datYCHCLoai && (
                                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                                        <span className="text-red-500">* {formik?.errors?.datYCHCLoai}</span>
                                                    </div>
                                                )
                                            }

                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3 ">
                                                <span>Tỉ lệ: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border rounded-md"
                                                        type="text"
                                                        name="tiLe"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.tiLe}
                                                        disabled={true}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3 ">
                                                <span>Gấp đôi: </span>
                                                <span className="font-normal">
                                                    <input
                                                        borderColor={'gray.400'}
                                                        className="border  rounded-md"
                                                        type="checkbox"
                                                        name="gapDoi"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.gapDoi}
                                                        defaultChecked={formik.values.gapDoi}
                                                        disabled={formik.values.phanLoai == "-"}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3 ">
                                                <span>Ghi chú: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border rounded-md"
                                                        type="text"
                                                        name="ghiChu"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.ghiChu}
                                                        disabled={formik.values.phanLoai == "-"}
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 font-semibold text-sm mb-3 ">
                                                <span>Loại lỗi: </span>
                                                <span className="font-normal">
                                                    <Input
                                                        borderColor={'gray.400'}
                                                        className="border  rounded-md"
                                                        type="text"
                                                        name="loaiLoi"
                                                        size="xs"
                                                        onChange={formik.handleChange}
                                                        value={formik.values.loaiLoi}
                                                        disabled={true}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        return false;
                                    }
                                }}
                                onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                        return false;
                                    }
                                }}
                                disabled={!formik.isValid || !formik.dirty}
                                type="submit"
                                className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                Lưu
                            </button>
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>

            {/* Modal List GQC */}
            <Modal isOpen={isOpenQCModal} onClose={closeQcModal} scrollBehavior="inside" blockScrollOnMount={false} size={"full"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Chọn QC</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody className="">
                        <div className="mb-3">
                            <div className=" mb-2">
                                Tìm kiếm
                            </div>
                            <div className="flex">
                                <div className="w-3/4">
                                    <Input name="searchQC" value={qcFilter.search} onChange={(e) => setQcFilter({ ...qcFilter, search: e.target.value })} placeholder="Tìm kiếm..." />
                                </div>
                                <div className="w-1/4 flex justify-end">
                                    <button className="px-4 py-2 border border-[#E2E8F0] h-[40px] rounded-md" onClick={onChangeSearchGQC}>
                                        <FaMagnifyingGlass />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {
                            loadingGQC ? (
                                <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    <div className="dots my-1"></div>
                                </div>
                            ) : gqc?.length == 0 ? (
                                <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            ) : (
                                <div className="mt-3 mb-3 ">
                                    <table className="min-w-full border border-gray-300 text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left border">Code</th>
                                                <th className="p-2  text-left border">Mã NVL</th>
                                                <th className="p-2  text-left border"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                gqc?.map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td className="p-2  border">{item.Code}</td>
                                                            <td className="p-2  border">{item.U_ItemCode}</td>
                                                            <td className="p-2  border text-center">
                                                                <input
                                                                    type="radio"
                                                                    name='qc'
                                                                    onClick={() => onChangeQcQc(item)}
                                                                    defaultChecked={formik.values.quyCachQC == item.Code}
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                    </ModalBody>
                    <ModalFooter>
                        <div>
                            <div className="items-center justify-between text-sm mb-3 text-center">
                                <button className="px-2 py-1 bg-gray-100 rounded" disabled={qcFilter.currentPage == 0} onClick={() => onChangePage(qcFilter.currentPage - 1)}>
                                    ← Prev
                                </button>
                                <span className="text-gray-600">Page {qcFilter.currentPage + 1} of {qcFilter.totalPage}</span>
                                <button className="px-2 py-1 bg-gray-100 rounded" disabled={qcFilter.currentPage + 1 == qcFilter.totalPage} onClick={() => onChangePage(qcFilter.currentPage + 1)}>
                                    Next →
                                </button>
                            </div>
                            {
                                gqcSelected && (
                                    <div className="float-right">
                                        <button
                                            onClick={() => onSelectGQC()}
                                            className="w-[100px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                            Chọn
                                        </button>
                                    </div>
                                )
                            }

                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {loadingNLGBQCDetail && <Loader />}
        </Layout>
    )
}

export default ChungTuNhapKhoChiTiet;