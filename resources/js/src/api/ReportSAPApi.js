import axiosClient from "./axiosClient";

const BASEURL = `sap/report`;

export const baoCaoSanLuongQuyDoiCBG = (params) => {
    const url = `${BASEURL}/baoCaoSanLuongQuyDoiCBG`;
    return axiosClient().get(url, {
        params: params
    });
}

export const baoCaoQuyLuongCBG = (params) => {
    const url = `${BASEURL}/bao-cao-quy-luong-cbg`;
    return axiosClient().get(url, {
        params: params
    });
}