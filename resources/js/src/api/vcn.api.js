import axiosClient from "./axiosClient";

const BASEURL = `/vcn`;

export const layKetCauVCNTheoLSX = (lsx) => {
    const url = `${BASEURL}/ket-cau/${lsx}`;
    return axiosClient().get(url, {});
}