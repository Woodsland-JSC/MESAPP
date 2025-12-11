import axiosClient from "./axiosClient";

const BASEURL = `/sap/OITW`;

export const getItemsByFactory = (whCode) => {
    const url = `${BASEURL}/getItemsByFactory`;
    return axiosClient().get(url, {
        params: {
            whCode
        }
    });
}

export const getItemsSFByWh = (whCode) => {
    const url = `${BASEURL}/getItemsSFByWh`;
    return axiosClient().get(url, {
        params: {
            whCode
        }
    });
}