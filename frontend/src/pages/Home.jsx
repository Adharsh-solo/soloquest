import React, { useState, useEffect } from 'react';
import MainSearch from '../components/MainSearch';
import api from '../api/axios';
import { LogOut, Heart, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [places, setPlaces] = useState(() => {
    const saved = sessionStorage.getItem('savedPlaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem('savedSearchQuery') || '';
  });
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const username = localStorage.getItem('username') || '';
  const displayName = username.includes('@') ? username.split('@')[0] : username || 'User';

  useEffect(() => {
    sessionStorage.setItem('savedPlaces', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    sessionStorage.setItem('savedSearchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-section')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const clearSearch = () => {
    setSearchQuery('');
    setPlaces([]);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchNearbyPlaces = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await api.get(`/places/nearby/?lat=${lat}&lng=${lng}&radius=50`);
      setPlaces(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites/');
      const favIds = [];
      res.data.forEach(f => {
        favIds.push(f.place.id);
        if (f.place.geoapify_id) {
          favIds.push(f.place.geoapify_id);
        }
      });
      setFavorites(favIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocationSearch = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        fetchNearbyPlaces(lat, lng);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data && data.address) {
            const placeName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || data.display_name.split(',')[0];
            setSearchQuery(placeName);
          }
        } catch (error) {
          console.error('Error fetching location name:', error);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setLoading(false);
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await api.get(`/places/search/?q=${searchQuery}+Kerala`);
      if (res.data && res.data.length > 0) {
        const firstResult = res.data[0];
        await fetchNearbyPlaces(parseFloat(firstResult.lat), parseFloat(firstResult.lon));
      } else {
        setPlaces([]);
      }
    } catch (err) {
      console.error(err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (place) => {
    try {
      const placeId = place.id;
      if (favorites.includes(placeId)) {
        const favRes = await api.get('/favorites/');
        const favItem = favRes.data.find(f => f.place.id === placeId || f.place.geoapify_id === placeId);
        if (favItem) {
          await api.delete(`/favorites/${favItem.id}/`);
          setFavorites(favorites.filter(id => id !== placeId));
        }
      } else {
        await api.post('/favorites/', { place: place });
        setFavorites([...favorites, placeId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('savedPlaces');
    sessionStorage.removeItem('savedSearchQuery');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Solo Quest</h1>
        <div className="header-actions">
          <Link to="/favorites" className="btn-icon" title="Favorites">
            <Heart size={20} />
          </Link>
          <div className="profile-section" style={{ position: 'relative' }}>
            <button 
              className="profile-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <User size={18} className="profile-icon" />
              <span className="username">{displayName}</span>
            </button>
            
            {dropdownOpen && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '0.5rem',
                minWidth: '220px',
                zIndex: 50,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ padding: '0.5rem', borderBottom: '1px solid #2d3748', marginBottom: '0.5rem', color: '#a0aec0', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                  {username}
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4a4a',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 74, 74, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="main-content">
        <MainSearch 
          places={places} 
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          handleLocationSearch={handleLocationSearch}
          clearSearch={clearSearch}
        />
      </div>
    </div>
  );
};

export default Home;
