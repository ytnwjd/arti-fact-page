import { useState, useMemo, useEffect } from 'react';
import ArtifactCard from '../components/ArtifactCard';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { refreshFavoritesCache } from '../utils/favorites';
import './Home.css';

const ITEMS_PER_PAGE = 12;

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
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedDisplay, setSelectedDisplay] = useState([]);

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

    // 사용자 관심목록 조회 및 캐시 업데이트
    useEffect(() => {
        if (user && user.userId) {
            refreshFavoritesCache(user.userId);
        }
    }, [user]);


    // Genre, Theme 값 추출
    const uniqueGenres = useMemo(() => {
        const genres = new Set();
        artifacts.forEach(item => {
            if (item.genre) genres.add(item.genre);
        });
        return Array.from(genres).sort();
    }, [artifacts]);

    const uniqueThemes = useMemo(() => {
        const themes = new Set();
        artifacts.forEach(item => {
            if (item.theme) themes.add(item.theme);
        });
        return Array.from(themes).sort();
    }, [artifacts]);

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

        // Genre 필터
        if (selectedGenres.length > 0) {
            filtered = filtered.filter(item => 
                item.genre && selectedGenres.includes(item.genre)
            );
        }

        // Theme 필터
        if (selectedThemes.length > 0) {
            filtered = filtered.filter(item => 
                item.theme && selectedThemes.includes(item.theme)
            );
        }

        // 전시 여부 필터
        if (selectedDisplay.length > 0) {
            filtered = filtered.filter(item => {
                if (selectedDisplay.includes('true') && item.display === true) return true;
                if (selectedDisplay.includes('false') && item.display === false) return true;
                return false;
            });
        }

        return filtered;
    }, [artifacts, searchQuery, selectedPeriod, selectedGenres, selectedThemes, selectedDisplay]);

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
    }, [searchQuery, selectedPeriod, selectedGenres, selectedThemes, selectedDisplay]);

    const handleGenreToggle = (genre) => {
        setSelectedGenres(prev => 
            prev.includes(genre) 
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const handleThemeToggle = (theme) => {
        setSelectedThemes(prev => 
            prev.includes(theme) 
                ? prev.filter(t => t !== theme)
                : [...prev, theme]
        );
    };

    const handleDisplayToggle = (display) => {
        setSelectedDisplay(prev => 
            prev.includes(display) 
                ? prev.filter(d => d !== display)
                : [...prev, display]
        );
    };

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
            <div className="home-content-wrapper">
            {/* 필터 사이드바 */}
            <div className="filter-sidebar">
                <h3 className="filter-title">필터</h3>
                
                {/* Genre 필터 */}
                <div className="filter-group">
                    <h4 className="filter-group-title">Genre</h4>
                    <div className="filter-options">
                        {uniqueGenres.map(genre => (
                            <label key={genre} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre)}
                                    onChange={() => handleGenreToggle(genre)}
                                />
                                <span>{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Theme 필터 */}
                <div className="filter-group">
                    <h4 className="filter-group-title">Theme</h4>
                    <div className="filter-options">
                        {uniqueThemes.map(theme => (
                            <label key={theme} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedThemes.includes(theme)}
                                    onChange={() => handleThemeToggle(theme)}
                                />
                                <span>{theme}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 전시 여부 필터 */}
                <div className="filter-group">
                    <h4 className="filter-group-title">전시 여부</h4>
                    <div className="filter-options">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedDisplay.includes('true')}
                                onChange={() => handleDisplayToggle('true')}
                            />
                            <span>전시 중</span>
                        </label>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedDisplay.includes('false')}
                                onChange={() => handleDisplayToggle('false')}
                            />
                            <span>전시 안 함</span>
                        </label>
                    </div>
                </div>
            </div>

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
        </div>
    );
}

