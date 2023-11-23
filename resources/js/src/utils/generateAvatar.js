import axios from "axios";

const generateAvatar = async (name) => {
    const unsignedName = name?.replace(/\W/g, '').replace(/\s/g, '+') || '';
    const url = `https://ui-avatars.com/api/?name=${unsignedName}&size=300&background=random&length=2&bold=true`;
    const response = await axios.get(url, { responseType: 'blob' });
    return response.data;
}

export default generateAvatar