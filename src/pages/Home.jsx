import { useState, useMemo, useEffect } from 'react';
import ArtifactCard from '../components/ArtifactCard';
import { API_BASE_URL } from '../config/api';
import './Home.css';

const ITEMS_PER_PAGE = 16;

// Age 필터링
const filterByAge = (age, period) => {
    if (age == null) {
        return period === 'unknown';
    }
    
    const ageNum = typeof age === 'number' ? age : parseInt(age);
    
    switch (period) {
        case 'before1980':
            return ageNum <= 1980;
        case '1980to2000':
            return ageNum > 1980 && ageNum <= 2000;
        case 'after2000':
            return ageNum > 2000;
        case 'unknown':
            return age == null;
        default:
            return true;
    }
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

        // Age 필터
        if (selectedPeriod) {
            filtered = filtered.filter(item => filterByAge(item.age, selectedPeriod));
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
                                className={`period-button ${selectedPeriod === 'before1980' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('before1980')}
                            >
                                ~1980
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === '1980to2000' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('1980to2000')}
                            >
                                1980~2000
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === 'after2000' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('after2000')}
                            >
                                2000~
                            </button>
                            <button
                                className={`period-button ${selectedPeriod === 'unknown' ? 'active' : ''}`}
                                onClick={() => handlePeriodClick('unknown')}
                            >
                                알 수 없음
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

