import axiosClient from "./axiosClient";

const BASEURL = `/ORSC`;

export const layDanhSachToTheoNhaMayCBG = (factory) => {
    const url = `${BASEURL}/layDanhSachToTheoNhaMayCBG`;
    return axiosClient().get(url, {
        params: {
            factory
        }
    });
}

export const getTeamProductionByFactory = (factory) => {
    const url = `${BASEURL}/getTeamProductionByFactory`;
    return axiosClient().get(url, {
        params: {
            factory
        }
    });
}

export const getTeamCdoanHT = (factory) => {
    const url = `${BASEURL}/getTeamCdoanHT`;
    return axiosClient().get(url, {
        params: {
            factory
        }
    });
}