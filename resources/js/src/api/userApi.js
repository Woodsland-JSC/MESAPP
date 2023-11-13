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
        return axiosClient().get(url, {});
    },
    getAllUsers: () => {
        const url = `/users`;
        return axiosClient().get(url, {});
    },
    getUserDetails: () => {
        const url = `/getUser`;
        return axiosClient().get(url, {});
    },
};

export default usersApi;
