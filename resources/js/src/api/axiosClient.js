import axios from "axios";

const axiosClient = (authToken) => {
    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        withCredentials: true,
        Authorization: authToken ? authToken : "",
    };

    const client = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
        headers,
    });

    client.interceptors.request.use(async (config) => {
        if (config.data instanceof FormData) {
            config.headers["Content-Type"] = "multipart/form-data";
        }

        return config;
    });

    client.interceptors.response.use(
        (response) => {
            if (response && response.data) {
                return response.data;
            }

            return response;
        },
        (error) => {
            if (error.response && (error.response.status === 401)) {
                localStorage.removeItem("userInfo");
    
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
            throw error;
        }
    );

    return client;
};

export default axiosClient;
