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
};

export default palletsApi;
