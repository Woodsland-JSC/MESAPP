import axiosClient from "./axiosClient";

const productionApi = {
    getFinishedGoodsList: (params) => {
        const queryStringParams = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        params[key]
                    )}`
            )
            .join("&");

        // const url = `/v2/production/receipts-productions?${queryStringParams}`;
        const url = `/production/receipts-productions?${queryStringParams}`; 
        return axiosClient().get(url);
    },
    getFinishedGoodsListByGroup: (param) => {
        const url = `/list-qc-cbg`;
        return axiosClient().get(url, {
            params: {
                TO: param,
            },
        });
    },
    getFinishedPlywoodGoodsList: (params) => {
        const queryStringParams = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        params[key]
                    )}`
            )
            .join("&");

        const url = `/vcn/receipts-productions?${queryStringParams}`;
        return axiosClient().get(url);
    },
    getFinishedGoodsDetail: (params) => {
        const queryStringParams = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        params[key]
                    )}`
            )
            .join("&");

        // const url = `/v2/production/receipts-productions-detail?${queryStringParams}`;
        const url = `/production/receipts-productions-detail?${queryStringParams}`;
        return axiosClient().get(url);
    },
    getFinishedPlywoodGoodsDetail: (params) => {
        const queryStringParams = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        params[key]
                    )}`
            )
            .join("&");

        const url = `/vcn/receipts-productions-detail?${queryStringParams}`;
        return axiosClient().get(url);
    },
    getFinishedRongPlywoodGoodsDetail: (params) => {
        const queryStringParams = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        params[key]
                    )}`
            )
            .join("&");

        const url = `/vcn/receipts-detail-rong?${queryStringParams}`;
        return axiosClient().get(url);
    },
    enterFinishedGoodsAmountCBG: (data) => {
        const url = `/production/receipts-production`;
        return axiosClient().post(url, data);
    },
    enterFinishedGoodsAmountVCN: (data) => {
        // const url = `/v2/production/receipts-production`;
        const url = `/vcn/receipts-production`;
        return axiosClient().post(url, data);
    },
    enterFinishedRongAmountVCN: (data) => {
        // const url = `/v2/production/receipts-production`;
        const url = `/vcn/receipts-productions-rong`;
        return axiosClient().post(url, data);
    },
    deleteReceiptCBG: (payload) => {
        const url = `/production/remove-receipt`;
        return axiosClient().delete(url, { data: payload });
    },
    rejectReceiptsCBG: (data) => {
        const url = `/production/reject-receipts`;
        return axiosClient().post(url, data);
    },
    rejectReceiptsVCN: (data) => {
        const url = `/production/reject-receipts`;
        return axiosClient().post(url, data);
    },
    acceptReceiptsCBG: (data) => {
        // const url = `/v2/production/accept-receipts`;
        const url = `/production/accept-receipts`;
        return axiosClient().post(url, data);
    },
    acceptReceiptsCBGQC: (data) => {
        // const url = `/v2/confirm-qc-cbg`;
        const url = `/confirm-qc-cbg`;
        return axiosClient().post(url, data);
    },
    acceptReceiptsVCN: (data) => {
        const url = `/production/accept-receipts-vcn`;
        return axiosClient().post(url, data);
    },
    getErrorTypes: () => {
        const url = `/loailoi`;
        return axiosClient().get(url);
    },
    // Type: ["CBG", "VCN"]
    getSolutions: (type) => {
        const url = `/huongxuly?type=${type}`;
        return axiosClient().get(url);
    },
    getGroup: () => {
        const url = `/danhsachto`;
        return axiosClient().get(url);
    },
    getAllGroupWithoutQC: () => {
        const url = `/getlist-team-exclude-qc`;
        return axiosClient().get(url);
    },
    getTeamBacks: () =>
    {
        const url =`/production/allteam`
        return axiosClient().get(url);
    },
    getRootCauses: () =>
    {
        const url =`/production/rootCause`
        return axiosClient().get(url);
    },
    getReturnCode: () =>
    {
        const url =`/items-route`
        return axiosClient().get(url);
    }
};

export default productionApi;
