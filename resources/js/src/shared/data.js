export const LOAI_CHUNG_TU = [
    {
        value: 1,
        label: "Chứng từ nhập kho"
    },
    {
        value: 2,
        label: "Chứng từ QC"
    },
    {
        value: 3,
        label: "Chứng từ trả lại NCC"
    }
];

export const KILN_STATUS = {

}

export const KILN_STATUS_REVIEW = {

}

export const MES_PERMISSIONS_BASE = {
    "DIEUCHUYENBINKHO": "dieuchuyenbinkho",
    "BCDAND_XULYLOI": "BCDAND_xulyloi",
    "BCDAND_CHITIETGIAONHAN": "BCDAND_chitietgiaonhan",
    "BCVCN_XULYLOI": "BCVCN_xulyloi",
    "BCVCN_CHITIETGIAONHAN": "BCVCN_chitietgiaonhan",
    "BCCBG_XULYLOI": "BCCBG_xulyloi",
    "BCCBG_CHITIETGIAONHAN": "BCCBG_chitietgiaonhan",
    "BCSAY_XEPCHOSAY": "BCSAY_xepchosay",
    "BCSAY_XEPSAY": "BCSAY_xepsay",
    "BCSAY_TONSAYLUA": "BCSAY_tonsaylua",
    "BCSAY_LODANGSAY": "BCSAY_lodangsay",
    "BCSAY_KEHOACHSAY": "BCSAY_kehoachsay",
    "BCSAY_BIENBANKIEMTRALOSAY": "BCSAY_bienbankiemtralosay",
    "BCSAY_BIENBANLICHSUVAOLO": "BCSAY_bienbanlichsuvaolo",
    "BCSAY_BIENBANVAOLO": "BCSAY_bienbanvaolo",
    "QUANLYROLE": "quanlyrole",
    "QUANLYUSER": "quanlyuser",
    "TDLDND": "TDLDND",
    "DAND(CX)": "DAND(CX)",
    "DAND": "DAND",
    "QCVCN": "QCVCN",
    "VCN(CX)": "VCN(CX)",
    "VCN": "VCN",
    "QCCBG": "QCCBG",
    "CBG(CX)": "CBG(CX)",
    "CBG": "CBG",
    "DANHGIAME": "danhgiame",
    "LOSAY": "losay",
    "KIEMTRALO": "kiemtralo",
    "VAOLO": "vaolo",
    "KEHOACHSAY": "kehoachsay",
    "XEPSAY": "xepsay"
}

export const FACTORIES = {
    TH: {
        value: "TH",
        label: "Thuận Hưng"
    },
    YS: {
        value: "YS",
        label: "Yên Sơn"
    },
    TB: {
        value: "TB",
        label: "Thái Bình"
    }
}

export const VAN_CONG_NGHIEP = "VCN";
export const CHE_BIEN_GO = "CBG";

export const COMPLETE_PALLET_STATUS = {
    ALL: 0,
    COMPLETE: 1,
    UN_COMPLETE: 2
}

export const DRYING_PERMISSIONS = [
    {
        value: "xepsay",
        name: "Tạo pallet xếp sấy",
        description: "Chất gỗ lên pallet để chuẩn bị đưa vào lò",
    },
    {
        value: "kehoachsay",
        name: "Tạo kế hoạch sấy",
        description: "Chọn lò và đặt một kế hoạch sấy",
    },
    {
        value: "vaolo",
        name: "Vào lò",
        description: "Cho pallet vào lò để chuẩn bị sấy",
    },
    {
        value: "kiemtralo",
        name: "Kiểm tra lò sấy",
        description: "Kiểm tra lò trước khi bắt đầu sấy",
    },
    {
        value: "losay",
        name: "Lò sấy",
        description: "Bắt đầu giai đoạn sấy",
    },
    {
        value: "danhgiame",
        name: "Đánh giá mẻ sấy",
        description: "Đánh giá mẻ sấy trong lò",
    },
    {
        value: "xacnhanlosay",
        name: "Xác nhận hoàn thành lò",
        description: "Xác nhận hoàn thành lò",
    },
    {
        value: "xulypallet",
        name: "Xử lý Pallet",
        description: "Xử lý Pallet trong lò",
    }
];