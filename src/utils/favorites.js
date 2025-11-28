// 관심 목록 관리 유틸리티 함수

export const getFavorites = () => {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
};

export const addToFavorites = (artifactId) => {
    const favorites = getFavorites();
    if (!favorites.includes(artifactId)) {
        favorites.push(artifactId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    return favorites;
};

export const removeFromFavorites = (artifactId) => {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(id => id !== artifactId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    return updatedFavorites;
};

export const isFavorite = (artifactId) => {
    const favorites = getFavorites();
    return favorites.includes(artifactId);
};

