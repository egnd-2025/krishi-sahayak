# Mapbox Setup Instructions

To use the map functionality in Krishi Sahayak, you need to set up a Mapbox access token.

## Steps to Get Your Mapbox Token:

1. **Create a Mapbox Account**
   - Go to [https://account.mapbox.com/](https://account.mapbox.com/)
   - Sign up for a free account

2. **Get Your Access Token**
   - Once logged in, go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - Copy your default public token

3. **Add Token to Your Environment**
   - Create a `.env.local` file in your project root
   - Add the following line:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
   ```
   - Replace `your_token_here` with your actual Mapbox token

4. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## Features Included:

- **Interactive Map**: Satellite view with drawing tools
- **Area Selection**: Draw polygons to mark farming areas
- **Area Calculation**: Automatic calculation of selected area in square meters
- **Location Detection**: Automatic country and coordinate detection
- **Geocoder**: Search for specific locations
- **Multi-language Support**: All map interface text supports 9 Indian languages

## Map Controls:

- **Draw Polygon**: Click and drag to create a polygon around your land
- **Delete**: Remove the drawn polygon
- **Search**: Use the search box to find specific locations
- **Zoom**: Pinch to zoom or use mouse wheel

## Note:

The map is only shown after successful sign-up to help farmers mark their land areas for better agricultural assistance and recommendations.
