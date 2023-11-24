import axiosClient from "./axiosClient";

const usersApi = {
    login: (email, password) => {
        const url = `/login`;
        return axiosClient().post(url, {
            email,
            password,
        });
    },
    register: (email, password) => {
        const url = `/signup`;
        return axiosClient().post(url, {
            email,
            password,
        });
    },
    signOut: () => {
        const url = `/logout`;
        return axiosClient().get(url);
    },
    getAllUsers: () => {
        // const url = `/users?pageSize=${pageSize}&page=${page}`;
        const url = `/users`;
        return axiosClient().get(url);
    },
    getUserDetails: (id) => {
        const url = `/users/find/${id}`;
        return axiosClient().get(url);
    },
    createUser: (userData) => {
        const url = `/users/create`;
        const formData = new FormData();
        formData.append("first_name", userData.firstName);
        formData.append("last_name", userData.lastName);
        formData.append("gender", userData.gender);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("plant", userData.factory);
        formData.append("sap_id", userData.sapId);
        formData.append("integration_id", userData.integrationId);
        formData.append("roles", userData.authorization);
        formData.append("branch", userData.branch);
        formData.append("avatar", userData.avatar ? userData.avatar : "");

        return axiosClient().post(url, formData);
    },
    updateUser: (userId, userData) => {
        const url = `/users/update/${userId}`;
        const formData = new FormData();
        formData.append("_method", "patch");
        formData.append("first_name", userData.firstName);
        formData.append("last_name", userData.lastName);
        formData.append("gender", userData.gender);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("plant", userData.factory);
        formData.append("sap_id", userData.sapId);
        formData.append("integration_id", userData.integrationId);
        formData.append("roles", userData.authorization);
        formData.append("branch", userData.branch);
        formData.append("avatar", userData.avatar ? userData.avatar : "");

        return axiosClient().post(url, formData);
    },
    blockUser: (userId) => {
        const url = `/users/disable/${userId}`;
        return axiosClient().patch(url);

    },
    getAllBranches: () => {
        const url = `/branch`;
        return axiosClient().get(url);
    },
    getAllSapId: () => {
        const url = `/user-sap`;
        return axiosClient().get(url);
    },
    getFactoriesByBranchId: (branchId) => {
        const url = `/factorybybranch/${branchId}`;
        return axiosClient().get(url);
    },
    // deleteUser: (userId) => {
    //     const url = `/users/delete/${userId}`;
    //     return axiosClient().delete(url);

    // }
};

export default usersApi;
