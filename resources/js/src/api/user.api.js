import axiosClient from "./axiosClient";

const BASEURL = `mes/users`;

export const getUserStock = (params = {}) => {
    return axiosClient().get(`${BASEURL}/danhSachThuKho`, {
        params: params
    });
}