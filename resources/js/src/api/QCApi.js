import axiosClient from "./axiosClient";

const QCApi = {
  getCBGProcesses: () => {
    const url = `/danhsachto`;
    return axiosClient().get(url, {});
  },
  getCBGDefects: () => {
    const url = `/loailoi`;
    return axiosClient().get(url, {});
  },
  getQcCBG: (filter) => {
    const url = `/purchase/qc-cbg`;
    return axiosClient().get(url, {
      params: filter
    });
  },
  getQcCBGDetail: (sapId) => {
    const url = `/purchase/qc-cbg/${sapId}`;
    return axiosClient().get(url, {});
  },
  getQcDetail: (sapId, lineId) => {
    const url = `/purchase/qc-cbg/detail/${sapId}/${lineId}`;
    return axiosClient().get(url, {});
  },
  getQCType: () => {
    const url = `/qc-type`;
    return axiosClient().get(url, {});
  },
  getGQC: (qcFilter) => {
    const url = `/b1s/v1/GQC`;
    return axiosClient().get(url, {
      params: qcFilter
    });
  },
  insertQC: (data) => {
    const url = `/purchase/insert-qc`;
    return axiosClient().post(url, data);
  },
  deleteQC: (id, sapId, lineId) => {
    const url = `/purchase/delete-qc`;
    return axiosClient().delete(url, {
      params: {
        id,
        sapId,
        lineId
      }
    })
  },
  getChungTuQC: (filter) => {
    const url = `/purchase/chung-tu-qc`;
    return axiosClient().get(url, {
      params: filter
    });
  },
  getChungTuTraLaiQC: (filter) => {
    const url = `/purchase/chung-tu-tra-lai-qc`;
    return axiosClient().get(url, {
      params: filter
    });
  },
  getNLGTraLaiNCC: (sapId) => {
    const url = `/purchase/nlg-qcr/${sapId}`;
    return axiosClient().get(url);
  },
  qcReturn: (data) => {
    const url = `/qc-quantity-return`;
    return axiosClient().post(url, data);
  },
  qcReturnAll: (data) => {
    const url = `/qc-quantity-return-all`;
    return axiosClient().post(url, data);
  },
};

export default QCApi;
