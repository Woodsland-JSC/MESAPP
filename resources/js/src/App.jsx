import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "@fontsource-variable/inter";
import "@fontsource-variable/lexend";
import AppRoutes from "./routes/index.jsx";

function App() {
    return (
        <div id="app">
            <AppRoutes />
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
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
