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

        const url = `/production/receipts-productions?${queryStringParams}`;
        return axiosClient().get(url);
    },
    enterFinishedGoodsAmount: (data) => {
        const url = `/production/receipts-productions`;
        return axiosClient().post(url, data);
    },
};

export default productionApi;
