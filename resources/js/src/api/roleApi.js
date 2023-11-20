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
        const formData = new FormData();
        formData.append("first_name", rolesData.firstName);
        formData.append("last_name", rolesData.lastName);
        formData.append("gender", rolesData.gender);
        formData.append("email", rolesData.email);
        formData.append("password", rolesData.password);
        formData.append("plant", rolesData.factory);
        formData.append("sap_id", rolesData.sapId);
        formData.append("integration_id", rolesData.integrationId);
        formData.append("roles", rolesData.authorization);
        formData.append("branch", rolesData.branch);
        formData.append("avatar", rolesData.avatar ? rolesData.avatar : "");

        return axiosClient().post(url, formData);
    },
    updateRole: (rolesId, rolesData) => {
        const url = `/roless/update/${rolesId}`;
        const formData = new FormData();
        formData.append("_method", "patch");
        formData.append("first_name", rolesData.firstName);
        formData.append("last_name", rolesData.lastName);
        formData.append("gender", rolesData.gender);
        formData.append("email", rolesData.email);
        formData.append("password", rolesData.password);
        formData.append("plant", rolesData.factory);
        formData.append("sap_id", rolesData.sapId);
        formData.append("integration_id", rolesData.integrationId);
        formData.append("roles", rolesData.authorization);
        formData.append("branch", rolesData.branch);
        formData.append("avatar", rolesData.avatar ? rolesData.avatar : "");

        return axiosClient().post(url, formData);
    },
    deleteRole: (roleId) => {
        const url = `/roles/delete/${roleId}`;
        return axiosClient().delete(url);

    }
};

export default roleApi;
