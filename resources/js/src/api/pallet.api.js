import axiosClient from "./axiosClient";

const BASEURL = `mes/pallet`;

export const getPalletReport = (params) => {
    return axiosClient().get(`${BASEURL}/getPalletReport`, {
        params: params
    });
}