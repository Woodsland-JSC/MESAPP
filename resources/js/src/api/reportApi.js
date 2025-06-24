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

    getDryingPlan: (fromDate, toDate, factory) => {
        const url = `/report/say-kehoachsay`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
                factory: factory,
            },
        });
    },

    getDryingQueue: (fromDate, toDate, factory) => {
        const url = `/report/say-xepchosay`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
                factory: factory,
            },
        });
    },

    getTeamByFactory: (factory) => {
        const url = `/get-team-by-factory`;
        return axiosClient().get(url, {
            params: {
                FAC: factory,
            },
        });
    },

    getReceiptInSAPReport: (
        fromDate,
        toDate,
        plant,
        to,
    ) => {
        const url = `/report/cbg-sanluongnhansap`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
                factory: plant,
                To: to,
            },
        });
    },

    getDeliveryDetailReport: (
        statusCode,
        to,
        branch,
        plant,
        fromDate,
        toDate
    ) => {
        const url = `/report/cbg-chitietgiaonhan`;
        return axiosClient().get(url, {
            params: {
                status_code: statusCode,
                To: to,
                branch: branch,
                plant: plant,
                from_date: fromDate,
                to_date: toDate,
            },
        });
    },

    getDefectResolutionReport: (plant, fromDate, toDate) => {
        const url = `/report/cbg-xulyloi`;
        return axiosClient().get(url, {
            params: {
                plant: plant,
                from_date: fromDate,
                to_date: toDate,
            },
        });
    },

    getDefectStockCheckingReport: (plant) => {
        const url = `/report/cbg-tonkhoxulyloi`;
        return axiosClient().get(url, {
            params: {
                plant: plant,
            },
        });
    },

    getCBGWoodDryingReport: (fromDate, toDate) => {
        const url = `/report/say-xepsay-cbg`;
        return axiosClient().get(url, {
            params: {
                from_date: fromDate,
                to_date: toDate,
            },
        });
    },

    getCBGFactory: () => {
        const url = `/cbg-factory`;
        return axiosClient().get(url);
    },

    getProductionVolumeByTime: (fromDate, toDate) => {
        const url = `/report/cbg-sanluongtheothoigian`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
        });
    },

    getProductionVolumeByDay: (fromDate, toDate) => {
        const url = `/report/cbg-sanluongtheongay`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
        });
    },

    getImportExportInventoryByStage: (
        fromDate,
        toDate,
        factory,
        { signal } = {}
    ) => {
        const url = `/report/cbg-nhapxuattontheocongdoan`;
        return axiosClient().get(url, {
            params: {
                fromDate,
                toDate,
                factory,
            },
            signal,
        });
    },

    getProductionOutputByProductionOrder: (
        fromDate,
        toDate,
        factory,
        { signal } = {}
    ) => {
        const url = `/report/sanluongtheolenhsanxuat`;
        return axiosClient().get(url, {
            params: {
                fromDate,
                toDate,
                factory,
                type: "CBG",
            },
            signal,
        });
    },

    getProductionOutputWeekly: (year, week, factory, { signal } = {}) => {
        const url = `/report/cbg-sanluongtheotuan`;
        return axiosClient().get(url, {
            params: {
                year,
                week,
                factory,
            },
            signal,
        });
    },

    getFactoryTransfer: (fromDate, toDate, { signal } = {}) => {
        const url = `/report/dieuchuyennhamay`;
        return axiosClient().get(url, {
            params: {
                fromDate,
                toDate,
            },
            signal,
        });
    },
};

export default reportApi;
