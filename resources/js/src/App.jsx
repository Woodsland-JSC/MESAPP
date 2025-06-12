import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { vi } from "date-fns/locale";
import { setDefaultOptions } from "date-fns";
import "@fontsource-variable/inter";
import "@fontsource-variable/lexend";
import '@fontsource/source-serif-pro/200.css';
import '@fontsource/source-serif-pro/300.css';
import '@fontsource/source-serif-pro/400.css';
import '@fontsource/source-serif-pro/600.css';
import '@fontsource/source-serif-pro/700.css';
import '@fontsource/source-serif-pro/900.css';
import AppRoutes from "./routes/index.jsx";

function App() {
    setDefaultOptions({
        locale: {
            ...vi,
            options: {
                weekStartsOn: 1,
            },
        },
    });
    return (
        <div id="app">
            <AppRoutes />
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{
                    zIndex: 1000000
                }}
                toastOptions={{
                    className: "",
                    duration: 5000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },

                    success: {
                        duration: 3000,
                        theme: {
                            primary: "green",
                            secondary: "black",
                        },
                    },
                }}
            />
        </div>
    );
}

export default App;
