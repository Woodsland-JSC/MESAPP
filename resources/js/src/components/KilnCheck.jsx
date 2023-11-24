import React, { useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";
import CheckListItem from "./CheckListItem";

const checkItems = [
    {
        value: "1",
        title: "1. Vệ sinh lò sấy",
        description: "Sạch sẽ, không có các vật thể lạ trong lò",
    },
    {
        value: "2",
        title: "2 .Không bị rò rỉ nước",
        description: "Giàn nhiệt kín không bị rò rỉ nước",
    },
    {
        value: "3",
        title: "3 .Hệ thống gia nhiệt",
        description:
            "Van nhiệt đóng mở đúng theo tín hiệu điện Giàn nhiệt không bị rò rỉ nhiệt ra ngoài",
    },
    {
        value: "4",
        title: "4 .Hệ thống điều tiết ẩm",
        description: "Ống phun ầm phải ở dạng sương, không được phun thành tia",
    },
    {
        value: "5",
        title: "5 .Đầu đo đo độ ẩm gỗ",
        description: "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu",
    },
    {
        value: "6",
        title: "6 .Cửa thoát ẩm",
        description: "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt",
    },
    {
        value: "7",
        title: "7 .Giấy cảm biến đo EMC",
        description: "Tối đa 3 lượt sấy phải thay giấy mới",
    },
    {
        value: "8",
        title: "8 .Cảm biến nhiệt độ trong lò sấy",
        description:
            "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Dùng súng bắn nhiệt đo nhiệt độ thực tế trong lò)",
    },
    {
        value: "9",
        title: "9. Van hơi, van nước hồi",
        description: "Kín, không bị rò rỉ",
    },
    {
        value: "10",
        title: "10 .Đinh, dây đo độ ẩm",
        description: "Hoạt động tốt",
    },
    {
        value: "11",
        title: "11 .Chiều dày thực tế",
        description:
            "Kiểm tra 5 palet ngẫu nhiên,mỗi palet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm)",
    },
    {
        value: "12",
        title: "12 .Động cơ quạt gió tốc độ gió quạt",
        description:
            "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều",
    },
];

function KilnCheck() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [checkedCount, setCheckedCount] = useState(0);

    const handleCheckboxChange = (isChecked) => {
        setCheckedCount((prevCount) =>
            isChecked ? prevCount + 1 : prevCount - 1
        );
    };

    return (
        <div className="bg-white  rounded-xl border-2 border-gray-200 ">
            <div className="bg-white flex items-center gap-x-3 text-xl px-6 border-b rounded-t-xl border-gray-200 font-medium py-4">
                <BsFillCheckCircleFill className="text-2xl text-[#17506B]" />
                <div className="xl:text-xl xl:w-full  text-lg">
                    Biên bản kiểm tra lò sấy
                </div>
            </div>

            <div className="bg-white rounded-b-xl">
                <div class="relative rounded-b-xl overflow-x-auto">
                    <table class="w-full  text-left text-gray-500 ">
                        <thead class="font-semibold xl:text-base text-sm text-gray-700 bg-gray-50 ">
                            <tr>
                                <th
                                    scope="col"
                                    class="py-3 xl:text-left text-center xl:px-6"
                                >
                                    Số biên bản
                                </th>
                                <th
                                    scope="col"
                                    class="py-3 xl:text-left text-center xl:px-6"
                                >
                                    Ngày kiểm tra
                                </th>
                                <th
                                    scope="col"
                                    class="py-3 xl:text-left text-center xl:px-6"
                                >
                                    Kết luận
                                </th>
                                <th
                                    scope="col"
                                    class="py-3 xl:text-left text-center xl:px-6 "
                                ></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white xl:text-base text-sm border-b">
                                <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                >
                                    106295
                                </th>
                                <td class="px-6 py-4">
                                    2023-10-12T07:59:28.050Z
                                </td>
                                <td class="px-6 py-4">OK</td>
                                <td
                                    class="px-6 font-semibold text-[#17506B] cursor-pointer"
                                    onClick={onOpen}
                                >
                                    Xem
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal View all sizes */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <div className="xl:ml-10 uppercase xl:text-xl ">
                            Kiểm tra lò sấy
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="xl:px-10 pb-2 text-[16px] text-gray-500 ">
                            <strong>Ghi chú: </strong>Lò sấy chỉ đủ tiêu chuẩn
                            hoạt động khi đã đáp ứng tất cả nhu cầu dưới đây
                        </div>
                        <div className="xl:px-10 grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
                            {/* Hiển thị tất cả giá trị checkItems */}
                            {checkItems.map((item) => (
                                <CheckListItem
                                    value={item.value}
                                    title={item.title}
                                    description={item.description}
                                    onCheckboxChange={handleCheckboxChange}
                                />
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="xl:flex justify-between xl:px-10 md:px-10 w-full">
                            <div className="flex text-lg ">
                                <strong className="hidden xl:flex md:flex">
                                    Kết luận:{" "}
                                </strong>
                                <p
                                    className={`ml-2  ${
                                        checkedCount === 12
                                            ? "text-[#0E8E59]"
                                            : "text-[#961717]"
                                    }`}
                                >
                                    {checkedCount === 12
                                        ? "Mẻ sấy đã đủ điều kiện hoạt động."
                                        : "Mẻ sấy chưa đủ điều kiện hoạt động."}
                                </p>
                                <p className="ml-2">
                                    (<span>{checkedCount}</span>/12)
                                </p>
                            </div>
                            <div className="flex justify-end gap-x-3 ">
                                <button
                                    onClick={onClose}
                                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                >
                                    Đóng
                                </button>
                                <button className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all">
                                    Hoàn thành
                                </button>
                            </div>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default KilnCheck;
