// 导出模板文件
async function exportTemplateFromOSS(ossKey: string, filename?: string): Promise<void> {
    try {
        // 定义请求参数
        const params = new URLSearchParams();
        params.append('oss_key', ossKey);
        if (filename) {
            params.append('filename', filename);
        }

        // 发起请求
        const response = await fetch(`/api/v1/templates/export?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '导出失败');
        }

        // 创建下载链接
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = filename || 'template_export.docx';
        document.body.appendChild(a);
        a.click();

        // 清理
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    } catch (error) {
        console.error('导出模板时发生错误:', error);
        // 在UI上展示错误信息
        alert(`导出失败: ${error.message}`);
    }
}

// 使用示例
const handleExport = () => {
    //这个是你上传过去的json文件
    const ossKey = 'teaching_template_宇宙学前沿：暗物质与暗能量.json';
    //这个是默认下载名字
    const filename = '教学模板.docx';

    exportTemplateFromOSS(ossKey, filename);
};
//使用belike
 //   <button
 //       onClick={handleExport}
  //  disabled={isExporting}
  //      >
  //      {isExporting ? '导出中...' : '导出Word模板'}
  //      </button>