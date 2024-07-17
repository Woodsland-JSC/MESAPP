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

    // Pedro Version
    getTeamByFactory: (factory) => {
        const url = `/get-team-by-factory`;
        return axiosClient().get(url, {params:{
            FAC: factory,
        }});
    },

    getDeliveryDetailReport: (statusCode, to, branch, plant, fromDate, toDate) => {
        const url = `/report/cbg-chitietgiaonhan`;
        return axiosClient().get(url, {
            params: {
                status_code: statusCode,
                To: to,
                branch: branch,
                plant: plant,
                from_date: fromDate,
                to_date: toDate
            }
        });
    },

    getDefectResolutionReport: (plant, fromDate, toDate) => {
        const url = `/report/cbg-xulyloi`;
        return axiosClient().get(url, {
            params: {
                plant: plant,
                from_date: fromDate,
                to_date: toDate
            }
        });
    },

    getCBGWoodDryingReport: (fromDate, toDate) => {
        const url = `/report/say-xepsay-cbg`;
        return axiosClient().get(url, {
            params: {
                from_date: fromDate,
                to_date: toDate
            }
        });
    },
}

export default reportApi;
