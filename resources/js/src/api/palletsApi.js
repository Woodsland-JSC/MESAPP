import axiosClient from "./axiosClient";

const palletsApi = {
    getTypeOfWood: () => {
        const url = `/typeofwood`;
        return axiosClient().get(url, {});
    },
    getDryingMethod: () => {
        const url = `/items`;
        return axiosClient().get(url, {});
    },
    getDryingReason: () => {
        const url = `/reasons`;
        return axiosClient().get(url, {});
    },
    getStockByItem: (item, reason) => {
        const url = `/stock/${item}`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "SL", // default value = "SL"
            },
        });
    },
};

export default palletsApi;
