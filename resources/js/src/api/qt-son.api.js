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