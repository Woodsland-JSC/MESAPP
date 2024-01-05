import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProvider } from "../src/store/AppContext";
import theme from "./theme";
import "./assets/styles/index.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AppProvider>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </AppProvider>
    </React.StrictMode>
);
