import { useState, useMemo, useEffect } from 'react';
import ArtifactCard from '../components/ArtifactCard';
import './Home.css';

// 예시 데이터 (실제로는 API에서 가져와야 함)
const sampleData = [
    { 
        id: 1, 
        name: 'Ancient Vase', 
        age: '3000 BC', 
        genre: 'Pottery', 
        theme: 'Ancient Civilization',
        display: true,
        artist_ID: 'ART001',
        gallery_ID: 'GAL001',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    },
    { 
        id: 2, 
        name: 'Bronze Statue', 
        age: '500 BC', 
        genre: 'Sculpture', 
        theme: 'Classical Art',
        display: true,
        artist_ID: 'ART002',
        gallery_ID: 'GAL002',
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'
    },
    { 
        id: 3, 
        name: 'Medieval Manuscript', 
        age: '1200 AD', 
        genre: 'Manuscript', 
        theme: 'Medieval Period',
        display: true,
        artist_ID: 'ART003',
        gallery_ID: 'GAL003',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
    },
    { 
        id: 4, 
        name: 'Renaissance Painting', 
        age: '1500 AD', 
        genre: 'Painting', 
        theme: 'Renaissance',
        display: true,
        artist_ID: 'ART004',
        gallery_ID: 'GAL004',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'
    },
    { 
        id: 5, 
        name: 'Ancient Coin Collection', 
        age: '200 BC', 
        genre: 'Numismatics', 
        theme: 'Ancient Currency',
        display: false,
        artist_ID: 'ART005',
        gallery_ID: 'GAL005',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400'
    },
];

const ITEMS_PER_PAGE = 16;

// Age를 숫자로 변환
const parseAge = (age) => {
    if (!age) return 0;
    const ageStr = age.toString().toUpperCase();
    if (ageStr.includes('BC')) {
        const num = parseInt(ageStr.replace(/[^0-9]/g, '')) || 0;
        return -num;
    } else if (ageStr.includes('AD')) {
        const num = parseInt(ageStr.replace(/[^0-9]/g, '')) || 0;
        return num;
    }
    return 0;
};

export default function Home() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const filteredData = useMemo(() => {
        let filtered = sampleData;

        // 검색 필터 (작가명, 미술관)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.artist_ID.toLowerCase().includes(query) ||
                item.gallery_ID.toLowerCase().includes(query)
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
    }, [searchQuery, selectedPeriod]);

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
                        <h2 className="artifacts-count">                        
                            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                        </h2>
                    </div>
                    
                    {currentArtifacts.length > 0 ? (
                        <div className="artifacts-grid">
                            {currentArtifacts.map((artifact) => (
                                <ArtifactCard key={artifact.id} artifact={artifact} />
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

