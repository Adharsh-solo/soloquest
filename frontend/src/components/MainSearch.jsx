import React, { useState } from 'react';
import { Search, Heart, Navigation2, MapPin, X } from 'lucide-react';

const MainSearch = ({ 
  places, loading, searchQuery, setSearchQuery, handleSearch, 
  favorites, toggleFavorite, handleLocationSearch, clearSearch
}) => {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const closeModal = () => setSelectedPlace(null);

  return (
    <div className="main-search-container">
      <div className="search-header-section">
        <h2>Find your next destination</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Search for a city or place in Kerala (e.g. Munnar, Kochi)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={clearSearch} title="Clear Search">
              <X size={18} />
            </button>
          )}
          <button type="submit" className="search-btn">
            <Search size={20} />
          </button>
        </form>
        <button type="button" onClick={handleLocationSearch} className="location-search-btn">
          <MapPin size={18} /> Find places near me
        </button>
      </div>


      <div className="places-grid-container">
        {loading ? (
          <div className="loading-state">Finding gems...</div>
        ) : places.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? "No places found. Try searching a different location." : "Search for a location to see places."}
          </div>
        ) : (
          <div className="places-grid">
            {places.map((place) => (
              <div key={place.id} className="place-card clickable-card" onClick={() => setSelectedPlace(place)}>
                <div className="place-content">
                  <div className="place-info">
                    <h3>{place.name}</h3>
                    <span className="place-category">{place.category}</span>
                    <p className="place-desc">{place.description?.substring(0, 100)}...</p>
                    <div className="place-meta">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="distance"
                        title="Get Directions on Google Maps"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation2 size={14} /> {place.distance_km} km from center
                      </a>
                    </div>
                  </div>
                  <div className="place-actions">
                    <button 
                      className={`fav-btn ${favorites.includes(place.id) ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(place); }}
                      title="Toggle Favorite"
                    >
                      <Heart size={20} fill={favorites.includes(place.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPlace && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} title="Close">
              <X size={24} />
            </button>
            <div className="modal-header">
              <h2>{selectedPlace.name}</h2>
              <span className="place-category">{selectedPlace.category}</span>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{selectedPlace.description || 'No description available.'}</p>
              
              <div className="modal-actions-bar">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-btn primary"
                >
                  <Navigation2 size={18} /> Directions ({selectedPlace.distance_km} km)
                </a>
                <button 
                  className={`modal-btn fav ${favorites.includes(selectedPlace.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(selectedPlace)}
                >
                  <Heart size={18} fill={favorites.includes(selectedPlace.id) ? "currentColor" : "none"} />
                  {favorites.includes(selectedPlace.id) ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSearch;
