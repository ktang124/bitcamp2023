import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {useEffect, useRef} from "react";

export function Map() {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN ?? '';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-76, 39],
      zoom: 5
    })
  }, []);
  return (
    <div className="flex-grow" ref={mapContainer}/>
  );
}

export default function Home() {
  return <div className="flex min-h-screen">
    <select className="select select-bordered w-full max-w-xs">
      <option disabled selected>Who shot first?</option>
      <option>Han Solo</option>
      <option>Greedo</option>
    </select>
    <Map/>
  </div>
};
