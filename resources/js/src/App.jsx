import "./index.css";
import Layout from "./layouts/layout.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import { TbArrowNarrowRight } from "react-icons/tb";
import "@fontsource-variable/inter";
import "@fontsource-variable/lexend";
import React from "react";
import AppRoutes from "./routes.jsx";
//

function App() {
    return (
        <AppRoutes>
            <Layout>        
            </Layout>
        </AppRoutes>
    );
}

export default App;
