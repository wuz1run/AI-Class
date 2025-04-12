import { request } from "../../request";

const token = localStorage.getItem('token')

const getDocAPI = async (jsonData: string) => {
    let url = `/api1/v1/word/export-from-json`

    return request(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        data: jsonData,
        responseType: 'blob',  // 返回 blob 文件流
    });
}

export default getDocAPI;
