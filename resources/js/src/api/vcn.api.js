import axiosClient from "./axiosClient";

const BASEURL = `/vcn`;

const BASEURL_SAP = `/sap/vcn`;

export const layKetCauVCNTheoLSX = (lsx) => {
    const url = `${BASEURL}/ket-cau/${lsx}`;
    return axiosClient().get(url, {});
}

export const layVatTuVCNTheoLSX = (lsx) => {
    const url = `${BASEURL}/vat-tu/${lsx}`;
    return axiosClient().get(url, {});
}

export const receiptsProductionsDetail = ({
    SPDICH,
    ItemCode,
    TO,
    Version,
    ProdType,
    LSX
}) => {
    const url = `${BASEURL_SAP}/receiptsProductionsDetail`;
    return axiosClient().get(url, {
        params: {
            SPDICH,
            ItemCode,
            TO,
            Version,
            ProdType,
            LSX
        }
    });
}

export const receiptsProductionsDetailRong = ({
    FatherCode,
    TO,
    version,
    ProdType,
    LSX
}) => {
    const url = `${BASEURL_SAP}/receiptsProductionsDetailRong`;
    return axiosClient().get(url, {
        params: {
            FatherCode,
            TO,
            version,
            ProdType,
            LSX
        }
    });
}

export const ghiNhanSanLuongVCN = (data) => {
    const url = `${BASEURL_SAP}/ghiNhanSanLuongVCN`;
    return axiosClient().post(url, data);
}

