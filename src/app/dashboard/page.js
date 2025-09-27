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
      console.log('Analysis result:', analysisResult);
      
      if (analysisResult.success) {
        console.log('Analysis data:', analysisResult.analysis);
        console.log('Ordering data:', analysisResult.ordering);
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
      setError('Failed to load dashboard data. Please try again.');
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
          product: recommendation.product,
          quantity: recommendation.quantity,
          price: recommendation.estimatedCost
        }],
        totalAmount: recommendation.estimatedCost,
        notes: `Ordered via Krishi Sahayak: ${recommendation.reason}`
      };
      
      const orderResult = await apiService.createOrder(orderData);
      
      if (orderResult.success) {
        alert('Order placed successfully!');
        loadDashboardData(); // Refresh data
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{t('welcome')}, {user.username}</span>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌱 {t('insights')}
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🛒 {t('recommendations')}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 {t('orders')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600">{t('loading')}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Insights Tab */}
              {activeTab === 'insights' && insights && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Land Analysis & Insights</h2>
                  
                  {/* Automated Ordering Results */}
                  {insights.ordering?.automated && (
                    <div className={`rounded-lg p-4 ${
                      insights.ordering.automated.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <h3 className={`text-lg font-semibold mb-3 ${
                        insights.ordering.automated.success 
                          ? 'text-green-800' 
                          : 'text-yellow-800'
                      }`}>
                        🤖 Automated Ordering Results
                      </h3>
                      <p className={`text-sm ${
                        insights.ordering.automated.success 
                          ? 'text-green-700' 
                          : 'text-yellow-700'
                      }`}>
                        {insights.ordering.automated.message || 'Automated ordering completed'}
                      </p>
                      {insights.ordering.automated.error && (
                        <p className="text-xs text-red-600 mt-2">
                          Error: {insights.ordering.automated.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Debug Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Debug Info</h3>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(insights, null, 2)}
                    </pre>
                  </div>
                  
                  {/* Land Analysis */}
                  {insights.landAnalysis && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">Land Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(insights.landAnalysis).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="ml-2 text-green-700">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crop Recommendations */}
                  {insights.cropRecommendations && Array.isArray(insights.cropRecommendations) && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Crop Recommendations</h3>
                      <div className="space-y-2">
                        {insights.cropRecommendations.map((crop, index) => (
                          <div key={index} className="bg-white rounded-lg p-3">
                            <span className="font-medium text-gray-700">{String(crop)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {insights.aiInsights && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">AI Insights</h3>
                      <p className="text-gray-700">{String(insights.aiInsights)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && recommendations && Array.isArray(recommendations) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Recommendations</h2>
                  
                  {/* Debug Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations Debug</h3>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(recommendations, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{String(rec.product || 'Unknown Product')}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {String(rec.priority || 'low')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{String(rec.reason || 'No reason provided')}</p>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Quantity: {String(rec.quantity || 'N/A')}</span>
                          <span className="font-semibold text-green-600">
                            ₹{typeof rec.estimatedCost === 'number' ? rec.estimatedCost.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleOrderProduct(rec)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-gray-600">No orders yet. Check out our recommendations!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">Order #{order.order_id}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            Total: ₹{order.total_amount} • {order.created_at}
                          </div>
                          
                          {order.notes && (
                            <p className="text-sm text-gray-500">{order.notes}</p>
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
    </div>
  );
};

export default Dashboard;
