import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { initialsFromName } from '../utils/format';
import { GridIcon, TrendUpIcon, TrendDownIcon, ChartIcon, SettingsIcon, LogoutIcon, CameraIcon } from './Icons';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/income', label: 'Income', icon: TrendUpIcon },
  { to: '/expense', label: 'Expense', icon: TrendDownIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = user?.profilePicture ? `${API_ORIGIN}${user.profilePicture}` : '';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    const loadingId = toast.loading('Updating profile picture...');
    try {
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.user);
      toast.success('Profile picture updated', { id: loadingId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture', { id: loadingId });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">$</div>
          <span className="sidebar-brand-name">Expense Tracker</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">{initialsFromName(user?.name)}</div>
            )}
            <button
              type="button"
              className="sidebar-avatar-edit"
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label="Update profile picture"
              title="Update profile picture"
            >
              <CameraIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          <div className="sidebar-profile-name">{user?.name}</div>
          <div className="sidebar-profile-email">{user?.email}</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
