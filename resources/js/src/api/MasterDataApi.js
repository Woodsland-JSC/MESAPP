import axiosClient from "./axiosClient";

const BASEURL = `/sap/masterdata`;

export const danhSachNhaMayCBG = () => {
    const url = `${BASEURL}/danhSachNhaMayCBG`;
    return axiosClient().get(url, {
        params: {}
    });
}

export const factoryNDByUser = (branchId) => {
    const url = `${BASEURL}/factoryNDByUser`;
    return axiosClient().get(url, {
        params: {
            branchId
        }
    });
}

export const getFactoryUTub = (branchId) => {
    const url = `${BASEURL}/getFactoryUTub`;
    return axiosClient().get(url, {
        params: {
            branchId
        }
    });
}

export const getTeamUTub = (factory) => {
    const url = `${BASEURL}/getTeamUTub`;
    return axiosClient().get(url, {
        params: {
            factory
        }
    });
}