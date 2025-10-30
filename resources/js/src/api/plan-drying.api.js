import axiosClient from "./axiosClient";

const BASEURL = `mes/plan-drying`;

export const sendPlanDryingToStockController = (params) => {
    return axiosClient().get(`${BASEURL}/sendPlanDryingToStockController`, {
        params: params
    });
}

export const getAllPlantInPlanDrying = () => {
    return axiosClient().get(`${BASEURL}/getAllPlantInPlanDrying`, {});
}

export const getPlanDryingByFactory = (plantId) => {
    return axiosClient().get(`${BASEURL}/getPlanDryingByFactory`, {
        params: {
            plantId
        }
    });
}

export const getPalletsByPlanDrying = (planId) => {
    return axiosClient().get(`${BASEURL}/getPalletsByPlanId`, {
        params: {
            planId
        }
    });
}

export const movePalletToPlanDrying = (data) => {
    return axiosClient().post(`${BASEURL}/movePalletToPlanDrying`, {
        data
    });
}

export const removePallets = (data) => {
    return axiosClient().post(`${BASEURL}/removePallets`, data);
}

export const removePlanDryingById = (id) => {
    return axiosClient().delete(`${BASEURL}/removePlanDrying`, {
        params: {
            id
        }
    });
}