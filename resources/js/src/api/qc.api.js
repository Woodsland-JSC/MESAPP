import axiosClient from "./axiosClient";

const BASEURL = `mes/qc`;

export const getAllWhQC = () => {
    const url = `${BASEURL}/getAllWhQC`;
    return axiosClient().get(url);
}

export const getItemByWhQC = (params) => {
    const url = `${BASEURL}/getItemByWhQC`;
    return axiosClient().get(url, {
        params
    });
}

export const getWhSL = () => {
    const url = `${BASEURL}/getWhSL`;
    return axiosClient().get(url);
}

export const handleSL = (data) => {
    const url = `${BASEURL}/handleSL`;
    return axiosClient().post(url, data);
}

export const handleItemsCH = (data) => {
    const url = `${BASEURL}/handleCH`;
    return axiosClient().post(url, data);
}

export const baoLoiSayAm = (data) => {
    const url = `${BASEURL}/baoLoiSayAm`;
    return axiosClient().post(url, data);
}