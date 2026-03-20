import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../utils/api';
import { useToast } from '../SuccessAlert/SuccessAlert';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const UserDetails = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      logout();
      toast.success('Logged out successfully');
      navigate('/home');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        logout();
        toast.success('Logged out from all devices successfully');
        navigate('/home');
      } else {
        throw new Error('Failed to logout from all devices');
      }
    } catch (err) {
      console.error('Logout all error:', err);
      setError('Failed to logout from all devices. Please try again.');
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/single`, {
        method: 'POST',
        credentials: 'include',
        body: uploadData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData(prev => ({ ...prev, avatar: data.data.secure_url }));
        toast.success('Image uploaded successfully! Click Save to apply.');
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          avatar: formData.avatar
        }), 
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);

        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">User Details</h1>
        <p className="text-gray-600">You need to be logged in to view your details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Account</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.emailVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role === 'admin' ? 'Admin' : 'Customer'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      avatar: user.avatar || ''
                    });
                  }}
                  className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative group">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 text-3xl">👤</span>
              </div>
            )}
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {uploadingAvatar ? '...' : 'Upload'}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            )}
          </div>
          <div>
            <h3 className="text-xl font-medium">{user.name || 'User'}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{user.name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{user.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{user.phone || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your address"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md min-h-[72px]">
                {user.address || 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/my-orders')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Manage Sessions
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Security</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Change Password
              </button>
              {!user.emailVerified && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/auth/send-verify-email`, {
                        method: 'POST',
                        credentials: 'include',
                      });
                      const data = await response.json();
                      if (response.ok) {
                        toast.success(data.message || 'Verification email sent');
                      } else {
                        throw new Error(data.error || 'Failed to send verification email');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Failed to send verification email');
                    }
                  }}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Logout</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout from this device
              </button>
              <button
                onClick={() => {
                  if (confirm('This will logout you from all devices. Continue?')) {
                    handleLogoutAllDevices();
                  }
                }}
                className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
              >
                Logout from all devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to logout from this device?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;