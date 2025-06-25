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
  FaRegImage,
  FaExpand,
  FaDownLeftAndUpRightToCenter
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn, IoMdCheckbox, IoMdSquareOutline } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import {
  ModalOverlay,
  Modal,
  ModalHeader,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";

function generateWeeksData() {
  const weeksData = {};
  for (let i = 1; i <= 53; i++) {
    weeksData[`week${i}`] = Math.floor(Math.random() * 1000) + Math.floor(Math.random());
  }
  return weeksData;
}

function generateMonthsData() {
  const monthsData = {};
  for (let i = 1; i <= 12; i++) {
    monthsData[`month${i}`] = Math.floor(Math.random() * 1000) + Math.floor(Math.random());
  }
  return monthsData;
}

const exampleData = [
  {
    group_name: "1. Xếp ván PLY (YS3)",
    year: 2024,
    week: 43,
    weekday: "Thứ 6",
    itemname: "Plywood xoan đào: 23.5x1250x2500mm (1)",
    thickness: 23.5,
    width: 1250,
    length: 2500,
    unit: "Tấm",
    quantity: 8747.55775,
    volume: 6.3890625,
    sender: "Trần Thị Xuân",
    send_date: "2024-11-01T12:14:43.536Z",
    production_order: "VCN-YS3-PLY-33.10.24-M23.5.XĐ D",
    receiver: "Nguyễn Thị Hoa (YS2)",
    receiver_date: "2024-11-01T12:30:39.876Z",
    next_group: "2. Tạo Ván",
    ...generateWeeksData(),
    ...generateMonthsData()
  },
  {
    group_name: "1. Xếp ván PLY (YS3)",
    year: 2024,
    week: 43,
    weekday: "Thứ 6",
    itemname: "Plywood xoan đào: 23.5x1250x2500mm (1)",
    thickness: 23.5,
    width: 1250,
    length: 2500,
    unit: "Tấm",
    quantity: 88,
    volume: 6.4625,
    sender: "Trần Thị Xuân",
    send_date: "2024-11-01T12:14:54.103Z",
    production_order: "VCN-YS3-PLY-33.10.24-M23.5.XĐ D",
    receiver: "Nguyễn Thị Hoa (YS2)",
    receiver_date: "2024-11-01T12:30:42.196Z",
    next_group: "2. Tạo Ván",
    ...generateWeeksData(),
    ...generateMonthsData()
  },
  {
    group_name: "1. Xếp ván PLY (YS3)",
    year: 2024,
    week: 43,
    weekday: "Thứ 6",
    itemname: "Plywood xoan đào: 23.5x1250x2500mm (1)",
    thickness: 23.5,
    width: 1250,
    length: 2500,
    unit: "Tấm",
    quantity: 86,
    volume: 6.315625,
    sender: "Trần Thị Xuân",
    send_date: "2024-11-01T12:15:04.183Z",
    production_order: "VCN-YS3-PLY-33.10.24-M23.5.XĐ D",
    receiver: "Nguyễn Thị Hoa (YS2)",
    receiver_date: "2024-11-01T12:30:44.596Z",
    next_group: "2. Tạo Ván",
    ...generateWeeksData(),
    ...generateMonthsData()
  },
];

const exampleGroup1 = [
  {
    value: "All",
    label: "Tất cả"
  },
  {
    value: "TV",
    label: "Tạo ván"
  },
  {
    value: "HT",
    label: "Hoàn thiện"
  },
  {
    value: "TP",
    label: "Kho thành phẩm"
  }
]

const exampleGroup2 = [
  {
    value: "All",
    label: "Tất cả"
  },
  {
    value: "TV",
    label: "Sấy"
  },
  {
    value: "HT",
    label: "Hoàn thiện"
  },
  {
    value: "TP",
    label: "Kho thành phẩm"
  }
]

function ProductionVolumeByTimeReport() {
  const navigate = useNavigate();

  const { user } = useAppContext();
  const gridRef = useRef();
  const chartRef = useRef(null);
  const chartRefMobile = useRef(null);

  const getFirstDayOfCurrentMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const [groupData, setGroupData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("day");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [keyword, setKeyword] = useState("");

  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(new Date());
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState([]);

  const [isDataReportLoading, setIsDataReportLoading] = useState(false);
  const [rowData, setRowData] = useState(Array.from({ length: 10000 }, (_, i) =>
    exampleData.map((item) => ({
      ...item,
      id: item.id + i * exampleData.length,
    }))
  ).flat() || []);
  const colDefs = useMemo(() => {
    if (!selectedTimeRange) return [];

    switch (selectedTimeRange) {
      case "day":
        return [
          {
            headerName: "Tổ hiện tại",
            field: "group_name",
            rowGroup: true,
            width: 150,
            hide: true,
          },
          {
            headerName: "Chi tiết",
            field: "itemname",
            width: 350,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dài",
            field: "length",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Rộng",
            field: "width",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dày",
            field: "thickness",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Tổng sản lượng",
            field: "quantity",
            width: 170,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
          {
            headerName: "Tổng khối lượng (M3)",
            field: "volume",
            width: 220,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
        ];
      case "week":
        const weekColumns = Array.from({ length: 53 }, (_, index) => ({
          headerName: `Tuần ${index + 1}`,
          field: `week${index + 1}`,
          width: 130,
          suppressHeaderMenuButton: true,
          filter: true,
          valueFormatter: (params) => formatNumber(Number(params.value) || 0),
          aggFunc: "sum",
          cellStyle: (params) =>
            params.node.rowPinned
              ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
              : { textAlign: "right" },
        }));
        return [
          {
            headerName: "Tổ hiện tại",
            field: "group_name",
            rowGroup: true,
            width: 150,
            hide: true,
          },
          {
            headerName: "Chi tiết",
            field: "itemname",
            width: 350,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dài",
            field: "length",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Rộng",
            field: "width",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dày",
            field: "thickness",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Tổng sản lượng",
            field: "quantity",
            width: 180,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            hide: selectedUnit === "m3",
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
          {
            headerName: "Tổng khối lượng (M3)",
            field: "volume",
            width: 220,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            hide: selectedUnit === "sl",
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
          ...weekColumns,
        ];
      case "month":
        const monthColumns = Array.from({ length: 12 }, (_, index) => ({
          headerName: `Tháng ${index + 1}`,
          field: `month${index + 1}`,
          width: 130,
          suppressHeaderMenuButton: true,
          filter: true,
          valueFormatter: (params) => formatNumber(Number(params.value) || 0),
          aggFunc: "sum",
          cellStyle: (params) =>
            params.node.rowPinned
              ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
              : { textAlign: "right" },
        }));
        return [
          {
            headerName: "Tổ hiện tại",
            field: "group_name",
            rowGroup: true,
            width: 150,
            hide: true,
          },
          {
            headerName: "Chi tiết",
            field: "itemname",
            width: 350,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dài",
            field: "length",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Rộng",
            field: "width",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Dày",
            field: "thickness",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
          },
          {
            headerName: "Tổng sản lượng",
            field: "quantity",
            width: 180,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            hide: selectedUnit === "m3",
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
          {
            headerName: "Tổng khối lượng (M3)",
            field: "volume",
            width: 220,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            hide: selectedUnit === "sl",
            aggFunc: "sum",
            cellStyle: (params) =>
              params.node.rowPinned
                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                : { textAlign: "right" },
          },
          ...monthColumns,
        ];
      default:
        return [];
    }
  }, [selectedTimeRange, selectedUnit]);

  const excelStyles = [
    {
      id: 'header',
      font: { bold: true, size: 12 },
      alignment: { wrapText: true, horizontal: 'Center', vertical: 'Center' },
      borders: {
        borderBottom: { style: 'thin', color: '#000000' },
        borderTop: { style: 'thin', color: '#000000' },
        borderLeft: { style: 'thin', color: '#000000' },
        borderRight: { style: 'thin', color: '#000000' },
      },
    },
    {
      id: 'cell',
      alignment: { wrapText: true },
      borders: {
        borderBottom: { style: 'thin', color: '#000000' },
        borderTop: { style: 'thin', color: '#000000' },
        borderLeft: { style: 'thin', color: '#000000' },
        borderRight: { style: 'thin', color: '#000000' },
      },
    },
  ];

  const [reportData, setReportData] = useState(exampleData || []);

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return {
        backgroundColor: "#B9E0F6",
        fontWeight: "bold",
      };
    }
    return null;
  };

  const handleTimeRangeSelect = async (time) => {
    setSelectedTimeRange(time);
    const pickRandomRows = (data, n) => {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const randomRows = pickRandomRows(reportData, 3);
    setRowData(randomRows);
  };

  const handleUnitSelect = async (unit) => {
    setSelectedUnit(unit);
    const pickRandomRows = (data, n) => {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const randomRows = pickRandomRows(reportData, 3);
    setRowData(randomRows);
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

  const handleGroupSelect = async (group) => {
    if (group == "All") {
      if (selectedGroup?.length < groupData?.length) {
        setSelectedGroup([
          ...groupData.map(group => group.value)
        ])
      } else {
        setSelectedGroup([])
      }
      return;
    }
    setSelectedGroup((prevSelected) => {
      const exists = prevSelected.includes(group);

      if (exists) {
        const updated = prevSelected.filter((w) => (w !== group) && (w !== "All"));
        return updated;
      } else {
        const newValue = [...prevSelected.filter((w) => w !== "All"), group]
        if (newValue.length == groupData.length - 1) {
          return [
            ...groupData.map(group => group.value)
          ]
        } else return newValue;
      }
    });
    const pickRandomRows = (data, n) => {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const randomRows = pickRandomRows(reportData, 2);
    setRowData(randomRows);
  };

  const ReportOption = ({ value, label }) => (
    <div
      className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedTimeRange === value
        ? "border-[#86ABBE] bg-[#eaf8ff]"
        : "border-gray-300"
        }`}
      onClick={() => handleTimeRangeSelect(value)}
    >
      {selectedTimeRange === value ? (
        <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
      ) : (
        <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
      )}
      <div
        className={`${selectedTimeRange === value
          ? "text-[#17506B] font-medium"
          : "text-gray-400 group-hover:text-[#17506B]"
          }`}
      >
        {label}
      </div>
    </div>
  );

  const UnitOption = ({ value, label }) => (
    <div
      className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedUnit === value
        ? "border-[#86ABBE] bg-[#eaf8ff]"
        : "border-gray-300"
        }`}
      onClick={() => handleUnitSelect(value)}
    >
      {selectedUnit === value ? (
        <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
      ) : (
        <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
      )}
      <div
        className={`${selectedUnit === value
          ? "text-[#17506B] font-medium"
          : "text-gray-400 group-hover:text-[#17506B]"
          }`}
      >
        {label}
      </div>
    </div>
  );

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

  const GroupOption = ({ value, label }) => (
    <div
      className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-md border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedGroup?.includes(value)
        ? "border-[#86ABBE] bg-[#eaf8ff]"
        : "border-gray-300"
        }`}
      onClick={() => handleGroupSelect(value)}
    >
      {selectedGroup?.includes(value) ? (
        <IoMdCheckbox className="w-5 h-6 text-[#17506B]" />
      ) : (
        <IoMdSquareOutline className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
      )}
      <div
        className={`${selectedGroup.includes(value)
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
    setSelectedGroup([]);
    setSelectedUnit("")
    setSelectedWorkshop("");
    setSelectedTimeRange("day");
    setFromDate(getFirstDayOfCurrentMonth());
    setToDate(new Date());
    // setSelectAll(false);
    // setIsReceived(true);
    // setTeamData([]);

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

  const handleQuickFilterDebounced = debounce((value, api) => {
    if (api) {
      api.setGridOption('quickFilterText', value);
    }
  }, 300);

  const handleQuickFilter = (event) => {
    const value = event.target.value;
    setKeyword(value);
    if (gridRef?.current?.api) {
      handleQuickFilterDebounced(value, gridRef.current.api);
    }
  };

  const handleClearQuickFilter = () => {
    setKeyword('');
    if (gridRef?.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', '')
    }
  }

  const data = {
    labels: Array.from({ length: 53 }, (_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Tạo Ván',
        backgroundColor: '#FF69B4',
        data: Array.from({ length: 53 }, () => Math.floor(Math.random() * 300) + 150),
      },
      {
        label: 'Xếp Ván',
        backgroundColor: '#6A5ACD',
        data: Array.from({ length: 53 }, () => Math.floor(Math.random() * 250) + 100),
      },
      {
        label: 'Tạo Ván 2',
        backgroundColor: '#FFD700',
        data: Array.from({ length: 53 }, () => Math.floor(Math.random() * 100) + 50),
      },
      {
        label: 'Hoàn Thiện',
        backgroundColor: '#32CD32',
        data: Array.from({ length: 53 }, () => Math.floor(Math.random() * 400) + 200),
      },
    ],
  };

  const options = useMemo(() => {
    const titleText =
      selectedTimeRange === 'day'
        ? 'Biểu đồ sản lượng theo ngày'
        : selectedTimeRange === 'week'
          ? 'Biểu đồ sản lượng theo tuần'
          : selectedTimeRange === 'month'
            ? 'Biểu đồ sản lượng theo tháng'
            : 'Biểu đồ sản lượng';

    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: 'Lexend Variable,Source Serif Pro,sans-serif',
            },
          },
        },
        title: {
          display: true,
          text: titleText,
          color: '#1A202C',
          font: {
            family: 'Lexend Variable,Source Serif Pro,sans-serif',
            size: 24,
            weight: 'normal',
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text:
              selectedTimeRange === 'day'
                ? 'Ngày'
                : selectedTimeRange === 'week'
                  ? 'Tuần'
                  : selectedTimeRange === 'month'
                    ? 'Tháng'
                    : 'Thời gian',
            font: {
              family: 'Lexend Variable,Source Serif Pro,sans-serif',
              size: 14,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'M3',
            font: {
              family: 'Lexend Variable,Source Serif Pro,sans-serif',
              size: 14,
            },
          },
          ticks: {
            beginAtZero: true,
          },
        },
      },
    };
  }, [selectedTimeRange]);

  const handleDownloadImage = () => {
    const currentChartRef = chartRef.current || chartRefMobile.current
    if (currentChartRef) {
      const imageUrl = currentChartRef.toBase64Image();

      const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      let title = 'Biểu đồ sản lượng';
      if (selectedTimeRange === 'day' && fromDate && toDate) {
        title = `Biểu đồ sản lượng theo ngày (${formatDate(fromDate)}-${formatDate(toDate)})`;
      } else if (selectedTimeRange === 'week' && fromDate) {
        title = `Biểu đồ sản lượng theo tuần (${new Date(fromDate).getFullYear()})`;
      } else if (selectedTimeRange === 'month' && fromDate) {
        title = `Biểu đồ sản lượng theo tháng (${new Date(fromDate).getFullYear()})`;
      }

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title}.png`;
      link.click();
    }
  };

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const autoSizeAll = () => {
    const allColumnIds = [];
    gridRef.current.columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds);
  };

  useEffect(() => {
    if (selectedTimeRange) {
      switch (selectedTimeRange) {
        case "day":
          setSelectedUnit("");
          break;

        default:
          if (!selectedUnit)
            setSelectedUnit("sl");
          break;
      }
    }
  }, [selectedTimeRange])

  useEffect(() => {
    if (selectedWorkshop) {
      const groups = [exampleGroup1, exampleGroup2];
      setGroupData(groups[Math.floor(Math.random() * groups.length)])
    }
  }, [selectedWorkshop])

  useEffect(() => {
    if (gridRef.current) {
      // autoSizeAll();
    }
  }, [rowData]);

  return (
    <Layout>
      <div className="overflow-x-hidden">
        <div className="w-screen p-6 px-5 xl:p-5 xl:px-12 ">
          {/* Title */}
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
                  Báo cáo chế biến gỗ
                </div>
                <div className="serif text-3xl font-bold">
                  Báo cáo sản lượng theo {selectedTimeRange == "day" ? "ngày" : selectedTimeRange == "week" ? "tuần" : "tháng"} (VCN)
                </div>
              </div>
            </div>

            {/* Search & Export */}
            <div className="w-full tablet:w-fit gap-4 flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1  rounded-lg bg-[#F9FAFB]">
              <div className="flex items-center space-x-3 w-2/3">
                <IoSearch className="w-6 h-6 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tất cả..."
                  className="w-full tablet:w-72 focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                  value={keyword}
                  onChange={handleQuickFilter}
                />
                <IoClose className={`${keyword.length > 0 ? 'visible' : 'invisible'} hover:cursor-pointer`} onClick={handleClearQuickFilter} />
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

          {/* Header */}
          <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3">
            {/* Filter */}
            <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
              <div className="flex flex-col w-full lg:w-[60%] 2xl:w-1/2">
                <label
                  htmlFor="indate"
                  className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                >
                  Chọn loại báo cáo
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="col-span-1 w-full">
                    <ReportOption
                      value="day"
                      label="Theo ngày"
                    />
                  </div>
                  <div className="col-span-1 w-full flex items-end">
                    <ReportOption
                      value="week"
                      label="Theo tuần"
                    />
                  </div>
                  <div className="col-span-1 w-full flex items-end">
                    <ReportOption
                      value="month"
                      label="Theo tháng"
                    />
                  </div>
                </div>
              </div>
              {
                selectedTimeRange != "day" && (
                  <div className="flex flex-col w-full lg:w-[35%] 2xl:w-1/3 lg:pl-3 lg:border-l-2 lg:border-gray-100">
                    <label
                      htmlFor="indate"
                      className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                    >
                      Chọn đơn vị
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="col-span-1 w-full flex items-end">
                        <UnitOption
                          value="sl"
                          label="Số lượng"
                        />
                      </div>
                      <div className="col-span-1 w-full">
                        <UnitOption
                          value="m3"
                          label="Mét khối"
                        />
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3">
              {
                selectedTimeRange == "day" ? (
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
                ) : (
                  <div className="flex gap-3 w-full lg:w-1/4">
                    <div className="col-span-1 w-full">
                      <label
                        htmlFor="indate"
                        className="block mb-1 text-sm t font-medium text-gray-900 "
                      >
                        Chọn năm
                      </label>
                      <DatePicker
                        selected={fromDate}
                        showYearPicker
                        dateFormat="yyyy"
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
                  </div>
                )
              }

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
            <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
              <div className="flex flex-col w-full lg:w-[80%] 2xl:w-2/3 mt-1">
                <label
                  htmlFor="indate"
                  className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                >
                  Chọn tổ sản xuất
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {
                    groupData && groupData.length > 0 && groupData.map(group => (
                      <div className="col-span-1 w-full">
                        <GroupOption
                          value={group.value}
                          label={group.label}
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Column chart */}
          <div className="hidden lg:block border-2 border-gray-300 w-full h-auto bg-white rounded-xl p-4 pb-3 mt-3 relative" style={{ aspectRatio: 2 }}>
            <FaRegImage className="absolute top-3 left-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
              onClick={handleDownloadImage} />
            <FaExpand className="absolute top-3 right-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
              onClick={onModalOpen} />
            <Bar ref={chartRef} data={data} options={options} />
          </div>

          <div className="lg:hidden border-2 h-[500px] border-gray-300 bg-white rounded-xl p-4 pb-3 mt-3 relative">
            <FaRegImage className="absolute top-3 left-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all z-50"
              onClick={handleDownloadImage} />
            <FaExpand className="absolute top-3 right-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all z-50"
              onClick={onModalOpen} />
            <div className="overflow-scroll">
              <div className="w-[1200px] relative" style={{ aspectRatio: 2 }}>
                <Bar ref={chartRefMobile} data={data} options={options} className="w-full" />
              </div>
            </div>
          </div>

          {/* Content */}
          {isDataReportLoading ? (
            <div className="mt-2 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
              {/* <div>Đang tải dữ liệu</div> */}
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
                      autoGroupColumnDef={{
                        headerName: 'Tổ'
                      }}
                      excelStyles={excelStyles}
                      // groupDisplayType="groupRows"
                      animateRows={true}
                      suppressAggFuncInHeader
                      getRowStyle={getRowStyle}
                      grandTotalRow="bottom"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg flex ">
                  Không có dữ liệu để hiển thị.
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Modal
        isCentered
        isOpen={isModalOpen}
        size="full"
        // size=""
        onClose={onModalClose}
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>
            <h1 className="text-xl lg:text-2xl text-bold text-[#17506B]">
              Báo cáo sản lượng (VCN)
            </h1>
          </ModalHeader>
          <ModalCloseButton />
          <div className="border-b-2 border-gray-100"></div>
          <ModalBody className="!p-4">
            <div className="flex gap-4 justify-center h-full w-full">
              <div className="overflow-scroll w-full">
                <div className="w-[1200px] lg:w-full relative" style={{ aspectRatio: 2 }}>
                  <Bar ref={chartRefMobile} data={data} options={options} className="w-full" />
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export default ProductionVolumeByTimeReport