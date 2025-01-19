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

    getDefaultBinItemsByWarehouse: (warehouse) => {
      const url = `/get-default-bin-items-by-warehouse`;
      return axiosClient().get(url, {
          params: {
              warehouse,
          },
      });
  },
};

export default goodsManagementApi;