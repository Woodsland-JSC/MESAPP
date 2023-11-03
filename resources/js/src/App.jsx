import "./index.css";
import "./App.css";
import Layout from "./layouts/layout.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource-variable/inter";
import "@fontsource-variable/lexend";
import theme from "./theme";

// 

function App() {
    return (
        <ChakraProvider theme={theme}>
            <Layout>
                <div className="flex flex-col items-center p-40">
                    <div className="text-5xl font-semibold text-center text-black">
                        Get your work done
                    </div>
                    <div className="text-6xl font-semibold text-center text-[#135A7C]">
                        in a second.
                    </div>
                    <div className="mt-6">Một sản phẩm thuộc Grant Thornton Vietnam. </div>
                </div>
            </Layout>
        </ChakraProvider>
    );
}

export default App;
