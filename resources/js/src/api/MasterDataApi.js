import axiosClient from "./axiosClient";

const BASEURL = `/sap/masterdata`;

export const danhSachNhaMayCBG = () => {
    const url = `${BASEURL}/danhSachNhaMayCBG`;
    return axiosClient().get(url, {
        params: {}
    });
}