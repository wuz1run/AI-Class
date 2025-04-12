import { pythonrequest } from "../../pythonrequest";
import axios from "axios";

const token = localStorage.getItem('token')

const downloadDocAPI = async (jsonData: string) => {
    const response = await axios.post(
        "https://26eb465d.r31.cpolar.top/api1/v1/word/export-from-json",  // 不再是 Vercel 的地址
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
//         // 假设后端返回的响应是文件的下载 URL
//         const fileUrl = response.download_url;
//
//         if (fileUrl) {
//             // 创建下载链接并模拟点击
//             const link = document.createElement("a");
//             link.href = fileUrl;  // OSS 或服务器上文件的 URL
//             link.download = "下载的文件.docx";  // 设置文件名
//             document.body.appendChild(link);
//             link.click();
//         } else {
//             console.error("文件未找到");
//         }
//     } catch (error) {
//         console.error("文件下载失败", error);
//     }
// }

