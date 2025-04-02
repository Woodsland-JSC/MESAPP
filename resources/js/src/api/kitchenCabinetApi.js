import axiosClient from "./axiosClient";

const domesticApi = {
    getProductionOrderList: () => {
        const url = `/tubep/lenh-san-xuat`;
        return axiosClient().get(url, {});
    },

    getAllStage: () => {
        const url = `/tubep/ds-cong-doan`;
        return axiosClient().get(url, {});
    },

    getProductsByProductionOrder: (id, stage) => {
        const url = `/tubep/chi-tiet-lenh`;
        return axiosClient().get(url, {
            params: {
                LSX: id,
                CD: stage
            },
        });
    },

    handleReceipt: (transferData) => {
        const url = `/tubep/ghinhan-sanluong`;
        return axiosClient().post(url, transferData);
    },
};

export default domesticApi;
