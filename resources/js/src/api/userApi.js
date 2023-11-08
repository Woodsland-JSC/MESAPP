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
    getUserDetails: (token) => {
        const url = `/getUser`;
        return axiosClient(token).get(url, {});
    },
};

export default usersApi;
