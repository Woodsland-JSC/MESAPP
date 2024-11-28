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
import WoodProcessingKilnStackingReport from "../pages/reports/wooddrying/wood-processing-kiln-stacking";
import WoodAwaitingDryingReport from "../pages/reports/wooddrying/wood-awaiting-drying";
import KilnInspectionReport from "../pages/reports/wooddrying/kiln-inspection";
import SelectedDriedInventoryReport from "../pages/reports/wooddrying/selected-dried-inventory";
import CurrentDryingKilnReport from "../pages/reports/wooddrying/current-drying-kiln";
import DryingKilnHistoryReport from "../pages/reports/wooddrying/drying-kiln-history";
import HumidityCheckingReport from "../pages/reports/wooddrying/humidity-checking";

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

import DeliveryDetailReport from "../pages/reports/wood-working/delivery-detail";
import DetailStockReceiptReport from "../pages/reports/wood-working/detail-stock-receipt";
import SyncRatioReport from "../pages/reports/wood-working/sync-ratio";
import WeeklyGoodsReceiptsReport from "../pages/reports/wood-working/weekly-goods-receipts";

import DefectQuantityReport from "../pages/reports/qc/defect-quantity";
import DefectResolutionReport from "../pages/reports/qc/defect-resolution";
import QCHandlingReport from "../pages/reports/qc/qc-handling";

import useAppContext from "../store/AppContext";
import HumidityCheck from "../components/HumidityCheck";

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
                            <ProtectedRoute permissionsRequired={['CBG']}>
                                <WoodProductingQC />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/workspace/plywood/finished-goods-receipt"
                        element={
                            <ProtectedRoute permissionsRequired={['VCN']}>
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
                    

                    {/* Reports */}
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Report />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-processing-kiln-stacking"
                        element={
                            <ProtectedRoute>
                                <WoodProcessingKilnStackingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-awaiting-drying"
                        element={
                            <ProtectedRoute>
                                <WoodAwaitingDryingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/kiln-inspection"
                        element={
                            <ProtectedRoute>
                                <KilnInspectionReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/selected-dried-inventory"
                        element={
                            <ProtectedRoute>
                                <SelectedDriedInventoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/current-drying-kiln"
                        element={
                            <ProtectedRoute>
                                <CurrentDryingKilnReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-kiln-history"
                        element={
                            <ProtectedRoute>
                                <DryingKilnHistoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/humidity-checking"
                        element={
                            <ProtectedRoute>
                                <HumidityCheckingReport />
                            </ProtectedRoute>
                        }
                    />

                    {/* New Report */}
                    <Route
                        path="/reports/dried-wood-inventory"
                        element={
                            <ProtectedRoute>
                                <DriedWoodInventoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-kilns"
                        element={
                            <ProtectedRoute>
                                <DryingKilnsReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-plan"
                        element={
                            <ProtectedRoute>
                                <DryingPlanReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-product"
                        element={
                            <ProtectedRoute>
                                <DryingProductReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/humidity-check"
                        element={
                            <ProtectedRoute>
                                <HumidityCheckReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/kiln-checking"
                        element={
                            <ProtectedRoute>
                                <KilnCheckingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/kiln-loading-history"
                        element={
                            <ProtectedRoute>
                                <KilnLoadingHistoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/kiln-loading"
                        element={
                            <ProtectedRoute>
                                <KilnLoadingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-drying"
                        element={
                            <ProtectedRoute>
                                <CBGWoodDryingReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-queue"
                        element={
                            <ProtectedRoute>
                                <DryingQueueReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/delivery-detail"
                        element={
                            <ProtectedRoute>
                                <DeliveryDetailReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/detail-stock-receipt"
                        element={
                            <ProtectedRoute>
                                <DetailStockReceiptReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/sync-ratio"
                        element={
                            <ProtectedRoute>
                                <SyncRatioReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/weekly-goods-receipts"
                        element={
                            <ProtectedRoute>
                                <WeeklyGoodsReceiptsReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/defect-quantity"
                        element={
                            <ProtectedRoute>
                                <DefectQuantityReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/defect-resolution"
                        element={
                            <ProtectedRoute>
                                <DefectResolutionReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/qc-handling"
                        element={
                            <ProtectedRoute>
                                <QCHandlingReport />
                            </ProtectedRoute>
                        }
                    />

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
