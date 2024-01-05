function formatNumber(number) {
    if (isNaN(number)) {
        return number; // Trả về nguyên giá trị nếu không phải là số
    }

    const parts = number.toString().split(".");
    if (parts.length > 1 && parts[1].length > 2) {
        return parseFloat(number)
            .toFixed(2)
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    return number.toLocaleString("en-US"); // Sử dụng hàm toLocaleString để định dạng số
}

export { formatNumber };
