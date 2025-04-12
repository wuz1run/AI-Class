import { request } from "../../request";

const token = localStorage.getItem('token')

const getDocAPI = async (jsonData: string) => {
    let url = `http://26eb465d.r31.cpolar.top/api/v1/word/export-from-json`

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
