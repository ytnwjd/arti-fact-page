import { useState, useMemo } from 'react';
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

export default function Home() {
    const [currentPage, setCurrentPage] = useState(1);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(sampleData.length / ITEMS_PER_PAGE);

    // 현재 페이지에 표시할 아이템들
    const currentArtifacts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sampleData.slice(startIndex, endIndex);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Artifact Collection</h1>

                <div className="artifacts-section">
                    
                    <div className="artifacts-grid">
                        {currentArtifacts.map((artifact) => (
                            <ArtifactCard key={artifact.id} artifact={artifact} />
                        ))}
                    </div>

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

