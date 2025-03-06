import axiosClient from "./axiosClient";

const domesticApi = {
    getProductionOrderList: () => {
        const url = `/noidia/lenh-san-xuat`;
        return axiosClient().get(url, {});
    },

    getProductsByProductionOrder: (id) => {
        const url = `/noidia/lenh-san-xuat/${id}`;
        return axiosClient().get(url, {
            params: {
                id,
            },
        });
    },

    handleReceipt: (transferData) => {
        const url = `/noidia/ghinhan-sanluong`;
        return axiosClient().post(url, transferData);
    },
};

export default domesticApi;
