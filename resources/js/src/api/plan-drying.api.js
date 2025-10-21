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