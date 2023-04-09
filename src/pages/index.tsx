// @ts-ignore
import mapboxgl, {Marker} from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {useEffect, useRef} from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import useSWR from 'swr'

import {Controller, FormProvider, useForm, useFormContext, useWatch} from "react-hook-form";
import {useDebounce} from 'react-use';
import {renderToString} from 'react-dom/server';
// var marker = new mapboxgl.Marker({
//   color: 'red',
//   size: 30,
//   opacity: 0.7
// }).setLngLat([-76, 39]).addTo(map);

// function updateMap(lat: number, lng: number) {
//   // var lat = parseFloat(document.getElementById('lat').value);
//   // var lng = parseFloat(document.getElementById('lng').value);
//   if (!isNaN(lat) && !isNaN(lng)) {
//     map.flyTo({center: [lng, lat], zoom: 10});
//     marker.setLngLat([lng, lat])
//   }
// }

function Slide({name, defaultValue, ...props}) {
  return <Controller
    name={name}
    defaultValue={defaultValue}
    render={({
               field: {onChange, onBlur, value, name, ref},
               fieldState: {invalid, isTouched, isDirty, error},
             }) => {
      function processOnChange(value) {
        onChange(value);
      }

      return (
        <Slider

          // onBlur={onBlur} // notify when input is touched
          // onChange={onChange} // send value to hook form
          // checked={value}
          // range
          onChange={processOnChange}
          value={value}
          // inputRef={ref}
          {...props}

        />
      );
    }}
  />
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// function TooltipBox({house}) {
//   console.log(house)
//   return <div>
//     <h3>{house.address}</h3>
//     <p>${house.price} per month</p>
//     <p>Bedrooms: {house.beds}</p>
//     <p>Baths: {house.baths}</p>
//     <img src={house.image_href} alt="image of house"/>
//     <a href={house.href} className="link" target="_blank">More info</a>
//
//
//   </div>
// }
function TooltipBox({house}) {
  return <div className="card w-96 bg-base-100 shadow-xl">
    <figure><img src={house.image_href} alt="House Picture"/></figure>
    <div className="card-body">
      <h2 className="card-title">{house.address}</h2>
      <p>${house.price} per month</p>
      <p>Bedrooms: {house.beds}</p>
      <p>Baths: {house.baths}</p>
      <div className="card-actions justify-end">
        <a className="btn btn-primary" href={house.href} target="_blank">Learn More</a>
      </div>
    </div>
  </div>
}

export function Map({}) {
  let {company, office, minutes, profile} = useWatch();
  console.log(company, office);

  let {data: coords} = useSWR(withParams(`http://localhost:8000/coordinates`, {company, office}), fetcher);
  let zoom = 11.5;
  if (!coords) {
    coords = [-100, 39];
    zoom = 3;
  }

  const {data: houses} = useSWR(withParams(`http://localhost:8000/houses`, {company, office}), fetcher);

  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  const marker = useRef<any>(null);

  const houseMarkers = useRef<any>([]);

  function addMarker(coords, color) {
    // @ts-ignore
    let marker1 = new mapboxgl.Marker({
      color,
      size: 30,
      opacity: 0.7
    });

    return marker1.setLngLat(coords).addTo(map.current);
  }

  function addHouseMarker(house, color) {
    // create DOM element for the marker
    // const el = document.createElement('div');
    // el.id = 'marker';
    // @ts-ignore
    let marker1 = new mapboxgl.Marker(
      {
        color,
        size: 30,
        opacity: 0.7
      });
    const tooltip = new mapboxgl.Popup({offset: 25, closeButton: false,
    maxWidth:'500px'}).setHTML(
      renderToString(<TooltipBox house={house}/>)
    );
    marker1.setPopup(tooltip);
    return marker1.setLngLat(house.coordinate).addTo(map.current);
  }


  useEffect(() => {
    houseMarkers.current.forEach((marker: Marker) => {
      marker.remove();
    });
    houseMarkers.current = [];
    // console.log(houses)
    houses?.forEach((house: any) => {
      const marker = addHouseMarker(house, 'blue');
      houseMarkers.current.push(marker);
    });

  }, [houses]);

  async function updateISO() {
    const [lon, lat] = coords;
    const query = await fetch(
      `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
      {method: 'GET'}
    );
    const data = await query.json();
    map.current.getSource('iso')?.setData(data);

  }

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN ?? '';
    map.current = new mapboxgl.Map({
      container: mapContainer.current, // Specify the container ID
      style: 'mapbox://styles/mapbox/streets-v12', // Specify which map style to use
      center: coords, // Specify the starting position
      zoom, // Specify the starting zoom
    });
    // @ts-ignore
    marker.current = addMarker(coords, 'red');
    map.current.on('load', () => {
      if (!map.current.getSource('iso')) {

        // When the map loads, add the source and layer
        map.current.addSource('iso', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        map.current.addLayer(
          {
            id: 'isoLayer',
            type: 'fill',
            // Use "iso" as the data source for this layer
            source: 'iso',
            layout: {},
            paint: {
              // The fill color for the layer is set to a light purple
              'fill-color': '#5a3fc0',
              'fill-opacity': 0.3
            }
          },
          'poi-label'
        );
      }

    });
  }, []);


  useEffect(() => {

    map.current?.flyTo({center: coords, zoom});

    marker.current.setLngLat(coords)
  }, [coords]);

  useEffect(() => {

    updateISO();
  },  [coords, minutes, profile]);
  return (

    <div className="flex-grow" ref={mapContainer}/>
  );
}

const price_marks = {
  0: '$0',
  500: '$500',
  1000: '$1000',
  1500: '$1500',
  2000: '$2000',
  2500: '$2500',
};
const distance_marks = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
}
const bedroom_marks = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
}

function withParams(url, params) {
  const actualParams = Object.entries(params).filter(([key, value]) => key && value);
  if (!actualParams.length) return url
  const paramsString = actualParams.map(([key, value]) => `${key}=${value}`).join('&');
  return `${url}?${paramsString}`;

}

export function Sidebar() {
  const {register, watch, setValue} = useFormContext()
  const {company, office, profile} = watch();
  const {data: companies} = useSWR('http://localhost:8000/companies', fetcher);

  const {data: offices} = useSWR(withParams(`http://localhost:8000/offices`, {company}), fetcher);
  const {data: coords} = useSWR(withParams(`http://localhost:8000/coordinates`, {company, office}), fetcher);
  useEffect(() => {
    setValue('office', null);
  },[company])
  // const {company, office} = formHooks.watch();
  // const onSubmit = (data: any) => console.log(data);

  return <div className="flex flex-col min-w-[300px] m-4">
    <div className="flex flex-col space-y-2">
      <p>Search for housing near companies</p>
      <select className="select select-bordered w-full max-w-xs" {...register("company")} defaultValue="">
        <option disabled value="">Company</option>
        {companies?.map((company: any) => <option key={company}>{company}</option>)}
      </select>
      <select className="select select-bordered w-full max-w-xs" {...register("office")} defaultValue="">
        <option disabled value="">Company Office</option>
        {offices?.map((office: any) => <option key={office}>{office}</option>)}
      </select>
      {coords && <span>Address: {JSON.stringify(coords)}</span>}
      <div className="divider">OR</div>
      <input className="input input-bordered" placeholder="Enter zipcode" name="zipcode"/>
    </div>
    <div className="mt-5 flex flex-col space-y-2">
      <p>Filters</p>
      <div className="space-x-3">
        <label>
          <input type="radio" className="hidden peer" {...register("profile")} value="walking"/>
          <div className="btn btn-success btn-outline peer-checked:bg-green-500 peer-checked:text-white">Walking</div>
        </label>

        <label>
          <input type="radio" className="hidden peer" {...register("profile")} value="driving"/>
          <div className="btn btn-success btn-outline peer-checked:bg-green-500 peer-checked:text-white">Driving</div>
        </label>
        <label>
          <input type="radio" className="hidden peer" defaultChecked {...register("profile")}
                 value="cycling"/>
          <div className="btn btn-success btn-outline peer-checked:bg-green-500 peer-checked:text-white">Cycling</div>
        </label>
      </div>
      <div className="mx-3 space-y-5">
        <div className="">
          <label className="label">
            <span className="label-text">Commute Distance (minutes)</span>
          </label>
          <Slide name="minutes" className="t-slider" defaultValue={25} startPoint={0} min={0} max={50}
                 marks={distance_marks}/>

        </div>
        <div>

          <label className="label">
            <span className="label-text">Price per month (min - max) </span>
          </label>
          <Slide name="price" range className="t-slider" defaultValue={[0, 2500]} min={0} max={2500} marks={price_marks}
                 pushable={250}/>
        </div>
        <div>

          <label className="label">
            <span className="label-text">Bedrooms</span>
          </label>
          <Slide name="bedrooms" range className="t-slider" defaultValue={[1, 4]} min={1} max={8} marks={bedroom_marks}
                 pushable={0}/>
        </div>
        <div>

          <label className="label">
            <span className="label-text">Bathrooms</span>
          </label>
          <Slide name="bathrooms" range className="t-slider" defaultValue={[1, 4]} min={1} max={8} marks={bedroom_marks}
                 pushable={0}/>
        </div>
      </div>


    </div>
  </div>
}

export default function Home() {
  // const [address, setAddress] = useState("");
  const methods = useForm({defaultValues: {company: "", office: "", minutes: 20, profile: "cycling"}})

  return <div className="flex min-h-screen">
    <FormProvider {...methods}>
      <Sidebar/>
      <Map/>
    </FormProvider>

  </div>
};
