import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/styles/index.css"
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { AppProvider } from "./store/AppContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AppProvider>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </AppProvider>
    </React.StrictMode>
);
