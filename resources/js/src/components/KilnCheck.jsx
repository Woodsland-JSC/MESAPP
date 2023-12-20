import React, { useState } from "react";
import { HiMiniCheckCircle } from "react-icons/hi2";
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
        value: 1,
        title: "1. Vệ sinh lò sấy",
        description: "Sạch sẽ, không có các vật thể lạ trong lò.",
    },
    {
        value: 2,
        title: "2. Không bị rò rỉ nước",
        description: "Giàn nhiệt kín không bị rò rỉ nước.",
    },
    {
        value: 3,
        title: "3. Hệ thống gia nhiệt",
        description:
            "Van nhiệt đóng mở đúng theo tín hiệu điện Giàn nhiệt không bị rò rỉ nhiệt ra ngoài.",
    },
    {
        value: 4,
        title: "4. Hệ thống điều tiết ẩm",
        description:
            "Ống phun ầm phải ở dạng sương, không được phun thành tia.",
    },
    {
        value: 5,
        title: "5. Đầu đo đo độ ẩm gỗ",
        description: "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu.",
    },
    {
        value: 6,
        title: "6. Cửa thoát ẩm",
        description:
            "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt.",
    },
    {
        value: 7,
        title: "7. Giấy cảm biến đo EMC",
        description: "Tối đa 3 lượt sấy phải thay giấy mới.",
    },
    {
        value: 8,
        title: "8. Cảm biến nhiệt độ trong lò sấy",
        description:
            "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Đo bằng súng bắn nhiệt).",
    },
    {
        value: 9,
        title: "9. Van hơi, van nước hồi",
        description: "Kín, không bị rò rỉ.",
    },
    {
        value: 10,
        title: "10. Đinh, dây đo độ ẩm",
        description: "Hoạt động tốt.",
    },
    {
        value: 11,
        title: "11. Chiều dày thực tế",
        description:
            "Kiểm tra 5 palet ngẫu nhiên,mỗi palet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm).",
    },
    {
        value: 12,
        title: "12. Động cơ quạt & tốc độ gió quạt",
        description:
            "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều.",
    },
];

function KilnCheck(props) {
    const { planID, checkData, CT11Data, CT12Data, Checked, checkboxData } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [checkedCount, setCheckedCount] = useState(0);

    const handleCheckboxChange = (isChecked) => {
        setCheckedCount((prevCount) =>
            isChecked ? prevCount + 1 : prevCount - 1
        );
    };

    return (
        <div className="bg-white  rounded-xl border-2 border-gray-300 ">
            <div className="bg-white flex items-center px-6 border-b rounded-t-xl border-gray-200 font-medium py-4">
                <div className="flex items-center gap-x-3 font-medium">
                    <div className="w-9 h-9">
                        <HiMiniCheckCircle className="text-2xl w-[97%] h-full text-[#17506B]" />
                    </div>

                    <div className="xl:text-xl xl:w-full  text-lg">
                        Biên bản kiểm tra lò sấy
                    </div>
                </div>
            </div>

            {Checked === 1? (
                <div className="bg-white xl:p-0 lg:p-0 md:p-0 p-4 rounded-b-xl">
                <div class="relative rounded-b-xl overflow-x-auto">
                    <div className="xl:hidden lg:hidden md:hidden">
                        <div
                            className="rounded-xl bg-green-50 hover:bg-gray-50 cursor-pointer xl:text-base  border border-green-200"
                            onClick={onOpen}
                        >
                            <div className="px-4 py-2.5 flex justify-between items-center border-b border-green-200">
                                <div className="">
                                    <span className="text-lg font-semibold">
                                        #{checkData.NoCheck}
                                    </span>
                                </div>
                                <div className="p-1 px-3 bg-green-200 rounded-xl">
                                    <span className="font-semibold">
                                        ĐẠT
                                    </span>
                                </div>
                            </div>
                            <div className="px-4 divide-y divide-green-200">
                                <div className="flex justify-between py-2">
                                    <div className="">Ngày tạo:</div>
                                    <span className="font-semibold">
                                        {checkData.DateChecked}
                                    </span>
                                </div>
                                {/* <div className="flex justify-between py-2">
                                    <div className="">Tạo bởi:</div>
                                    <span className="font-semibold">Admin</span>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <table class="w-full xl:inline-table lg:inline-table md:inline-table hidden text-left text-gray-500 ">
                        <thead class="font-semibold xl:text-base text-gray-700 bg-gray-50 ">
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
                            <tr
                                class="bg-white xl:text-base border-b "
                                onClick={onOpen}
                            >
                                <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                >
                                    {checkData.NoCheck}
                                </th>
                                <td class="px-6 py-4">
                                    {checkData.DateChecked}
                                </td>
                                <td class="px-6 py-4">ĐẠT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            ) : (
                <div className="text-center w-full py-5 text-gray-500">
                    Chưa hoàn thành đánh giá mẻ sấy
                </div>
            )}
            

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
                        <div className="xl:px-10 grid xl:grid-cols-4 lg:grid-cols-3 gap-6 mb-4">
                            {/* Hiển thị tất cả giá trị checkItems */}
                            {checkItems.map((item, index) => (
                                <CheckListItem
                                    key={index}
                                    title={item.title}
                                    value={item.value}
                                    description={item.description}
                                    onCheckboxChange={handleCheckboxChange}
                                    isChecked={checkboxData[`CT${index + 1}`] === 1}
                                    isDisabled={checkboxData[`CT${item.value}`] === 1}
                                    defaultChecked={checkboxData[`CT${item.value}`] === 1}
                                    fixedSoLan={checkData.SoLan}
                                    fixedCBL={checkData.CBL}
                                    fixedDoThucTe={checkData.DoThucTe}
                                    fixedSamples={CT11Data}
                                    fixedFanValues={CT12Data}
                                />
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-white border-t-2 border-gray-200 w-full sticky bottom-0">
                        <div className=" xl:flex items-center justify-between xl:px-6 md:px-6 w-full">
                            {/* <div className="flex text-lg ">
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
                            </div> */}
                            <div className="flex xl:w-fit md:w-fit w-full items-center justify-end py-4 xl:py-0 lg:py-0 md:py-0 gap-x-3 ">
                                <button
                                    onClick={onClose}
                                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit w-full"
                                >
                                    Đóng
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
