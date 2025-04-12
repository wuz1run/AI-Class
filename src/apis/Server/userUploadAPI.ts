import { request } from "../request";

 const userUploadAPI = async (data: FormData) => {
    const token = localStorage.getItem('token') || '';

    return request('/api/common/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: data
    });
};

export default userUploadAPI;