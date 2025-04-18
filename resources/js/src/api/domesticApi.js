import axiosClient from "./axiosClient";

const domesticApi = {
    getProductionOrderList: () => {
        const url = `/noidia/lenh-san-xuat`;
        return axiosClient().get(url, {});
    },

    getProductsByProductionOrder: (id) => {
        const url = `/noidia/lenh-san-xuat/${id}`;
        return axiosClient().get(url, {
            params: {
                id,
            },
        });
    },

    handleReceipt: (transferData) => {
        const url = `/noidia/ghinhan-sanluong`;
        return axiosClient().post(url, transferData);
    },

    getAllAssemblyDiagrams: () => {
        const url = `/noidia/danh-sach-masd`;
        return axiosClient().get(url, {});
    },

    executeAssemblyDiagrams: (assemblyDiagrams) => {
        const url = `/noidia/update-status-masd`;
        return axiosClient().post(url, assemblyDiagrams);
    },

    getAllProject: () => {
        const url = `/noidia/du-an`;
        return axiosClient().get(url, {});
    },

    getApartmentByProjectId: (id) => {
        const url = `/noidia/can-ho`;
        return axiosClient().get(url, {
            params: {
                PrjCode: id
            },
        });
    },

    getProcessByApartmentId: (projectId, apartmentId) => {
        const url = `/noidia/tien-do-lap-dat`;
        return axiosClient().get(url, {
            params: {
                PrjCode: projectId,
                MaCan: apartmentId
            },
        });
    },

    receiveProcess: (payload) => {
        const url = `/noidia/tien-do-lap-dat`;
        return axiosClient().post(url, payload);
    }
};

export default domesticApi;
