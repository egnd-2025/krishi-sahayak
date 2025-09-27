import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "./mapbox.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = ({ onAreaUpdate }) => {
  const map = useRef(null);
  const mapContainer = useRef(null);
  const [mapError, setMapError] = useState(null);

  const lng = 78.0322;
  const lat = 30.3165;
  const zoom = 8.51;

  useEffect(() => {
    if (map.current) return;
    
    // Check if we have a valid token
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ) {
      setMapError('Please configure a valid Mapbox token');
      return;
    }
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current || "",
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false,
      });
    } catch (error) {
      setMapError('Failed to load map: ' + error.message);
      return;
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      container: "geocoder",
    });

    map.current.addControl(draw);
    map.current.addControl(geocoder);

    async function updateArea(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const areaValue = turf.area(data);
        const rounded_area = Math.round(areaValue * 100) / 100;
        const pointGeo = turf.centerOfMass(data);

        const polygonCoordinates = data.features[0].geometry.coordinates[0];

        // Get the country information
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointGeo.geometry.coordinates[0]},${pointGeo.geometry.coordinates[1]}.json?access_token=${mapboxgl.accessToken}`
          );
          const geoData = await response.json();
          const country = geoData.features.find((feature) =>
            feature.id.includes("country")
          )?.place_name || "Unknown";

          onAreaUpdate(rounded_area, pointGeo, country, polygonCoordinates);
        } catch (error) {
          console.error('Geocoding error:', error);
          onAreaUpdate(rounded_area, pointGeo, "Unknown", polygonCoordinates);
        }
      } else {
        if (e.type !== "draw.delete") alert("Click the map to draw a polygon.");
      }
    }

    map.current.on("draw.create", updateArea);
    map.current.on("draw.delete", updateArea);
    map.current.on("draw.update", updateArea);
  });

  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6 max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Map Setup Required</h3>
          <p className="text-gray-600 text-sm mb-4">{mapError}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">Get Your Free Mapbox Token:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Go to <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline font-medium">mapbox.com/access-tokens</a></li>
              <li>2. Sign up for a free account</li>
              <li>3. Copy your default public token</li>
              <li>4. Replace the token in <code className="bg-blue-100 px-1 rounded text-xs">.env.local</code></li>
              <li>5. Restart the development server</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Note:</strong> The current token is a demo token that doesn't work. You need your own free token.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      <div
        id="geocoder"
        className="geocoder absolute top-0 left-0 m-4"
      ></div>
    </div>
  );
};

export default Map;
