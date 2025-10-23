import axiosClient from "./axiosClient";

const BASEURL = `mes/pallet-log`;

export const getLogsByFactory = (params) => {
    return axiosClient().get(`${BASEURL}/getLogsByFactory`, {
        params: params
    });
}