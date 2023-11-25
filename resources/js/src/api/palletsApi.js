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
                reason: reason || "SL",
            },
        });
    },
    getKiln: () => {
        const url = `ovens/`;
        return axiosClient().get(url, {});
    },
    getThickness: (reason) => {
        const url = `/dryingmethod`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "INDOOR"
            },
        });
    },
    getPlanDryingReason: () => {
        const url = `/oven-reasons`;
        return axiosClient().get(url, {});
    },
    getBOWList: () => {
        const url = `/ovens/listproduction`;
        return axiosClient().get(url, {});
    },
    getBOWById: (id) => {
        const url = `/ovens/production-detail/${id}`;
        return axiosClient().get(url, {});
    },
    getPalletList: (reason) => {
        const url = `/ovens/production-batch`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "OUTDOOR"
            },
        });
    },
    loadIntoKiln: () => {
        const url = `/ovens/production-batch`;
        return axiosClient().post(url, {});
    }
    
};

export default palletsApi;
