import React from "react";
import Cookies from 'js-cookie';
import { Navigate, Outlet } from "react-router-dom";
import useAppContext from "../store/AppContext";
import Forbidden from "../pages/errors/forbidden";

const ProtectedRoute = ({ permissionsRequired = [], children }) => {
    const { user, isAuthenticated } = useAppContext();
    const isCookieValid = Cookies.get('isAuthenticated');

    const hasPermission = () => {
        // Kiểm tra xem user có quyền truy cập hay không
        if (user && user.permissions) {
            return permissionsRequired.every((permission) =>
                user.permissions.includes(permission)
            );
        }
        return false;
    };

    return isAuthenticated && isCookieValid === "true" ? (
        hasPermission() ? (
            children
        ) : (
            <Forbidden />
        )
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;
