import React from "react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

const checks = [
    {
        no: "1",
        title: "1. Vệ sinh lò sấy",
        description: "Sạch sẽ, không có các vật thể lạ trong lò",
    },
    {
        no: "2",
        title: "2 .Không bị rò rỉ nước",
        description: "Giàn nhiệt kín không bị rò rỉ nước",
    },
    {
        no: "3",
        title: "3 .Hệ thống gia nhiệt",
        description: "Van nhiệt đóng mở đúng theo tín hiệu điện Giàn nhiệt không bị rò rỉ nhiệt ra ngoài",
    },
    {
        no: "4",
        title: "4 .Hệ thống điều tiết ẩm",
        description: "Ống phun ầm phải ở dạng sương, không được phun thành tia",
    },
    {
        no: "5",
        title: "5 .Đầu đo đo độ ẩm gỗ",
        description: "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu",
    },
    {
        no: "6",
        title: "6 .Cửa thoát ẩm",
        description: "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt",
    },
    {
        no: "7",
        title: "7 .Giấy cảm biến đo EMC",
        description: "Tối đa 3 lượt sấy phải thay giấy mới",
    },
    {
        no: "8",
        title: "8 .Cảm biến nhiệt độ trong lò sấy",
        description: "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Dùng súng bắn nhiệt đo nhiệt độ thực tế trong lò)"
    },
    {
        no: "9",
        title: "Van hơi, Van nước hồi",
        description: "Kín, không bị rò rỉ",
    },
    {
        no: "10",
        title: "10 .Đinh, dây đo độ ẩm",
        description: "Hoạt động tốt",
    },
    {
        no: "11",
        title: "11 .Chiều dày thực tế",
        description: "Kiểm tra 5 palet ngẫu nhiên,mỗi palet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm)",
    },
    {
        no: "12",
        title: "12 .Động cơ quạt gió Tốc độ gió quạt",
        description: "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều",
    },
];

function CheckCard(props) {
    const { no, title, description } = props;

    return (
        <div className="bg-[#F7FDFF] rounded-xl w-full h-[10rem] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] border border-gray-200">
            <div className="px-4 py-3 flex bg-[#F1F8FB] rounded-t-xl justify-between border-b border-gray-200">
                <div className="tx-[#155979] font-semibold">1. Vệ sinh lò sấy</div>
                <Checkbox size='lg' colorScheme="blue">
                    ĐẠT
                </Checkbox>
            </div>

            <div className=" px-4 py-2">Sạch sẽ, không có các vật thể lạ trong lò</div>
        </div>
    );
}

export default CheckCard;
