import axiosClient from "./axiosClient";

const BASEURL = `/mes/humidity-error`;

export const getDataByFactory = (factory) => {
    const url = `${BASEURL}/getDataByFactory`;
    return axiosClient().get(url, {
        params: {
            factory
        }
    });
}