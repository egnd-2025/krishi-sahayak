'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import apiService from '@/services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load insights and recommendations
      const analysisResult = await apiService.analyzeAndOrder(user.id);
      
      if (analysisResult.success) {
        setInsights(analysisResult.analysis);
        setRecommendations(analysisResult.ordering?.orderReadyRecommendations || []);
      }
      
      // Load order history
      const orderHistory = await apiService.getOrderHistory(user.id);
      if (orderHistory.success) {
        setOrders(orderHistory.orders || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(t('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderProduct = async (recommendation) => {
    try {
      setIsLoading(true);

      // Create order for the specific recommendation
      const orderData = {
        userId: user.id,
        items: [{
          product_name: recommendation.product,
          quantity: recommendation.quantity,
          unit_price: recommendation.estimatedCost
        }],
        notes: `${t('orderedVia')}: ${recommendation.reason}`
      };
      
      const orderResult = await apiService.createOrder(orderData);
      
      if (orderResult.success) {
        alert(t('orderPlaced'));
        loadDashboardData(); // Refresh data
      } else {
        alert(t('orderFailed'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(t('errorPlacingOrder'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-green-100 relative z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🌾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Krishi Sahayak</h1>
              <p className="text-xs text-gray-500">Smart Agriculture Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">{t('welcome')}, <span className="font-medium">{user.username}</span></span>
            </div>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 relative z-30">
          <div className="flex space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2">
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="text-base mr-2">🌱</span>
              {t('insights')}
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="text-base mr-2">🛒</span>
              {t('recommendations')}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="text-base mr-2">📋</span>
              {t('orders')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <span className="text-gray-600 mt-4 font-medium">{t('loading')}</span>
              <span className="text-gray-400 text-sm mt-1">Analyzing your farm data...</span>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center mb-3">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Insights Tab */}
              {activeTab === 'insights' && insights && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">{t('landAnalysisInsights')}</h2>
                    <p className="text-gray-600">{t('aiPoweredAnalysis')}</p>
                  </div>
                  
                  {/* Automated Ordering Results */}
                  {insights.ordering?.automated && (
                    <div className={`rounded-xl p-6 shadow-lg border-l-4 ${
                      insights.ordering.automated.success
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400'
                    }`}>
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🤖</span>
                        <h3 className={`text-xl font-bold ${
                          insights.ordering.automated.success
                            ? 'text-green-800'
                            : 'text-yellow-800'
                        }`}>
                          {t('automatedOrderingResults')}
                        </h3>
                      </div>
                      <p className={`text-base ${
                        insights.ordering.automated.success
                          ? 'text-green-700'
                          : 'text-yellow-700'
                      }`}>
                        {insights.ordering.automated.message || t('automatedOrderingCompleted')}
                      </p>
                      {insights.ordering.automated.error && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 font-medium">
                            ❌ {t('error')}: {insights.ordering.automated.error}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  
                  {/* Land Analysis */}
                  {insights.landAnalysis && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border border-green-200">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🌍</span>
                        <h3 className="text-xl font-bold text-green-800">{t('landAnalysis')}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Land Information */}
                        {insights.landAnalysis.land && (
                          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-green-100 hover:border-green-300">
                            <div className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                              <span className="mr-2">🏞️</span>
{t('landDetails')}
                            </div>
                            <div className="space-y-2">
                              {insights.landAnalysis.land.area && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('area')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.land.area} sq ft</span>
                                </div>
                              )}
                              {insights.landAnalysis.land.country && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('country')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.land.country}</span>
                                </div>
                              )}
                              {insights.landAnalysis.land.latitude && insights.landAnalysis.land.longitude && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('location')}:</span>
                                  <span className="text-green-700 font-medium text-xs">
                                    {insights.landAnalysis.land.latitude}, {insights.landAnalysis.land.longitude}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Weather Conditions */}
                        {insights.landAnalysis.conditions && (
                          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-green-100 hover:border-green-300">
                            <div className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                              <span className="mr-2">🌤️</span>
{t('weatherConditions')}
                            </div>
                            <div className="space-y-2">
                              {insights.landAnalysis.conditions.temperature && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('temperature')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.temperature}°C</span>
                                </div>
                              )}
                              {insights.landAnalysis.conditions.humidity && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('humidity')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.humidity}%</span>
                                </div>
                              )}
                              {insights.landAnalysis.conditions.weather && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('weather')}:</span>
                                  <span className="text-green-700 font-medium capitalize">{insights.landAnalysis.conditions.weather}</span>
                                </div>
                              )}
                              {insights.landAnalysis.conditions.windSpeed && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('windSpeed')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.windSpeed} m/s</span>
                                </div>
                              )}
                              {insights.landAnalysis.conditions.rainProbability && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('rainChance')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.rainProbability}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Soil & Crop Health */}
                        {insights.landAnalysis.conditions && (
                          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-green-100 hover:border-green-300">
                            <div className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                              <span className="mr-2">🌱</span>
{t('soilCropHealth')}
                            </div>
                            <div className="space-y-2">
                              {insights.landAnalysis.conditions.ndvi && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('ndvi')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.ndvi}</span>
                                </div>
                              )}
                              {insights.landAnalysis.conditions.uvIndex && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{t('uvIndex')}:</span>
                                  <span className="text-green-700 font-medium">{insights.landAnalysis.conditions.uvIndex}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Crop Recommendations */}
                  {insights.cropRecommendations && Array.isArray(insights.cropRecommendations) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-200">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🌾</span>
                        <h3 className="text-xl font-bold text-blue-800">{t('cropRecommendations')}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.cropRecommendations.map((crop, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-blue-100 hover:border-blue-300">
                                  <div className="text-xl font-bold text-blue-700 mb-3 flex items-center">
                                    <span className="mr-2">🌱</span>
                                    {crop.name || crop.crop || 'Unknown Crop'}
                                  </div>
                            
                            {crop.score && (
                              <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">{t('recommendationScore')}</span>
                                  <span className="text-sm font-bold text-blue-600">{crop.score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${crop.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {crop.reasons && Array.isArray(crop.reasons) && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">{t('whyThisCrop')}</div>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {crop.reasons.slice(0, 3).map((reason, reasonIndex) => (
                                    <li key={reasonIndex} className="flex items-start">
                                      <span className="text-blue-500 mr-1">•</span>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {crop.benefits && (
                              <div className="text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded-lg">
                                <strong className="text-blue-700">{t('benefits')}:</strong> {crop.benefits}
                              </div>
                            )}

                                  <div className="grid grid-cols-2 gap-2 text-xs">
                              {crop.season && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <strong>{t('season')}:</strong> {crop.season}
                                </div>
                              )}
                              {crop.waterRequirement && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <strong>{t('water')}:</strong> {crop.waterRequirement}
                                </div>
                              )}
                              {crop.yield && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <strong>{t('yield')}:</strong> {crop.yield}
                                  </div>
                              )}
                              {crop.marketPrice && (
                                <div className="bg-green-50 p-2 rounded text-green-700 font-medium">
                                  <strong>{t('price')}:</strong> ₹{crop.marketPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {insights.aiInsights && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border border-purple-200">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🧠</span>
                        <h3 className="text-xl font-bold text-purple-800">{t('aiInsights')}</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="text-gray-700 leading-relaxed">
                          {typeof insights.aiInsights === 'string' ? (
                            <p>{insights.aiInsights}</p>
                          ) : Array.isArray(insights.aiInsights) ? (
                            <ul className="space-y-2">
                              {insights.aiInsights.map((insight, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-purple-500 mr-2 mt-1">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{JSON.stringify(insights.aiInsights, null, 2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && recommendations && Array.isArray(recommendations) && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">{t('productRecommendations')}</h2>
                    <p className="text-gray-600">Personalized product suggestions for your farm</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                        {/* Priority Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            rec.priority === 'high'
                              ? 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md'
                              : rec.priority === 'medium'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                              : 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md'
                          }`}>
                            {String(rec.priority || 'low')}
                          </span>
                        </div>

                        {/* Product Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                          <span className="text-2xl">🛒</span>
                        </div>

                        {/* Product Name */}
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors mb-3 pr-20">
                          {String(rec.product || 'Unknown Product')}
                        </h3>

                        {/* Reason */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-green-200">
                            {String(rec.reason || 'No reason provided')}
                          </p>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="text-sm text-gray-700">
                            <div className="font-medium text-gray-600 mb-1">{t('quantity')}</div>
                            <span className="text-green-700 font-bold text-lg">{String(rec.quantity || 'N/A')}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('totalPrice')}</div>
                            <span className="text-2xl font-bold text-green-600">
                              ₹{typeof rec.estimatedCost === 'number' ? rec.estimatedCost.toFixed(2) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Order Button */}
                        <button
                          onClick={() => handleOrderProduct(rec)}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden text-sm sm:text-base"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                          {isLoading ? (
                            <div className="flex items-center justify-center relative z-10">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span className="truncate">{t('processing')}</span>
                            </div>
                          ) : (
                            <span className="flex items-center justify-center relative z-10">
                              <span className="mr-1 sm:mr-2">🛒</span>
                              <span className="truncate">{t('orderNow')}</span>
                            </span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">{t('orderHistory')}</h2>
                    <p className="text-gray-600">Track your agricultural supplies and orders</p>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-6xl">📋</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noOrdersYet')}</h3>
                      <p className="text-gray-500 mb-6">{t('startByChecking')}</p>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
{t('viewRecommendations')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                <span className="text-xl">📦</span>
                              </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-700 transition-colors">
{t('orderNumber')}{order.order_id}
                                </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <span className="mr-1">💰</span>
{t('total')}: <span className="font-semibold text-green-600 ml-1">₹{order.total_amount}</span>
                                </span>
                                <span className="flex items-center">
                                  <span className="mr-1">📅</span>
                                  {order.created_at}
                                </span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                              order.status === 'completed'
                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md'
                                : order.status === 'pending'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                                : 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          {order.notes && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 mt-4">
                              <div className="flex items-start">
                                <span className="text-gray-500 mr-2 mt-1">💬</span>
                              <p className="text-sm text-gray-700 leading-relaxed">{order.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Krishi Sahayak</span> - Empowering farmers with AI-driven insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
