import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// 定义类型接口
interface PredictedScore {
    [subject: string]: number;
}

interface StudentPrediction {
    student_id: string;
    class_id: string;
    predicted_scores: PredictedScore;
}

interface ClassPredictions {
    [classId: string]: PredictedScore;
}

interface Prediction {
    prediction_id: string;
    created_at: string;
    student_count: number;
    class_count: number;
    student_predictions: StudentPrediction[];
    class_predictions: ClassPredictions;
}

function PredictionDashboard(): JSX.Element {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 获取预测历史
    useEffect(() => {
        async function fetchPredictions(): Promise<void> {
            try {
                setLoading(true);
                const response = await axios.get<Prediction[]>(`${API_BASE_URL}/predictions/`);
                setPredictions(response.data);
                setLoading(false);
            } catch (error) {
                setError('获取预测历史失败');
                setLoading(false);
            }
        }

        fetchPredictions();
    }, []);

    // 创建新预测
    const createPrediction = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.post<Prediction>(`${API_BASE_URL}/predictions/`, {
                use_cached_data: false,
                data_source: 'api',
                force_retrain: false
            });

            // 将新预测添加到列表顶部
            setPredictions(prev => [response.data, ...prev]);
            setSelectedPrediction(response.data);
            setLoading(false);
        } catch (error) {
            setError('创建预测失败');
            setLoading(false);
        }
    };

    // 查看预测详情
    const viewPredictionDetails = async (predictionId: string): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get<Prediction>(`${API_BASE_URL}/predictions/${predictionId}`);
            setSelectedPrediction(response.data);
            setLoading(false);
        } catch (error) {
            setError('获取预测详情失败');
            setLoading(false);
        }
    };
//使用belike
    {    return (
        <div className="dashboard">
            <h1>学生成绩预测系统</h1>

            <div className="actions">
    <button onClick={createPrediction} disabled={loading}>
        {loading ? '预测中...' : '创建新预测'}
        </button>
        </div>

    {error && <div className="error">{error}</div>}

        <div className="content">
    <div className="predictions-list">
        <h2>预测历史</h2>
        {predictions.length === 0 ? (
            <p>暂无预测记录</p>
        ) : (
            <ul>
                {predictions.map(prediction => (
                        <li key={prediction.prediction_id}>
                        <button onClick={() => viewPredictionDetails(prediction.prediction_id)}>
            {new Date(prediction.created_at).toLocaleString()} -
            {prediction.student_count}名学生, {prediction.class_count}个班级
        </button>
        </li>
        ))}
            </ul>
        )}
        </div>

        {selectedPrediction && (
            <div className="prediction-details">
                <h2>预测详情</h2>
                <h3>班级平均分预测</h3>
                <table>
                <thead>
                    <tr>
                        <th>班级</th>
            {Object.keys(Object.values(selectedPrediction.class_predictions)[0] || {}).map(subject => (
                <th key={subject}>{subject}</th>
            ))}
            </tr>
            </thead>
            <tbody>
            {Object.entries(selectedPrediction.class_predictions).map(([classId, subjects]) => (
                    <tr key={classId}>
                        <td>{classId}</td>
            {Object.keys(Object.values(selectedPrediction.class_predictions)[0] || {}).map(subject => (
                <td key={subject}>{subjects[subject]}</td>
            ))}
            </tr>
        ))}
            </tbody>
            </table>

            <h3>学生成绩预测</h3>
            <table>
            <thead>
                <tr>
                    <th>学生ID</th>
            <th>班级</th>
            {Object.keys(selectedPrediction.student_predictions[0]?.predicted_scores || {}).map(subject => (
                <th key={subject}>{subject}</th>
            ))}
            </tr>
            </thead>
            <tbody>
            {selectedPrediction.student_predictions.map(student => (
                    <tr key={student.student_id}>
                        <td>{student.student_id}</td>
                        <td>{student.class_id}</td>
            {Object.keys(selectedPrediction.student_predictions[0]?.predicted_scores || {}).map(subject => (
                <td key={subject}>{student.predicted_scores[subject]}</td>
            ))}
            </tr>
        ))}
            </tbody>
            </table>
            </div>
        )}
        </div>
        </div>
    );
    }
export default PredictionDashboard;