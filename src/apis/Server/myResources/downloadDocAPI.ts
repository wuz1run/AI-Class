import { pythonrequest } from "../../pythonrequest";

const token = localStorage.getItem('token')

const getDocAPI = async (jsonData: string) => {
    let url = `/api1/word/export-from-json`

    return pythonrequest(url, {
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
