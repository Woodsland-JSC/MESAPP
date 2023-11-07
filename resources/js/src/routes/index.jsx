import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/(auth)/login";
import ForgotPassword from "../pages/(auth)/forgotpassword";
import SignUp from "../pages/(auth)/signup";
import Settings from "../pages/settings";
import Users from "../pages/users";
import Workspace from "../pages/workspace/index";

import ProtectedRoute from "./ProtectedRoute";
import useAppContext from "../store/AppContext";

function AppRoutes() {
    const { user, isAuthenticated } = useAppContext();

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/workspace" element={<Workspace />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/workspace/kiln" element={<Settings />} />
                    <Route path="/workspace/load-into-kiln" element={<Settings />} />
                    <Route path="/workspace/drying-wood-checking" element={<Settings />} />
                    <Route path="/workspace/kiln-checking" element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
