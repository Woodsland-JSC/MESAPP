import axiosClient from "./axiosClient";

const BASEURL = `sap/tb`;

export const sanLuongTB = (params) => {
    return axiosClient().get(`${BASEURL}/sanLuongTB`, {
        params
    });
}

export const viewDetail = (params) => {
    return axiosClient().get(`${BASEURL}/viewDetail`, {
        params
    });
}

