import { pythonrequest } from "../../pythonrequest";

const token = localStorage.getItem('token')

const downloadDocAPI = async (jsonData: string) => {
    let url = `/api1/v1/word/export-from-json`

    try {
        const response = await pythonrequest(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            data: jsonData,
        });

        // 假设后端返回的响应是文件的下载 URL
        const fileUrl = response.download_url;

        if (fileUrl) {
            // 创建下载链接并模拟点击
            const link = document.createElement("a");
            link.href = fileUrl;  // OSS 或服务器上文件的 URL
            link.download = "下载的文件.docx";  // 设置文件名
            document.body.appendChild(link);
            link.click();
        } else {
            console.error("文件未找到");
        }
    } catch (error) {
        console.error("文件下载失败", error);
    }
}

export default downloadDocAPI;
