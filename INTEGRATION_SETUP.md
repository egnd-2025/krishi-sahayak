# Krishi Sahayak - Backend Integration Setup

## Overview
This document outlines the integration between the Krishi Sahayak frontend and the x402 backend system, maintaining the design principles of being simple, mobile-first, and language-inclusive for rural users.

## Features Implemented

### 1. User Authentication Flow
- **Registration**: Users can sign up with name, email, phone, village, state, and crop type
- **Login**: Users can sign in with email/username and password
- **JWT Token Management**: Automatic token storage and API authentication

### 2. Land Registration
- **Interactive Map**: Users can draw polygons on satellite imagery to mark their land
- **Area Calculation**: Automatic calculation of land area in square meters
- **Backend Integration**: Land data is saved to the backend with polygon coordinates

### 3. AI-Powered Insights
- **Land Analysis**: Satellite data analysis for soil conditions, weather patterns
- **Crop Recommendations**: AI-suggested crops based on land analysis
- **Product Recommendations**: Smart recommendations for seeds, fertilizers, tools, pesticides

### 4. Ordering System
- **One-Click Ordering**: Direct integration with x402 merchant system
- **Order Management**: View order history and status
- **Agentic Recommendations**: AI-driven automatic ordering suggestions

### 5. Multi-Language Support
- **9 Indian Languages**: English, Hindi, Punjabi, Kannada, Tamil, Telugu, Bengali, Gujarati, Marathi
- **Rural-Friendly**: Simple, clear translations for farming terminology
- **Mobile-First**: Optimized for mobile devices used by rural farmers

## Technical Architecture

### Frontend Structure
```
src/
├── app/
│   ├── dashboard/page.js          # Main dashboard with tabs
│   ├── layout.js                  # Root layout with providers
│   └── page.js                    # Landing page with auth
├── components/
│   ├── AuthForm.js                # Registration/login form
│   ├── LanguageSwitcher.js        # Language selection
│   └── Map.js                     # Interactive land selection map
├── contexts/
│   ├── AuthContext.js             # Authentication state management
│   └── LanguageContext.js         # Multi-language support
└── services/
    └── api.js                     # Backend API integration
```

### Backend Integration
- **API Service**: Centralized service for all backend communication
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Token Management**: Automatic JWT token handling for authenticated requests

## Setup Instructions

### 1. Backend Setup
```bash
cd x402/backend
npm install
# Set up your database and environment variables
npm start
```

### 2. Frontend Setup
```bash
cd krishi-sahayak
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5001/api
# NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
npm run dev
```

### 3. Environment Variables
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## User Flow

### 1. Registration
1. User fills out registration form with personal and farming details
2. System creates account and redirects to land selection
3. User draws polygon on map to mark their land area
4. Land data is saved to backend with satellite integration

### 2. Dashboard Access
1. User logs in with credentials
2. System loads AI-powered insights and recommendations
3. User can view land analysis, crop suggestions, and product recommendations

### 3. Ordering
1. User browses AI-generated product recommendations
2. One-click ordering integrates with x402 merchant system
3. Order tracking and history available in dashboard

## API Endpoints Used

### Authentication
- `POST /api/user/signup` - User registration
- `POST /api/user/signin` - User login

### Land Management
- `POST /api/land/add` - Add land with polygon data
- `GET /api/land/:id` - Get user's land information

### AI & Recommendations
- `POST /api/agentic/analyze-and-order` - Get comprehensive analysis
- `GET /api/agentic/recommendations/:userId` - Get recommendations only
- `POST /api/agentic/execute-ordering` - Execute ordering

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

## Design Principles Maintained

### 1. Rural User Friendly
- Large, clear buttons and text
- Simple navigation with icons
- Minimal cognitive load
- Clear visual feedback

### 2. Mobile First
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile data usage
- Offline-capable components

### 3. Language Inclusive
- 9 Indian languages supported
- Farming-specific terminology
- Cultural context awareness
- Easy language switching

### 4. Good Looking
- Modern, clean design
- Green color scheme for agriculture theme
- Consistent visual hierarchy
- Professional appearance

## Future Enhancements

1. **Offline Support**: Cache data for offline usage
2. **Push Notifications**: Weather alerts and farming reminders
3. **Voice Support**: Voice commands in local languages
4. **Image Recognition**: Plant disease identification
5. **Community Features**: Farmer-to-farmer communication

## Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox token configuration
2. **API errors**: Verify backend is running on correct port
3. **Authentication issues**: Check JWT token handling
4. **Language not switching**: Clear browser cache

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## Support
For technical support or feature requests, please refer to the project documentation or contact the development team.


