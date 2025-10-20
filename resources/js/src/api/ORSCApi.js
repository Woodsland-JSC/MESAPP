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