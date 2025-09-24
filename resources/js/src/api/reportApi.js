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

    getStageByDivision: (division) => {
        const url = `/get-stage-by-division`;
        return axiosClient().get(url, {
            params: {
                DIV: division,
            },
        });
    },

    getTeamByFactory: (factory, division) => {
        const url = `/get-team-by-factory`;
        return axiosClient().get(url, {
            params: {
                FAC: factory,
                DIV: division,
            },
        });
    },

    getReceiptInSAPReport: (
        fromDate,
        toDate,
        plant,
        to,
        khoi,
        { signal } = {}
    ) => {
        const url = `/report/sanluongnhansap`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
                factory: plant,
                To: to,
                Khoi: khoi,
            },
            signal,
        });
    },

    getDeliveryDetailReportCBG: (
        statusCode,
        to,
        branch,
        plant,
        fromDate,
        toDate,
        { signal } = {}
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
            signal,
        });
    },

    getDeliveryDetailReportVCN: (
        statusCode,
        to,
        branch,
        plant,
        fromDate,
        toDate,
        { signal } = {}
    ) => {
        const url = `/report/vcn-chitietgiaonhan`;
        return axiosClient().get(url, {
            params: {
                status_code: statusCode,
                To: to,
                branch: branch,
                plant: plant,
                from_date: fromDate,
                to_date: toDate,
            },
            signal,
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

    getDefectResolutionReportPlywood: (plant, prodType, fromDate, toDate) => {
        const url = `/report/vcn-xulyloi`;
        return axiosClient().get(url, {
            params: {
                plant: plant,
                prod_type: prodType,
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

    getVCNFactory: () => {
        const url = `/vcn-factory`;
        return axiosClient().get(url);
    },

    getProductionVolumeByTime: (fromDate, toDate, { signal } = {}) => {
        const url = `/report/cbg-sanluongtheothoigian`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
            signal,
        });
    },

    getProductionVolumeByTimeVCN: (fromDate, toDate, { signal } = {}) => {
        const url = `/report/vcn-sanluongtheothoigian`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
            signal,
        });
    },

    getProductionVolumeByDay: (fromDate, toDate, { signal } = {}) => {
        const url = `/report/cbg-sanluongtheongay`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
            signal,
        });
    },

    getProductionVolumeByDayVCN: (fromDate, toDate, { signal } = {}) => {
        const url = `/report/vcn-sanluongtheongay`;
        return axiosClient().get(url, {
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
            signal,
        });
    },

    getImportExportInventoryByStage: (
        fromDate,
        toDate,
        factory,
        type,
        { signal } = {}
    ) => {
        const url = `/report/nhapxuattontheocongdoan`;
        return axiosClient().get(url, {
            params: {
                fromDate,
                toDate,
                factory,
                type,
            },
            signal,
        });
    },

    getProductionOutputByProductionOrder: (factory, type, { signal } = {}) => {
        const url = `/report/sanluongtheolenhsanxuat`;
        return axiosClient().get(url, {
            params: {
                factory,
                type,
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

    createReportReSolution: (data) => {
        const url = `/report/tao-bien-ban-xu-ly`;
        return axiosClient().post(url, data);
    },

    getReportSolution: (factory) => {
        const url = `/report/lay-danh-sach-bien-ban`;
        return axiosClient().get(url, {
            params: {
                factory
            }
        });
    },

    getReportSolutionById: (report_resolution_id) => {
        const url = `/report/lay-danh-sach-bien-ban-theo-id`;
        return axiosClient().get(url, {
            params: {
                report_resolution_id
            }
        });
    }
};

export default reportApi;
