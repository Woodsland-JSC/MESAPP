export const getFirstDayOfCurrentMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getCurrentYear = () => {
    return new Date().getFullYear();
}