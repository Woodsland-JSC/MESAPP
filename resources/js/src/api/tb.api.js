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

export const acceptReceiptTB = (data) => {
    return axiosClient().post(`${BASEURL}/acceptReceiptTB`, data);
}

export const confirmAcceptReceipt = (data) => {
    return axiosClient().post(`${BASEURL}/confirmAcceptReceipt`, data);
}

export const confirmRejectTB = (data) => {
    return axiosClient().post(`${BASEURL}/confirmRejectTB`, data);
}

export const checkReceiptTB = (params) => {
    return axiosClient().get(`${BASEURL}/checkReceiptTB`, {
        params
    });
}

export const deleteNoti = (params) => {
    return axiosClient().delete(`${BASEURL}/delete`, {
        params
    });
}