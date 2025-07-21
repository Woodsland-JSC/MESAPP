import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Layout from "../../../layouts/layout";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoClose } from "react-icons/io5";
import { PiFilePdfBold } from "react-icons/pi";
import { FiCheck } from "react-icons/fi";
import "../../../assets/styles/index.css";
import {
  FaArrowRotateLeft,
  FaArrowUpRightFromSquare,
  FaCheck,
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "../../../assets/styles/datepicker.css";
import { formatNumber } from "../../../utils/numberFormat";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import useAppContext from "../../../store/AppContext";

const exampleData = [
  {
    week: "45",
    qc_group_code: "QC01",
    arrival_warehouse: "Kho A",
    defect_type: "Sai kích thước",
    processing_measure: "Điều chỉnh quy trình",
    itemname: "Cánh cửa gỗ tự nhiên",
    quantity: 50,
    volume: 120,
    production_order: "LSX001",
    sender: "Nguyễn Văn A",
    send_date: "2024-11-20",
    receiver_date: "2024-11-21 10:45",
  },
  {
    week: "45",
    qc_group_code: "QC02",
    arrival_warehouse: "Kho B",
    defect_type: "Màu sắc không đạt",
    processing_measure: "Sơn lại",
    itemname: "Bàn gỗ công nghiệp",
    quantity: 3000,
    volume: 2000,
    production_order: "LSX002",
    sender: "Trần Thị B",
    send_date: "2024-11-21",
    receiver_date: "2024-11-22 09:15",
  },
  {
    week: "46",
    qc_group_code: "QC03",
    arrival_warehouse: "Kho C",
    defect_type: "Bị trầy xước",
    processing_measure: "Thay bề mặt",
    itemname: "Tủ quần áo 3 cánh",
    quantity: 40,
    volume: 150,
    production_order: "LSX003",
    sender: "Lê Văn C",
    send_date: "2024-11-22",
    receiver_date: "2024-11-23 08:30",
  },
  {
    week: "46",
    qc_group_code: "QC04",
    arrival_warehouse: "Kho D",
    defect_type: "Sai khối lượng",
    processing_measure: "Kiểm tra lại",
    itemname: "Kệ sách 5 tầng",
    quantity: 60,
    volume: 100,
    production_order: "LSX004",
    sender: "Phạm Thị D",
    send_date: "2024-11-23",
    receiver_date: "2024-11-24 11:00",
  },
]

function DefectHandlingMeasureReport() {
  const navigate = useNavigate();

  const { user } = useAppContext();
  const gridRef = useRef();

  const getFirstDayOfCurrentMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(new Date());
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const [isDataReportLoading, setIsDataReportLoading] = useState(false);
  const [rowData, setRowData] = useState(exampleData || []);
  const [colDefs, setColDefs] = useState([
    {
      headerName: "Tuần",
      field: "week",
      width: 120,
      suppressHeaderMenuButton: true,
      cellStyle: (params) =>
        params.node.rowPinned ? { fontWeight: "bold", textAlign: "left" } : null,
    },
    {
      headerName: "Mã tổ QC",
      field: "qc_group_code",
      width: 150,
      suppressHeaderMenuButton: true,
      filter: true,
    },
    {
      headerName: "Kho đến",
      field: "arrival_warehouse",
      width: 180,
      suppressHeaderMenuButton: true,
      filter: true,
    },
    {
      headerName: "Loại lỗi",
      field: "defect_type",
      width: 120,
      suppressHeaderMenuButton: true,
      filter: true,
    },
    {
      headerName: "Biện pháp xử lý",
      field: "processing_measure",
      width: 180,
      suppressHeaderMenuButton: true,
      filter: true,
    },
    {
      headerName: "Chi tiết/cụm",
      field: "itemname",
      width: 350,
      suppressHeaderMenuButton: true,
      filter: true,
    },
    {
      headerName: "Số lượng",
      field: "quantity",
      width: 120,
      suppressHeaderMenuButton: true,
      valueFormatter: (params) => formatNumber(Number(params.value) || 0),
      cellStyle: (params) =>
        params.node.rowPinned ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" } : { textAlign: "right" },
    },
    {
      headerName: "Khối lượng",
      field: "volume",
      width: 120,
      suppressHeaderMenuButton: true,
      valueFormatter: (params) => formatNumber(Number(params.value) || 0),
      cellStyle: (params) =>
        params.node.rowPinned ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" } : { textAlign: "right" },
    },
    {
      headerName: "Lệnh sản xuất",
      field: "production_order",
      width: 150,
      suppressHeaderMenuButton: true,
    },
    { headerName: "Người tạo", field: "sender" },
    { headerName: "Ngày tạo", field: "send_date" },
    { headerName: "Ngày giờ nhận", field: "receiver_date" },
  ]);
  const [reportData, setReportData] = useState(exampleData || []);

  const totalRow = useMemo(() => {
    return [
      {
        week: "Tổng cộng",
        quantity: rowData.reduce((sum, row) => sum + row.quantity, 0),
        volume: rowData.reduce((sum, row) => sum + row.volume, 0),
      },
    ];
  }, [rowData]);

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return {
        backgroundColor: "#B9E0F6",
        fontWeight: "bold",
      };
    }
    return null;
  };

  const handleFactorySelect = async (factory) => {
    setSelectedFactory(factory);
    // Logic lấy theo factory
    const pickRandomRows = (data, n) => {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const randomRows = pickRandomRows(reportData, 3);
    setRowData(randomRows);
  };

  const handleWorkshopSelect = async (workshop) => {
    setSelectedWorkshop(workshop);
    // Logic lấy theo workshop
    const pickRandomRows = (data, n) => {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const randomRows = pickRandomRows(reportData, 2);
    setRowData(randomRows);
  };

  const FactoryOption = ({ value, label }) => (
    <div
      className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedFactory === value
        ? "border-[#86ABBE] bg-[#eaf8ff]"
        : "border-gray-300"
        }`}
      onClick={() => handleFactorySelect(value)}
    >
      {selectedFactory === value ? (
        <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
      ) : (
        <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
      )}
      <div
        className={`${selectedFactory === value
          ? "text-[#17506B] font-medium"
          : "text-gray-400 group-hover:text-[#17506B]"
          }`}
      >
        {label}
      </div>
    </div>
  );

  const WorkshopOption = ({ value, label }) => (
    <div
      className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedWorkshop === value
        ? "border-[#86ABBE] bg-[#eaf8ff]"
        : "border-gray-300"
        }`}
      onClick={() => handleWorkshopSelect(value)}
    >
      {selectedWorkshop === value ? (
        <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
      ) : (
        <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
      )}
      <div
        className={`${selectedWorkshop === value
          ? "text-[#17506B] font-medium"
          : "text-gray-400 group-hover:text-[#17506B]"
          }`}
      >
        {label}
      </div>
    </div>
  );

  const handleResetFilter = () => {
    setSelectedFactory(null);
    setSelectedWorkshop(null);
    setFromDate(getFirstDayOfCurrentMonth());
    setToDate(new Date());

    setReportData(null);

    toast.success("Đặt lại bộ lọc thành công.");
  };

  const handleExportExcel = useCallback(() => {
    gridRef.current.api.exportDataAsExcel();
  }, []);

  const handleExportPDF = () => {
    toast("Chức năng xuất PDF đang được phát triển.");
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <Layout>
      <div className="overflow-x-hidden">
        <div className="w-screen  p-6 px-5 xl:p-5 xl:px-12 ">
          <div className="flex flex-col tablet:flex-row items-center justify-between gap-3 mb-3.5">
            <div className="flex w-full tablet:w-auto items-center space-x-4">
              <div
                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                onClick={handleGoBack}
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex flex-col mb-0 pb-0">
                <div className="text-sm text-[#17506B]">
                  Báo cáo ván công nghiệp
                </div>
                <div className=" text-3xl serif font-bold">
                  Báo cáo biện pháp xử lý lỗi
                </div>
              </div>
            </div>

            <div className="w-full tablet:w-1/2 flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1  rounded-lg bg-[#F9FAFB]">
              <div className="flex items-center space-x-3 w-2/3">
                <IoSearch className="w-6 h-6 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tất cả..."
                  className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                />
              </div>

              <div className="flex justify-end items-center divide-x-2 w-1/3">
                <div className="mx-2.5"></div>
                <div>
                  <FaArrowRotateLeft
                    className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                    onClick={handleResetFilter}
                  />
                </div>
                <div>
                  <FaArrowUpRightFromSquare
                    className="mx-2.5 w-5 h-5 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                    onClick={handleExportExcel}
                  />
                </div>
                <div>
                  <PiFilePdfBold
                    className="mx-2.5 w-6 h-6 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                    onClick={handleExportPDF}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3">
            <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3">
              <div className="flex gap-3 w-full lg:w-1/4">
                <div className="col-span-1 w-full">
                  <label
                    htmlFor="indate"
                    className="block mb-1 text-sm t font-medium text-gray-900 "
                  >
                    Từ ngày
                  </label>
                  <DatePicker
                    selected={fromDate}
                    dateFormat="dd/MM/yyyy"
                    onChange={(date) => {
                      setFromDate(date);
                      if (
                        fromDate &&
                        toDate &&
                        selectedFactory &&
                        isReceived &&
                        selectedTeams
                      ) {
                        // getReportData();
                      }
                    }}
                    className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                  />
                </div>
                <div className="col-span-1 w-full">
                  <label
                    htmlFor="indate"
                    className="block mb-1 text-sm font-medium text-gray-900 "
                  >
                    Đến ngày
                  </label>
                  <DatePicker
                    selected={toDate}
                    dateFormat="dd/MM/yyyy"
                    onChange={(date) => {
                      setToDate(date);
                      if (
                        fromDate &&
                        toDate &&
                        selectedFactory &&
                        isReceived &&
                        selectedTeams
                      ) {
                        // getReportData();
                      }
                    }}
                    className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:pl-3 w-full lg:w-[70%] 2xl:w-1/2 lg:border-l-2 lg:border-gray-100">
                <label
                  htmlFor="indate"
                  className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                >
                  Chọn nhà máy
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="col-span-1 w-full">
                    <FactoryOption
                      value="YS"
                      label="Yên Sơn"
                    />
                  </div>
                  <div className="col-span-1 w-full flex items-end">
                    <FactoryOption
                      value="CH"
                      label="Chiêm Hoá"
                    />
                  </div>
                  <div className="col-span-1 w-full flex items-end">
                    <FactoryOption
                      value="VF"
                      label="Viforex"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col 2xl:pl-3 w-full 2xl:w-1/4 2xl:border-l-2 2xl:border-gray-100">
                <label
                  htmlFor="indate"
                  className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                >
                  Chọn xưởng sản xuất
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="col-span-1 w-full">
                    <WorkshopOption
                      value="PW"
                      label="Xưởng Plywood"
                    />
                  </div>
                  <div className="col-span-1 w-full flex items-end">
                    <WorkshopOption
                      value="LVL"
                      label="Xưởng LVL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isDataReportLoading ? (
            <div className="mt-2 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
              <div class="dots"></div>
            </div>
          ) : (
            <>
              {rowData?.length > 0 ? (
                <div>
                  <div
                    className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                    style={{
                      height: 630,
                      fontSize: 16,
                    }}
                  >
                    <AgGridReact
                      ref={gridRef}
                      rowData={rowData}
                      columnDefs={colDefs}
                      pinnedTopRowData={totalRow}
                      getRowStyle={getRowStyle}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                  Không có dữ liệu để hiển thị.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default DefectHandlingMeasureReport