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

export const bao_cao_ton_say_lua = (params) => {
    const url = `${BASEURL}/bao-cao-ton-say-lua`;
    return axiosClient().get(url, {
        params: params
    });
}