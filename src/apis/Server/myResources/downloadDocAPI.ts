import { pythonrequest } from "../../pythonrequest";
import axios from "axios";

const token = localStorage.getItem('token')

const downloadDocAPI = async (jsonData: string) => {
    const response = await axios.post(
        "http://26eb465d.r31.cpolar.top/v1/word/export-from-json",  // 不再是 Vercel 的地址
        jsonData,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
    );

    return response.data; // 你应该返回一个 OSS 地址
};
export default downloadDocAPI
