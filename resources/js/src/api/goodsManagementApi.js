import axiosClient from "./axiosClient";

const goodsManagementApi = {
    getBinManagedWarehouse: () => {
        const url = `/get-bin-managed-warehouse`;
        return axiosClient().get(url, {});
    },

    getBinByWarehouse: (warehouse) => {
        const url = `/get-bin-by-warehouse`;
        return axiosClient().get(url, {
            params: {
                warehouse,
            },
        });
    },

    getAllBinByWarehouse: (warehouse) => {
        const url = `/get-all-bin-by-warehouse`;
        return axiosClient().get(url, {
            params: {
                warehouse,
            },
        });
    },

    getItemsByBin: (warehouse, bin) => {
        const url = `/get-item-by-bin`;
        return axiosClient().get(url, {
            params: {
                warehouse,
                bin,
            },
        });
    },

    getDefaultBinItemsByWarehouse: (warehouse) => {
        const url = `/get-default-bin-items-by-warehouse`;
        return axiosClient().get(url, {
            params: {
                warehouse,
            },
        });
    },

    getBatchByItemDefaultBin: (warehouse, code) => {
        const url = `/get-batch-by-item-default-bin`;
        return axiosClient().get(url, {
            params: {
                warehouse,
                code,
            },
        });
    },

    getBatchByItem: (warehouse, bin, code) => {
        const url = `/get-batch-by-item`;
        return axiosClient().get(url, {
            params: {
                warehouse,
                bin,
                code,
            },
        });
    },

    handleStockTransfer: (transferData) => {
        const url = `/stock-transfer`;
        return axiosClient().post(url, transferData);
    },
};

export default goodsManagementApi;
