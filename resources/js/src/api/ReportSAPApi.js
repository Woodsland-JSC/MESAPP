import axiosClient from "./axiosClient";

const BASEURL = `sap/report`;

export const baoCaoSanLuongQuyDoiCBG = (params) => {
    const url = `${BASEURL}/baoCaoSanLuongQuyDoiCBG`;
    return axiosClient().get(url, {
        params: params
    });
}