'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Map from './Map';
import apiService from '@/services/api';

const AuthForm = () => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    village: '',
    state: '',
    cropType: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [areaData, setAreaData] = useState(null);
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAreaUpdate = (area, center, country, coordinates) => {
    setAreaData({
      area: area,
      center: center,
      country: country,
      coordinates: coordinates
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.village.trim()) newErrors.village = 'Village/City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.cropType.trim()) newErrors.cropType = 'Crop type is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Register new user directly with API (don't use AuthContext register)
        const userData = {
          username: formData.name,
          email: formData.email,
          password: formData.password
        };
        
        const response = await apiService.signup(userData);
        
        if (response.success) {
          // Store user data locally but don't set as authenticated yet
          localStorage.setItem('temp_user_data', JSON.stringify(response.user));
          localStorage.setItem('temp_auth_token', response.token);
          
          // Show map for area selection after successful sign-up
          setIsSignUpComplete(true);
          setShowMap(true);
        } else {
          alert(response.error || 'Registration failed. Please try again.');
        }
      } else {
        // Login existing user
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Redirect to dashboard or show success
          window.location.href = '/dashboard';
        } else {
          alert(result.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cropTypes = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion', 'Chili', 'Other'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  // If showing map after sign-up
  if (showMap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🌾</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800">Krishi Sahayak</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('selectLandArea')}</h2>
            <p className="text-gray-600 text-center mb-6">{t('landAreaDescription')}</p>
            
            {/* Map Container */}
            <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200">
              <Map onAreaUpdate={handleAreaUpdate} />
            </div>

            {/* Area Information */}
            {areaData && (
              <div className="mt-6 bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">{t('areaSelected')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{t('area')}: </span>
                    <span className="text-green-700">{areaData.area.toFixed(2)} sq meters</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('country')}: </span>
                    <span className="text-green-700">{areaData.country}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('center')}: </span>
                    <span className="text-green-700">
                      {areaData.center.geometry.coordinates[1].toFixed(4)}, {areaData.center.geometry.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMap(false);
                  setIsSignUpComplete(false);
                  setIsSignUp(false);
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {t('back')}
              </button>
              <button
                onClick={async () => {
                  if (!areaData) {
                    alert('Please select an area on the map first.');
                    return;
                  }
                  
                  try {
                    setIsLoading(true);
                    
                    // Get user ID from temp storage
                    const userData = JSON.parse(localStorage.getItem('temp_user_data'));
                    if (!userData) {
                      alert('User not found. Please try logging in again.');
                      return;
                    }
                    
                    // Save land data to backend
                    const landData = {
                      id: userData.id,
                      area: areaData.area,
                      country: areaData.country,
                      latitude: areaData.center.geometry.coordinates[1],
                      longitude: areaData.center.geometry.coordinates[0],
                      polygonCoordinates: areaData.coordinates
                    };
                    
                    const response = await apiService.addLand(landData);
                    
                    if (response.land) {
                      // Now authenticate the user and redirect to dashboard
                      localStorage.setItem('auth_token', localStorage.getItem('temp_auth_token'));
                      localStorage.setItem('user_data', localStorage.getItem('temp_user_data'));
                      localStorage.removeItem('temp_user_data');
                      localStorage.removeItem('temp_auth_token');
                      
                      alert('Account setup complete! Welcome to Krishi Sahayak!');
                      window.location.href = '/dashboard';
                    } else {
                      alert('Land registration failed. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error saving land data:', error);
                    alert('Error saving land data. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading || !areaData}
              >
                {isLoading ? 'Saving...' : t('continue')}
              </button>
              <button
                onClick={() => {
                  // Skip area selection but still authenticate user
                  const userData = JSON.parse(localStorage.getItem('temp_user_data'));
                  if (userData) {
                    localStorage.setItem('auth_token', localStorage.getItem('temp_auth_token'));
                    localStorage.setItem('user_data', localStorage.getItem('temp_user_data'));
                    localStorage.removeItem('temp_user_data');
                    localStorage.removeItem('temp_auth_token');
                  }
                  
                  alert('Account setup complete! You can add your land area later.');
                  window.location.href = '/dashboard';
                }}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                {t('skip')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌾</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800">Krishi Sahayak</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('welcome')}</h2>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSignUp 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSignUp 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('signUp')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('village')} *
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                      errors.village ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your village or city"
                  />
                  {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('state')} *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cropType')} *
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                      errors.cropType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your main crop</option>
                    {cropTypes.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  {errors.cropType && <p className="text-red-500 text-xs mt-1">{errors.cropType}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmPassword')} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? t('createAccount') : t('login')
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isSignUp ? t('signIn') : t('signUp')}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">🌦️</div>
            <p className="text-sm font-medium text-gray-700">{t('weather')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">🌾</div>
            <p className="text-sm font-medium text-gray-700">{t('crops')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm font-medium text-gray-700">{t('market')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">❓</div>
            <p className="text-sm font-medium text-gray-700">{t('help')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
