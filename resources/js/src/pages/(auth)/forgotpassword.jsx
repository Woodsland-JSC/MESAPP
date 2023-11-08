import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import useAppContext from "../../store/AppContext";

function ForgotPassword() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppContext();

    return isAuthenticated ? (
        <Navigate to="/" replace />
    ) : (
        <div>Forgot password</div>
    );
}

export default ForgotPassword;
