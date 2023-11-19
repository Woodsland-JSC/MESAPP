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
import Settings from "../pages/settings/index";
import Users from "../pages/users/index";
import User from "../pages/users/details";
import CreateUser from "../pages/users/create";
import CreateRole from "../pages/users/roles/create";
import Workspace from "../pages/workspace/index";
import CreateDryingPlan from '../pages/workspace/create-drying-plan';
import Details from '../pages/workspace/details';
import DryingWoodChecking from '../pages/workspace/drying-wood-checking';
import Kiln from '../pages/workspace/kiln';
import KilnChecking from '../pages/workspace/kiln-checking';
import LoadIntoKiln from '../pages/workspace/load-into-kiln';
import WoodSorting from '../pages/workspace/wood-sorting';

import Notfound from "../pages/errors/notfound";

import ProtectedRoute from "./ProtectedRoute";
import useAppContext from "../store/AppContext";

function AppRoutes() {
    const { user, isAuthenticated } = useAppContext();
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
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/workspace" element={<Workspace />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/user/:userId" element={<User />} />
                        <Route path="/users/create" element={<CreateUser />} />
                        <Route path="/roles/create" element={<CreateRole />} />
                        <Route path="/roles/:roleId" element={<CreateRole />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/workspace/kiln" element={<Kiln />} />
                        <Route path="/workspace/create-drying-plan" element={<CreateDryingPlan />} />
                        <Route path="/workspace/details" element={<Details  />} />
                        <Route path="/workspace/wood-sorting" element={<WoodSorting />} />
                        <Route path="/workspace/load-into-kiln" element={<LoadIntoKiln />} />
                        <Route path="/workspace/drying-wood-checking" element={<DryingWoodChecking />} />
                        <Route path="/workspace/kiln-checking" element={<KilnChecking />} />
                        <Route path="/workspace/details" element={<Details />} />
                    </Route>
                    <Route path="*" element={<Notfound />} />
                </Routes>
            </Wrapper>
        </Router>
    );
}

export default AppRoutes;
