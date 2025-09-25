import axiosClient from "./axiosClient";

const ProductionOrderPrefix = `/production-order`;

const ProductionOrderApi = {
    getProductionOrders: (param = {}) => {
        const url = `${ProductionOrderPrefix}/list-production-order`;

        return axiosClient().get(url, {
            params: param
        });
    },
    getProductionOrderDetail: (productionOrderId, param = {}) => {
        const url = `${ProductionOrderPrefix}/detail-production-order/${productionOrderId}`;

        return axiosClient().get(url, {
            params: param
        });
    }
}

export default ProductionOrderApi;