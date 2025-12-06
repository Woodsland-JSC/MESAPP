import React, { useLayoutEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "../pages/home";
import Login from "../pages/(auth)/login";
import ForgotPassword from "../pages/(auth)/forgotpassword";
import SignUp from "../pages/(auth)/signup";
import Profile from "../pages/profile/index";
import Users from "../pages/users/index";
import User from "../pages/users/details";
import CreateUser from "../pages/users/create";
import CreateRole from "../pages/users/roles/create";
import EditRole from "../pages/users/roles/edit";
import Integration from "../pages/integration";

// Workspace
import Workspace from "../pages/workspace/index";

// Wood Drying
import CreateDryingPlan from "../pages/workspace/wood-drying/create-drying-plan";
import Details from "../pages/workspace/wood-drying/details";
import DryingWoodChecking from "../pages/workspace/wood-drying/drying-wood-checking";
import Kiln from "../pages/workspace/wood-drying/kiln";
import KilnChecking from "../pages/workspace/wood-drying/kiln-checking";
import LoadIntoKiln from "../pages/workspace/wood-drying/load-into-kiln";
import WoodSorting from "../pages/workspace/wood-drying/wood-sorting";

// QC
import WoodProductingQC from "../pages/workspace/wood-working/wood-producting-qc";
import PlywoodQC from "../pages/workspace/plywoods/plywood-qc";

import Notfound from "../pages/errors/notfound";

import ProtectedRoute from "./ProtectedRoute";

import FinishedGoodsReceipt from "../pages/workspace/wood-working/finished-goods-receipt";
import PlywoodFinishedGoodsReceipt from "../pages/workspace/plywoods/finished-goods-receipt";

import Report from "../pages/reports/index";

// New
import DriedWoodInventoryReport from "../pages/reports/wood-drying/dried-wood-inventory";
import DryingKilnsReport from "../pages/reports/wood-drying/drying-kilns";
import DryingPlanReport from "../pages/reports/wood-drying/drying-plan";
import DryingProductReport from "../pages/reports/wood-drying/drying-product";
import HumidityCheckReport from "../pages/reports/wood-drying/humidity-check";
import KilnCheckingReport from "../pages/reports/wood-drying/kiln-checking";
import KilnLoadingHistoryReport from "../pages/reports/wood-drying/kiln-loading-history";
import KilnLoadingReport from "../pages/reports/wood-drying/kiln-loading";
import CBGWoodDryingReport from "../pages/reports/wood-drying/wood-drying";
import DryingQueueReport from "../pages/reports/wood-drying/drying-queue";
import DefectStockCheckingReport from "../pages/reports/wood-working/defect-stock-checking";
import DeliveryDetailReport from "../pages/reports/wood-working/delivery-detail";

// VCN
import DefectHandlingMeasureReport from "../pages/reports/plywoods/defect-handling";
import DeliveredQuantityDetailReport from "../pages/reports/plywoods/delivered-quantity-detail";
import ProductionVolumeByTimePlywoodsReport from "../pages/reports/plywoods/production-volume-by-time";
import ImportExportInventoryByStageReport from "../pages/reports/plywoods/import-export-inventory-by-stage";
import ReceiptInSapReportVCN from "../pages/reports/plywoods/receipt-in-sap";
import ProductionOutputByProductionOrderVCN from "../pages/reports/plywoods/production-output-by-production-order";

import DefectResolutionReport from "../pages/reports/wood-working/defect-resolution";
import QCHandlingReport from "../pages/reports/wood-working/qc-handling";

import useAppContext from "../store/AppContext";
import HumidityCheck from "../components/HumidityCheck";
import ReceiptInSapReportCBG from "../pages/reports/wood-working/receipt-in-sap";
import WipProductionOrderReport from "../pages/reports/wood-working/wip-production-order";
import ProductionVolumeByTimeReport from "../pages/reports/wood-working/production-volume-by-time";
import WeeklyDetailProductionVolumeReport from "../pages/reports/wood-working/production-volume-weekly-detail";
import DetailsReceiptReport from "../pages/reports/wood-working/details-receipt";
import FactoryReceiptVolumelReport from "../pages/reports/wood-working/factory-receipt-volume";
import ImportExportInventoryByTime from "../pages/reports/wood-working/import-export-inventory-by-stage";
import ProductionOutputByProductionOrderCBG from "../pages/reports/wood-working/production-output-by-production-order";
import FactoryTransfer from "../pages/reports/wood-working/factory-transfer";

// Domestic
import DomesticFinishedGoodsReceipt from "../pages/workspace/domestic/finished-goods-receipt";
import InstallationProgress from "../pages/workspace/domestic/installation-progress";

// Transfer
import BinWarehouseTransfer from "../pages/workspace/goods-management/bin-warehouse-transfer";

// Kichen cabinet
import KitchenCabinetFinishedGoodsReceipt from "../pages/workspace/kitchen-cabinet/finished-goods-receipt";
import ReportResolution from "../pages/reports/wood-working/report-resolution";
import ProductionOrder from "../pages/reports/plywoods/production-order";

import QCCBG from '../pages/workspace/wood-working/qc-cbg/index';
import ChungTuNhapKhoChiTiet from "../pages/workspace/wood-working/qc-cbg/chung_tu_nhap_kho/detail";
import SanLuongQuyDoi from "../pages/reports/wood-working/san-luong-quy-doi";
import BaoCaoQuyLuong from "../pages/reports/wood-working/quy-luong";
import XuLyDieuChuyenPallet from "../pages/workspace/wood-drying/xu-ly-pallet";
import BaoCaoDieuChuyenPallet from "../pages/reports/wood-drying/dieu-chuyen-pallet";
import NoiDia from "../pages/workspace/domestic/noi-dia";
import TuBep from "../pages/workspace/domestic/tu-bep";
import BaoCaoRaLoPallet from "../pages/reports/wood-drying/ra-lo-pallet";
import OvenDrying from "../pages/reports/wood-drying/oven-drying";
import HandleItemQc from "../pages/workspace/wood-working/handle-qc";
import DryingCompletedReport from "../pages/reports/wood-drying/bao-cao-pallet-ra-lo";
import BaoCaoTonSayLua from "../pages/reports/wood-drying/ton-say-lua";
import PrintInventoryPosting from "../pages/workspace/goods-management/print-inventory-posting";
import BaoLoiSayLai from "../pages/workspace/wood-working/bao-loi-say-lai";
import HumidityReport from "../pages/reports/wood-working/humidity-report";

function AppRoutes() {
    // const { user, isAuthenticated } = useAppContext();
    const Wrapper = ({ children }) => {
        const location = useLocation();
        useLayoutEffect(() => {
            document.documentElement.scrollTo(0, 0);
        }, [location.pathname]);
        return children;
    };

    return (
        <Router>
            <Wrapper>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/workspace" replace />} />
                    <Route
                        path="/workspace"
                        element={
                            <ProtectedRoute>
                                <Workspace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/kiln"
                        element={
                            <ProtectedRoute permissionsRequired={["losay"]}>
                                <Kiln />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/create-drying-plan"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["kehoachsay"]}
                            >
                                <CreateDryingPlan />
                            </ProtectedRoute>
                        }
                    />

                    {/* Wood Drying Processing*/}
                    <Route
                        path="/workspace/wood-sorting"
                        element={
                            <ProtectedRoute permissionsRequired={["xepsay"]}>
                                <WoodSorting />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/load-into-kiln"
                        element={
                            <ProtectedRoute permissionsRequired={["vaolo"]}>
                                <LoadIntoKiln />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/drying-wood-checking"
                        element={
                            <ProtectedRoute permissionsRequired={["danhgiame"]}>
                                <DryingWoodChecking />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/kiln-checking"
                        element={
                            <ProtectedRoute permissionsRequired={["kiemtralo"]}>
                                <KilnChecking />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/xu-ly-dieu-chuyen-pallet"
                        element={
                            <ProtectedRoute permissionsRequired={["xulypallet"]}>
                                <XuLyDieuChuyenPallet />
                            </ProtectedRoute>
                        }
                    />
                    {/* Wood Working Processing */}
                    <Route
                        path="/workspace/wood-working/finished-goods-receipt"
                        element={
                            <ProtectedRoute>
                                <FinishedGoodsReceipt />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/wood-working/qc"
                        element={
                            <ProtectedRoute permissionsRequired={['QCCBG']}>
                                <WoodProductingQC />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/wood-working/handle-qc"
                        element={
                            <ProtectedRoute permissionsRequired={['QCCBG']}>
                                <HandleItemQc />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/wood-working/bao-loi-say-lai"
                        element={
                            <ProtectedRoute>
                                <BaoLoiSayLai />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/plywood/finished-goods-receipt"
                        element={
                            <ProtectedRoute >
                                <PlywoodFinishedGoodsReceipt />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/plywood/qc"
                        element={
                            <ProtectedRoute permissionsRequired={['QCVCN']}>
                                <PlywoodQC />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/qc-che-bien-go/:sapId"
                        element={
                            <ProtectedRoute>
                                <ChungTuNhapKhoChiTiet />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/qc-che-bien-go"
                        element={
                            <ProtectedRoute permissionsRequired={['QCCBG']}>
                                <QCCBG />
                            </ProtectedRoute>
                        }
                    />

                    {/* Domestic  */}
                    <Route
                        path="/workspace/domestic/noi-dia"
                        element={
                            <ProtectedRoute>
                                <NoiDia />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/domestic/tu-bep"
                        element={
                            <ProtectedRoute>
                                <TuBep />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/workspace/domestic/finished-goods-receipt"
                        element={
                            <ProtectedRoute>
                                <DomesticFinishedGoodsReceipt />
                            </ProtectedRoute>
                        }
                    />
                    {/* <Route
                        path="/workspace/inland/finished-details-receipt"
                        element={
                            // <ProtectedRoute permissionsRequired={['CTND']}>
                            <ProtectedRoute>
                                <FinishedDetailsReceipt />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/inland/finished-packaging-receipt"
                        element={
                            // <ProtectedRoute permissionsRequired={['CTND']}>
                            <ProtectedRoute>
                                <FinishedPackagingReceipt />
                            </ProtectedRoute>
                        }
                    /> */}
                    <Route
                        path="/workspace/inland/installation-progress"
                        element={
                            // <ProtectedRoute permissionsRequired={['TDND']}>
                            <ProtectedRoute>
                                <InstallationProgress />
                            </ProtectedRoute>
                        }
                    />

                    {/* Goods Management */}
                    <Route
                        path="/workspace/goods-management/bin-warehouse-transfer"
                        element={
                            <ProtectedRoute>
                                <BinWarehouseTransfer />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/goods-management/print-inventory-posting"
                        element={
                            <ProtectedRoute>
                                <PrintInventoryPosting />
                            </ProtectedRoute>
                        }
                    />

                    {/* Kichen Cabinet */}
                    <Route
                        path="/workspace/kitchen-cabinet/finished-goods-receipt"
                        element={
                            <ProtectedRoute>
                                <KitchenCabinetFinishedGoodsReceipt />
                            </ProtectedRoute>
                        }
                    />

                    {/* Reports */}
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Report />
                            </ProtectedRoute>
                        }
                    />

                    {/* SAY Report */}
                    <Route
                        path="/reports/wood-drying/dried-wood-inventory"
                        element={
                            <ProtectedRoute>
                                <DriedWoodInventoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/drying-kilns"
                        element={
                            <ProtectedRoute>
                                <DryingKilnsReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/drying-plan"
                        element={
                            <ProtectedRoute>
                                <DryingPlanReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/drying-product"
                        element={
                            <ProtectedRoute>
                                <DryingProductReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/humidity-check"
                        element={
                            <ProtectedRoute>
                                <HumidityCheckReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/kiln-checking"
                        element={
                            <ProtectedRoute>
                                <KilnCheckingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/kiln-loading-history"
                        element={
                            <ProtectedRoute>
                                <KilnLoadingHistoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/kiln-loading"
                        element={
                            <ProtectedRoute>
                                <KilnLoadingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/wood-drying"
                        element={
                            <ProtectedRoute>
                                <CBGWoodDryingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/drying-queue"
                        element={
                            <ProtectedRoute>
                                <DryingQueueReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying/dieu-chuyen-pallet"
                        element={
                            <ProtectedRoute>
                                <BaoCaoDieuChuyenPallet />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports/wood-drying/pallets"
                        element={
                            <ProtectedRoute>
                                <BaoCaoRaLoPallet />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports/wood-drying/completed"
                        element={
                            <ProtectedRoute>
                                <DryingCompletedReport />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports/wood-drying/ton-say-lua"
                        element={
                            <ProtectedRoute>
                                <BaoCaoTonSayLua />
                            </ProtectedRoute>
                        }
                    />

                    

                    <Route
                        path="/reports/wood-drying/oven-drying"
                        element={
                            <ProtectedRoute>
                                <OvenDrying />
                            </ProtectedRoute>
                        }
                    />

                    {/* CBG Reports */}
                    <Route
                        path="/reports/wood-working/receipt-in-sap"
                        element={
                            <ProtectedRoute>
                                <ReceiptInSapReportCBG />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/delivery-detail"
                        element={
                            <ProtectedRoute>
                                <DeliveryDetailReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/defect-resolution"
                        element={
                            <ProtectedRoute>
                                <DefectResolutionReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/defect-stock-checking"
                        element={
                            <ProtectedRoute>
                                <DefectStockCheckingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/wip-production-order"
                        element={
                            <ProtectedRoute>
                                <WipProductionOrderReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/production-volume-by-time"
                        element={
                            <ProtectedRoute>
                                <ProductionVolumeByTimeReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/production-volume-weekly-detail"
                        element={
                            <ProtectedRoute>
                                <WeeklyDetailProductionVolumeReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/import-export-inventory-by-stage"
                        element={
                            <ProtectedRoute>
                                <ImportExportInventoryByTime />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/production-output-by-production-order"
                        element={
                            <ProtectedRoute>
                                <ProductionOutputByProductionOrderCBG />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/factory-transfer"
                        element={
                            <ProtectedRoute>
                                <FactoryTransfer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/details-receipt"
                        element={
                            <ProtectedRoute>
                                <DetailsReceiptReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-working/factory-receipt-volume"
                        element={
                            <ProtectedRoute>
                                <FactoryReceiptVolumelReport />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports/wood-working/report-resolution"
                        element={
                            <ProtectedRoute>
                                <ReportResolution />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports/wood-working/san-luong-quy-doi"
                        element={
                            <ProtectedRoute>
                                <SanLuongQuyDoi />
                            </ProtectedRoute>
                        }

                    />

                    <Route
                        path="/reports/wood-working/quy-luong"
                        element={
                            <ProtectedRoute>
                                <BaoCaoQuyLuong />
                            </ProtectedRoute>
                        }

                    />

                    <Route
                        path="/reports/wood-working/say-am"
                        element={
                            <ProtectedRoute>
                                <HumidityReport />
                            </ProtectedRoute>
                        }
                    />

                    {/* VCN Reports */}
                    <Route
                        path="/reports/plywoods/receipt-in-sap"
                        element={
                            <ProtectedRoute>
                                <ReceiptInSapReportVCN />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/plywoods/delivered-quantity-details"
                        element={
                            <ProtectedRoute>
                                <DeliveredQuantityDetailReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/plywoods/defect-handling"
                        element={
                            <ProtectedRoute>
                                <DefectHandlingMeasureReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/plywoods/production-volume-by-time"
                        element={
                            <ProtectedRoute>
                                <ProductionVolumeByTimePlywoodsReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/plywoods/import-export-inventory-by-stage"
                        element={
                            <ProtectedRoute>
                                <ImportExportInventoryByStageReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/plywoods/production-output-by-production-order"
                        element={
                            <ProtectedRoute>
                                <ProductionOutputByProductionOrderVCN />
                            </ProtectedRoute>
                        }
                    />
                    {/* <Route
                        path="/reports/plywoods/production-order"
                        element={
                            <ProtectedRoute>
                                <ProductionOrder />
                            </ProtectedRoute>
                        }
                    /> */}

                    {/* <Route
                        path="/reports/defect-quantity"
                        element={
                            <ProtectedRoute>
                                <DefectQuantityReport />
                            </ProtectedRoute>
                        }
                    /> */}

                    {/* <Route
                        path="/reports/qc-handling"
                        element={
                            <ProtectedRoute>
                                <QCHandlingReport />
                            </ProtectedRoute>
                        }
                    /> */}

                    {/* Users Management */}
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["quanlyuser"]}
                            >
                                <Users />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user/:userId"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["quanlyuser"]}
                            >
                                <User />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/create"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["quanlyuser"]}
                            >
                                <CreateUser />
                            </ProtectedRoute>
                        }
                    />

                    {/* Roles Management */}
                    <Route
                        path="/roles/create"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["quanlyuser"]}
                            >
                                <CreateRole />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/roles/:roleId"
                        element={
                            <ProtectedRoute
                                permissionsRequired={["quanlyuser"]}
                            >
                                <EditRole />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/integration"
                        element={
                            <ProtectedRoute permissionsRequired={["monitor"]}>
                                <Integration />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/workspace/details" element={<Details />} />
                    {/* <Route element={<ProtectedRoute />}> */}
                    {/* <Route path="/" element={<Home />} /> */}
                    {/* <Route path="/workspace" element={<Workspace />} /> */}
                    {/* <Route path="/users" element={<Users />} /> */}
                    {/* <Route path="/user/:userId" element={<User />} /> */}
                    {/* <Route path="/users/create" element={<CreateUser />} />
                        <Route path="/roles/create" element={<CreateRole />} />
                        <Route path="/roles/:roleId" element={<CreateRole />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/integration" element={<Integration />} /> */}
                    {/* <Route path="/workspace/kiln" element={<Kiln />} />
                        <Route path="/workspace/create-drying-plan" element={<CreateDryingPlan />} /> */}
                    {/* <Route path="/workspace/details" element={<Details  />} /> */}
                    {/* <Route path="/workspace/wood-sorting" element={<WoodSorting />} />
                        <Route path="/workspace/load-into-kiln" element={<LoadIntoKiln />} /> */}
                    {/* <Route path="/workspace/drying-wood-checking" element={<DryingWoodChecking />} /> */}
                    {/* <Route path="/workspace/kiln-checking" element={<KilnChecking />} /> */}
                    {/* <Route path="/workspace/details" element={<Details />} /> */}
                    {/* </Route> */}
                    <Route path="*" element={<Notfound />} />
                </Routes>
            </Wrapper>
        </Router>
    );
}

export default AppRoutes;
