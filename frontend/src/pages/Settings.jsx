import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { API_ORIGIN } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { initialsFromName } from '../utils/format';
import { CameraIcon } from '../components/Icons';

const Settings = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = user?.profilePicture ? `${API_ORIGIN}${user.profilePicture}` : '';

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
    const loadingId = toast.loading('Uploading photo...');
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

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim() });
      setUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile information.</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-avatar-row">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} className="settings-avatar" />
          ) : (
            <div className="settings-avatar">{initialsFromName(user?.name)}</div>
          )}
          <div className="settings-avatar-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <CameraIcon /> {uploading ? 'Uploading...' : 'Change photo'}
            </button>
            <span className="settings-avatar-hint">PNG or JPG, up to 2MB.</span>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
        </div>

        <form onSubmit={handleSaveName}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" value={user?.email || ''} disabled />
          </div>
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
