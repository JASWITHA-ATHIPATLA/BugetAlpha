import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { API_ORIGIN } from '../api/axios';
import { initialsFromName } from '../utils/format';
import { GridIcon, TrendUpIcon, TrendDownIcon, ChartIcon, SettingsIcon, LogoutIcon, CameraIcon, CloseIcon } from './Icons';

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
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  const avatarUrl = user?.profilePicture ? `${API_ORIGIN}${user.profilePicture}` : '';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarPreview = () => {
    if (avatarUrl) setShowAvatarPreview(true);
  };

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
              <button
                type="button"
                className="sidebar-avatar-preview-trigger"
                onClick={handleAvatarPreview}
                aria-label="View profile picture"
                title="View profile picture"
              >
                <img src={avatarUrl} alt={user?.name} className="sidebar-avatar" />
              </button>
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
      {showAvatarPreview && avatarUrl && (
        <div className="modal-overlay avatar-preview-overlay" onClick={() => setShowAvatarPreview(false)}>
          <div
            className="avatar-preview-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-preview-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="avatar-preview-title">Profile picture</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAvatarPreview(false)}
                aria-label="Close profile picture preview"
              >
                <CloseIcon />
              </button>
            </div>
            <img src={avatarUrl} alt={`${user?.name}'s profile`} className="avatar-preview-image" />
            <button type="button" className="btn btn-accent avatar-preview-update" onClick={handleAvatarClick}>
              <CameraIcon /> Update profile picture
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
