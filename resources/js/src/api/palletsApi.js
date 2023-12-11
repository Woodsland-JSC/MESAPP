import axiosClient from "./axiosClient";

const palletsApi = {
    getTypeOfWood: () => {
        const url = `/typeofwood`;
        return axiosClient().get(url, {});
    },
    getDryingMethod: () => {
        const url = `/items`;
        return axiosClient().get(url, {});
    },
    getDryingReason: () => {
        const url = `/reasons`;
        return axiosClient().get(url, {});
    },
    getStockByItem: (item, reason) => {
        const url = `/stock/${item}`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "SL",
            },
        });
    },
    getKiln: () => {
        const url = `ovens/`;
        return axiosClient().get(url, {});
    },
    getThickness: (reason) => {
        const url = `/dryingmethod`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "INDOOR"
            },
        });
    },
    getPlanDryingReason: () => {
        const url = `/oven-reasons`;
        return axiosClient().get(url, {});
    },
    getBOWList: () => {
        const url = `/ovens/listproduction`;
        return axiosClient().get(url, {});
    },
    getBOWById: (id) => {
        const url = `/ovens/production-detail/${id}`;
        return axiosClient().get(url, {});
    },
    getPalletList: (reason) => {
        const url = `/ovens/production-batch`;
        return axiosClient().get(url, {
            params: {
                reason: reason || "OUTDOOR"
            },
        });
    },
    loadIntoKiln: () => {
        const url = `/ovens/production-batch`;
        return axiosClient().post(url, {});
    },
    saveCheckingKiln: (data) => {
        const url = `/ovens/production-check-single`;
        return axiosClient().patch(url, data);
    },
    addHumidRecord: (data) => {
        const url = `/dgm/ghinhandoam`;
        return axiosClient().post(url, data);
    },
    removeHumidRecord: (deleteData) => {
        const url = `/dgm/deleteDoAm`;
        return axiosClient().delete(url, { data: deleteData });
    },
    getHumidListById: (PlanID) => {
        const url = `/dgm/gethumidlistbyid`;
        return axiosClient().get(url, {
            params: {
                PlanID,
            },
        });
    },
    getDisabledListById: (PlanID) => {
        const url = `/dgm/getdisabledlistbyid`;
        return axiosClient().get(url, {
            params: {
                PlanID,
            },
        });
    },
    getTempHumidRecords: (PlanID, Type) => {
        const url = `/dgm/giatrihientai`;
        return axiosClient().get(url, {
            params: {
                PlanID,
                Type : "DA"
            },
        });
    },   
    getTempDisabledRecords: (PlanID, Type) => {
        const url = `/dgm/giatrihientai`;
        return axiosClient().get(url, {
            params: {
                PlanID,
                Type : "KT"
            },
        });
    },   
    completeHumidRecord: (data) => {
        const url = `/dgm/hoanthanhdoam`;
        return axiosClient().post(url, data);
    },
    addDisabledRecord: (data) => {
        const url = `dgm/ghinhankt`;
        return axiosClient().post(url, data);
    },
    addDisabledRecord: (data) => {
        const url = `dgm/ghinhankt`;
        return axiosClient().post(url, data);
    },
    completeDisabledRecord: (data) => {
        const url = `dgm/hoanthanhkt`;
        return axiosClient().post(url, data);
    },
};

export default palletsApi;
