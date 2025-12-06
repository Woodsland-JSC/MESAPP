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