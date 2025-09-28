'use client';

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./mapbox.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = ({ onAreaUpdate }) => {
  const map = useRef(null);
  const mapContainer = useRef(null);

  const lng = 78.0322;
  const lat = 30.3165;
  const zoom = 8.51;

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });

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
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointGeo.geometry.coordinates[0]},${pointGeo.geometry.coordinates[1]}.json?access_token=${mapboxgl.accessToken}`
        );
        const geoData = await response.json();
        const country = geoData.features.find((feature) =>
          feature.id.includes("country")
        ).place_name;

        onAreaUpdate(rounded_area, pointGeo, country, polygonCoordinates);
      } else {
        if (e.type !== "draw.delete") alert("Click the map to draw a polygon.");
      }
    }

    map.current.on("draw.create", updateArea);
    map.current.on("draw.delete", updateArea);
    map.current.on("draw.update", updateArea);
  });


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
