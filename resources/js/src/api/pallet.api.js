import axiosClient from "./axiosClient";

const BASEURL = `mes/pallet`;

export const getPalletReport = (params) => {
    return axiosClient().get(`${BASEURL}/getPalletReport`, {
        params: params
    });
}

export const getDryingQueue = (fromDate, toDate, factory) => {
    return axiosClient().get(`${BASEURL}/getPalletComplete`, {
        params: {
            fromDate: fromDate,
            toDate: toDate,
            factory: factory,
        },
    });
}