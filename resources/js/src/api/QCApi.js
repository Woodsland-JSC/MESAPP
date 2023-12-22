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
};

export default QCApi;
