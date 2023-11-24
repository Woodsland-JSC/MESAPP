import axiosClient from "./axiosClient";

const productionApi = {
    getFinishedGoodsList: () => {
        const url = `/production/receipts-production`;
        return axiosClient().get(url);
    },
    enterFinishedGoodsAmount: (data) => {
        const url = `/production/receipts-production`;
        return axiosClient().post(url, data);
    }
};

export default productionApi;
