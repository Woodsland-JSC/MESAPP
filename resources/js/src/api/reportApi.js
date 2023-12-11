import axiosClient from "./axiosClient";
import axios from "axios";

const reportApi = {
    downloadKilnCheckingReport: () => {
        const url = `/report/download/drying-process`;
        return (
            axiosClient().get(url),
            {
                responseType: "blob",
            }
        );
    },
    downloadDryingKilnHistoryReport: () => {
        const url = `/report/download/drying-kiln-history`;
        return (
            axiosClient().get(url),
            {
                responseType: "blob",
            }
        );
    },
};

export default reportApi;
