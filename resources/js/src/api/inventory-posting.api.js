import axiosClient from "./axiosClient";

const BASEURL = `/sap/inventory-posting`;

export const inventoryPostingItems = (data) => {
    const url = `${BASEURL}/inventoryPostingItems`;
    return axiosClient().post(url, data);
}