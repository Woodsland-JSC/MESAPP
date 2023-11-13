const regexUpperCase = /^(?=.*[A-Z])/;
const regexNumber = /^(?=.*\d)/;
const regexName = /^[a-zA-ZÀ-ỹ ]+$/;
const regexPhone = /^[0-9]*$/;
const regexAddress = /^[a-zA-Z0-9À-ỹ\s.',-]+$/;
const regexUserName = /^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/;
const emailRegex =
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}|\.\w{2,3}\.\w{2,3})$/;
const idCardFirst3 = [
  "001",
  "002",
  "004",
  "006",
  "008",
  "010",
  "011",
  "012",
  "014",
  "015",
  "017",
  "019",
  "020",
  "022",
  "024",
  "025",
  "026",
  "027",
  "030",
  "031",
  "033",
  "034",
  "035",
  "036",
  "037",
  "038",
  "040",
  "042",
  "044",
  "045",
  "046",
  "048",
  "049",
  "051",
  "052",
  "054",
  "056",
  "058",
  "060",
  "062",
  "064",
  "066",
  "067",
  "068",
  "070",
  "072",
  "074",
  "075",
  "077",
  "079",
  "080",
  "082",
  "083",
  "084",
  "086",
  "087",
  "089",
  "091",
  "092",
  "093",
  "094",
  "095",
  "096",
];
const validatePassword = (password) => {
  return regexUpperCase.test(password) && regexNumber.test(password);
};

const validateUsername = (userName) => {
  return !regexUserName.test(userName.trim());
};

const validateEmail = (email) => {
  return !emailRegex.test(email);
};
// Validate first name
const validateFirstName = (firstName) => {
  return regexName.test(firstName.trim());
};

const validateLastName = (lastName) => {
  return regexName.test(lastName.trim());
};

const validatePhoneNumber = (phoneNumber) => {
  return regexPhone.test(phoneNumber.trim());
};

const validateAddress = (address) => {
  return regexAddress.test(address);
};

const validateIdCard = (IdCard) => {
  const firstThreeChars = IdCard.slice(0, 3);
  // const idCardFirst3 = IdCard.slice(3,1);

  for (let i = 0; i < IdCard.length; i++) {
    if (isNaN(parseInt(IdCard[i]))) {
      return false;
    }
  }
  if (IdCard.length != 12) return false;
  if (!idCardFirst3.includes(firstThreeChars)) return false;

  return true;
};

const checkAge = (IdCard) => {
  if (IdCard.length === 12) {
    const ageChars = IdCard.slice(4, 6);
    const currentYear = new Date().getFullYear().toString();
    const currentYearParse = parseInt(currentYear.substring(2));
    if (ageChars <= 6 || ageChars >= currentYearParse + 1) {
      return true;
    }
    return false;
  }
  return true;
};

export {
  validatePassword,
  validateUsername,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePhoneNumber,
  validateAddress,
  validateIdCard,
  checkAge,
};
