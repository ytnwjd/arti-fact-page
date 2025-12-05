import { useState, useMemo, useEffect } from 'react';
import ArtifactCard from '../components/ArtifactCard';
import { API_BASE_URL } from '../config/api';
import './Home.css';

const ITEMS_PER_PAGE = 16;

// Age를 숫자로 변환 (필터링용)
const parseAge = (age) => {
    if (!age) return 0;
    if (typeof age === 'number') {
        return age;
    }
    const ageStr = age.toString().toUpperCase();
    if (ageStr.includes('BC')) {
        const num = parseInt(ageStr.replace(/[^0-9]/g, '')) || 0;
        return -num;
    } else if (ageStr.includes('AD')) {
        const num = parseInt(ageStr.replace(/[^0-9]/g, '')) || 0;
        return num;
    }
    const num = parseInt(ageStr.replace(/[^0-9]/g, '')) || 0;
    return num;
};

export default function Home() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API에서 데이터 가져오기
    useEffect(() => {
        const fetchArtifacts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/arts`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                setArtifacts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch artifacts:', err);
                setError(err.message);
                setArtifacts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArtifacts();
    }, []);


    const filteredData = useMemo(() => {
        let filtered = artifacts;

        // 검색 필터 (작가명, 미술관)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.artistId && item.artistId.toLowerCase().includes(query)) ||
                (item.artistName && item.artistName.toLowerCase().includes(query)) ||
                (item.galleryId && item.galleryId.toLowerCase().includes(query)) ||
                (item.galleryName && item.galleryName.toLowerCase().includes(query))
            );
        }

        // 시대별 필터
        if (selectedPeriod) {
            const periodRanges = {
                'ancient': [-4000, 400],
                'medieval': [400, 1400],
                'renaissance': [1400, 1600],
                'modern': [1600, 2000]
            };
            const range = periodRanges[selectedPeriod];
            if (range) {
                filtered = filtered.filter(item => {
                    const age = parseAge(item.age);
                    return age >= range[0] && age <= range[1];
                });
            }
        }

        return filtered;
    }, [artifacts, searchQuery, selectedPeriod]);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    // 현재 페이지에 표시할 아이템들
    const currentArtifacts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    }, [currentPage, filteredData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedPeriod]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePeriodClick = (period) => {
        if (selectedPeriod === period) {
            setSelectedPeriod(null);
        } else {
            setSelectedPeriod(period);
        }
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Artifact Collection</h1>

                <div className="filter-section">
                    <div className="search-bar-wrapper">
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="작가명, 미술관으로 검색해보세요!"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    setCurrentPage(1);
                                }
                            }}
                        />
                        <button 
                            className="search-button"
                            onClick={() => setCurrentPage(1)}
                        >
                            검색
                        </button>
                    </div>

                    <div className="age-slider-container">
                        <div className="period-buttons">
                            <button
                                className={`period-button ${selectedPeriod === 'ancient' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('ancient')}
                            >
                                고대(~4c)
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === 'medieval' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('medieval')}
                            >
                                중세(4c~14c)
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === 'renaissance' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('renaissance')}
                            >
                                르네상스(14c~16c)
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === 'modern' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('modern')}
                            >
                                근대(16c~)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="artifacts-section">
                    <div className="artifacts-header">
                        
                    </div>
                    
                    {loading ? (
                        <div className="loading">
                            <p>로딩 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                            <p className="error-hint">{error}</p>
                        </div>
                    ) : currentArtifacts.length > 0 ? (
                        <div className="artifacts-grid">
                            {currentArtifacts.map((artifact) => (
                                <ArtifactCard key={artifact.artId} artifact={artifact} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>검색 결과가 없습니다.</p>
                            <p className="no-results-hint">다른 검색어나 필터를 시도해보세요.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            <div className="pagination-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

