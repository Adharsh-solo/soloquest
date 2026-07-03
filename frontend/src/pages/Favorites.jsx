import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation2, Heart } from 'lucide-react';
import api from '../api/axios';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites/');
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favId) => {
    try {
      await api.delete(`/favorites/${favId}/`);
      setFavorites(favorites.filter(f => f.id !== favId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn-icon" title="Back to Home">
            <ArrowLeft size={20} />
          </Link>
          <h1>Your Favorites</h1>
        </div>
      </header>
      
      <div className="main-content" style={{ padding: '2rem' }}>
        <div className="places-grid-container" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state">Loading your favorite places...</div>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              You haven't saved any favorites yet. Go explore!
            </div>
          ) : (
            <div className="places-grid">
              {favorites.map((fav) => {
                const place = fav.place;
                return (
                  <div key={fav.id} className="place-card">
                    <div className="place-content">
                      <div className="place-info">
                        <h3>{place.name}</h3>
                        <span className="place-category">{place.category}</span>
                        <p className="place-desc">{place.description?.substring(0, 100) || 'No description available'}...</p>
                        <div className="place-meta">
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="distance"
                            title="Get Directions on Google Maps"
                          >
                            <Navigation2 size={14} /> Get Directions
                          </a>
                        </div>
                      </div>
                      <div className="place-actions">
                        <button 
                          className="fav-btn active"
                          onClick={() => removeFavorite(fav.id)}
                          title="Remove from favorites"
                        >
                          <Heart size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
