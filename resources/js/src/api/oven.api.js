import axiosClient from "./axiosClient";

const BASEURL = `sap/oven`;

export const getOvensByFactory = (factory) => {
    return axiosClient().get(`${BASEURL}/getOvensByFactory`, {
        params: {
            factory
        }
    });
}