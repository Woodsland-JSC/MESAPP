import axiosClient from "./axiosClient";
import axios from "axios";

const roleApi = {
    getAllRole: () => {
        // const url = `/roles?pageSize=${pageSize}&page=${page}`;
        const url = `/roles`;
        return axiosClient().get(url);
    },
    getAllPermission: () => {
        const url = `/permissions`;
        return axiosClient().get(url);
    },
    getRoleDetails: (id) => {
        const url = `/roles/find/${id}`;
        return axiosClient().get(url);
    },
    createRole: (rolesData) => {
        const url = `/roles/create`;
        return axiosClient().post(url, rolesData);
    },
    updateRole: (rolesId, rolesData) => {
        const url = `/roles/update/${rolesId}`;
        return axiosClient().patch(url, rolesData);
    },
    getRoleById: (rolesId) => {
        const url = `/roles/detail/${rolesId}`;
        return axiosClient().get(url);
    },
    deleteRole: (roleId) => {
        const url = `/roles/delete/${roleId}`;
        return axiosClient().delete(url, {});
    },
};

export default roleApi;
