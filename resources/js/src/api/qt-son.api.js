import axiosClient from "./axiosClient";

const BASEURL = `/sap/qt-son`;

export const getStepsQT = (itemCode) => {
    const url = `${BASEURL}/getStepsQT`;
    return axiosClient().get(url, {
        params: {
            itemCode
        }
    });
}

export const insertQT = (data) => {
    const url = `${BASEURL}/insert`;
    return axiosClient().post(url, data);
}

export const findItem = (value) => {
    const url = `${BASEURL}/findItem`;
    return axiosClient().get(url, {
        params: {
            value
        }
    });
}

