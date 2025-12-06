import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './Detail.css';

export default function Detail() {
    const { type } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const name = searchParams.get('name');
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!name) {
                setError('이름이 제공되지 않았습니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const endpoint = type === 'artist' 
                    ? `${API_BASE_URL}/api/artists/search?keyword=${encodeURIComponent(name)}`
                    : `${API_BASE_URL}/api/galleries/search?keyword=${encodeURIComponent(name)}`;
                
                const response = await fetch(endpoint);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                // API 응답 형식: { message, count, data: [...] }
                const detailData = result.data && result.data.length > 0 ? result.data[0] : null;
                setData(detailData);
            } catch (err) {
                setError(err.message || '상세 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [type, name]);

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-box">
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-container">
                <div className="detail-box">
                    <h1>{type === 'artist' ? '작가' : '미술관'} 상세 정보</h1>
                    <p className="error-message">{error}</p>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="detail-container">
                <div className="detail-box">
                    <h1>{type === 'artist' ? '작가' : '미술관'} 상세 정보</h1>
                    <p>정보를 찾을 수 없습니다.</p>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-container">
            <div className="detail-box">
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← 돌아가기
                    </button>
                    <h1>{type === 'artist' ? '작가' : '미술관'} 상세 정보</h1>
                </div>
                
                <div className="detail-content">
                    {type === 'artist' ? (
                        <>
                            {data.artistId && (
                                <div className="detail-item">
                                    <label>작가 ID:</label>
                                    <p>{data.artistId}</p>
                                </div>
                            )}
                            {data.name && (
                                <div className="detail-item">
                                    <label>이름:</label>
                                    <p>{data.name}</p>
                                </div>
                            )}
                            {data.theme && (
                                <div className="detail-item">
                                    <label>테마:</label>
                                    <p>{data.theme}</p>
                                </div>
                            )}
                            {data.nationality && (
                                <div className="detail-item">
                                    <label>국적:</label>
                                    <p>{data.nationality}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {data.galleryId && (
                                <div className="detail-item">
                                    <label>미술관 ID:</label>
                                    <p>{data.galleryId}</p>
                                </div>
                            )}
                            {data.name && (
                                <div className="detail-item">
                                    <label>이름:</label>
                                    <p>{data.name}</p>
                                </div>
                            )}
                            {data.address && (
                                <div className="detail-item">
                                    <label>주소:</label>
                                    <p>{data.address}</p>
                                </div>
                            )}
                            {data.openTime && (
                                <div className="detail-item">
                                    <label>오픈 시간:</label>
                                    <p>{data.openTime}</p>
                                </div>
                            )}
                            {data.closedTime && (
                                <div className="detail-item">
                                    <label>마감 시간:</label>
                                    <p>{data.closedTime}</p>
                                </div>
                            )}
                            {data.fee != null && (
                                <div className="detail-item">
                                    <label>입장료:</label>
                                    <p>{data.fee.toLocaleString()}원</p>
                                </div>
                            )}
                            {data.phone && (
                                <div className="detail-item">
                                    <label>전화번호:</label>
                                    <p>{data.phone}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

