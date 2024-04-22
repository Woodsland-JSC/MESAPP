import React, {useLayoutEffect} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
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
import CreateDryingPlan from '../pages/workspace/create-drying-plan';
import Details from '../pages/workspace/details';
import DryingWoodChecking from '../pages/workspace/drying-wood-checking';
import Kiln from '../pages/workspace/kiln';
import KilnChecking from '../pages/workspace/kiln-checking';
import LoadIntoKiln from '../pages/workspace/load-into-kiln';
import WoodSorting from '../pages/workspace/wood-sorting';

// QC
import WoodProductingQC from "../pages/workspace/qc/wood-producting-qc";
import WoodProductionQCDetail from "../pages/workspace/qc/details"

import Notfound from "../pages/errors/notfound";

import ProtectedRoute from "./ProtectedRoute";
import FinishedGoodsReceipt from "../pages/workspace/finished-goods-receipt";
import PlywoodFinishedGoodsReceipt from "../pages/workspace/Plywood/finished-goods-receipt";

import Report from "../pages/reports/index";
import WoodProcessingKilnStackingReport from "../pages/reports/wooddrying/wood-processing-kiln-stacking";
import WoodAwaitingDryingReport from "../pages/reports/wooddrying/wood-awaiting-drying";
import KilnInspectionReport from "../pages/reports/wooddrying/kiln-inspection";
import SelectedDriedInventoryReport from "../pages/reports/wooddrying/selected-dried-inventory";
import CurrentDryingKilnReport from "../pages/reports/wooddrying/current-drying-kiln";
import DryingKilnHistoryReport from "../pages/reports/wooddrying/drying-kiln-history";
import HumidityCheckingReport from "../pages/reports/wooddrying/humidity-checking";

import useAppContext from "../store/AppContext";

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
                    {/* <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} /> */}
                    {/* <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}> */}
                    <Route
                        path="/"
                        element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace"
                        element={
                        <ProtectedRoute>
                            <Workspace />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                        <ProtectedRoute permissionsRequired={['quanlyuser']}>
                            <Users />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user/:userId"
                        element={
                        <ProtectedRoute permissionsRequired={['quanlyuser']}>
                            <User />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/create"
                        element={
                        <ProtectedRoute permissionsRequired={['quanlyuser']}>
                            <CreateUser />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/roles/create"
                        element={
                        <ProtectedRoute permissionsRequired={['quanlyuser']}>
                            <CreateRole />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/roles/:roleId"
                        element={
                        <ProtectedRoute permissionsRequired={['quanlyuser']}>
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
                        <ProtectedRoute permissionsRequired={['monitor']}>
                            <Integration />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/kiln"
                        element={
                        <ProtectedRoute permissionsRequired={['losay']}>
                            <Kiln />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/create-drying-plan"
                        element={
                        <ProtectedRoute permissionsRequired={['kehoachsay']}>
                            <CreateDryingPlan />
                        </ProtectedRoute>
                        }
                    />

                    {/* QC */}
                    <Route
                        path="/workspace/wood-producting-qc"
                        element={
                        <ProtectedRoute
                        //  permissionsRequired={['kehoachsay']}
                        >
                            <WoodProductingQC />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/wood-producting-qc/detail"
                        element={
                        <ProtectedRoute 
                        // permissionsRequired={['kehoachsay']}
                        >
                            <WoodProductionQCDetail />
                        </ProtectedRoute>
                        }
                    />

                    {/* Cái này cần xem lại */}
                    <Route
                        path="/product-detail/"
                        element={
                        <ProtectedRoute permissionsRequired={['kehoachsay']}>
                            <Details />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/wood-sorting"
                        element={
                        <ProtectedRoute permissionsRequired={['sepsay']}>
                            <WoodSorting />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/load-into-kiln"
                        element={
                        <ProtectedRoute permissionsRequired={['vaolo']}>
                            <LoadIntoKiln />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/drying-wood-checking"
                        element={
                        <ProtectedRoute permissionsRequired={['danhgiame']}>
                            <DryingWoodChecking />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/kiln-checking"
                        element={
                        <ProtectedRoute permissionsRequired={['kiemtralo']}>
                            <KilnChecking />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspace/wood-processing/finished-goods-receipt"
                        element={
                        <ProtectedRoute >
                            <FinishedGoodsReceipt />
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

                    {/* Báo cáo */}
                    <Route
                        path="/reports"
                        element={
                        <ProtectedRoute >
                            <Report />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-processing-kiln-stacking"
                        element={
                        <ProtectedRoute >
                            <WoodProcessingKilnStackingReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/wood-awaiting-drying"
                        element={
                        <ProtectedRoute >
                            <WoodAwaitingDryingReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/kiln-inspection"
                        element={
                        <ProtectedRoute >
                            <KilnInspectionReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/selected-dried-inventory"
                        element={
                        <ProtectedRoute >
                            <SelectedDriedInventoryReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/current-drying-kiln"
                        element={
                        <ProtectedRoute >
                            <CurrentDryingKilnReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/drying-kiln-history"
                        element={
                        <ProtectedRoute >
                            <DryingKilnHistoryReport />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/humidity-checking"
                        element={
                        <ProtectedRoute >
                            <HumidityCheckingReport />
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


