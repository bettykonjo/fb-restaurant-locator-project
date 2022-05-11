import {React, useCallback, useRef, useState, useContext, useEffect} from 'react'; 
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow
} from '@react-google-maps/api'; 
import LocationContext from '../../context/LocationContext';
import mapStyles from "./mapStyles";
import FastfoodIcon from '@material-ui/icons/Fastfood';
import '../../App.css'

import styled from "styled-components";
const MapWrapper = styled.div`
  border: 1px solid #666;  
   `;
// initializing some variable 
const mapContainerStyle = {
    height: "80vh",
    width: "50vw",    
};  
const options = {
    styles: mapStyles, 
    disableDefaultUI: true,
    zoomControl: true,
};
const libraries = ['places'];

const Map = () =>{
 
    // importing context to use coordinates and restaurants
    const { restaurants, coordinates, locations, backHome } = useContext(LocationContext);

    // useStates
    // when we click on the map "markers" will hold an object(s) with the lat,lng,and time of all the clicks
    const [markers, setMarkers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [center, setCenter] = useState();

    useEffect(() =>{
        //setting the center
        const lat = parseFloat(coordinates.lat,10);
        const lng = parseFloat(coordinates.long,10);
        setCenter({lat:lat, lng:lng})
        //setting the markers 
        // setMarkers(restaurants)
      }, [locations,coordinates,restaurants]); 


    // google maps hook the loads the google pai script 
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, 
        libraries
    });

    useEffect(() => {
        if(isLoaded) setMarkers(restaurants) ;
    },[restaurants, isLoaded]);

    //navigate to different page with Router useNavigate
    const navigate = useNavigate(); 

    const onMapClick = useCallback((event) => {
        setMarkers(current => [...current, {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            time: new Date(), 
        }])
    },[])


    // two variable. One is retains a ref to the map itself(map instance) to 
    // programmatically move where the map is. The call back function will be
    // passed in when the map loads( onLoad() ) and then passes the map instance that gives 
    // us the map which we can then assign to the ref.----// used ref to reference to 
    // the map without changing the state of map
    // can be used to later pan to a different spot or locate where user is 
    // and not change the state of map. ( used for LocateMe and Search function 
    // if I corporate it in this application which I haven't yet) //------
    // const mapRef = useRef(); 
    // const onMapLoad = useCallback((map) => {
    //     mapRef.current = map;
    // })

    const onSelectRest = (id) =>{
        navigate(`/place-details/${parseInt(id)}`);
    }


    // const panTo = useCallback(({lat,lng}) => {
    //     mapRef.current.panTo({lat, lng});
    //     mapRef.current.setZoom(14); 
    // })

    // check if theres and  error or if map is still loading 
    if (loadError) return console.log("Error Loading maps");
    if (!isLoaded) return console.log("Loading Maps");

    return(
        <MapWrapper>
            {/* The map component inside which all other components render */}
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={15.25}
                center={center}
                options={options}
                onClick={onMapClick} 
                // onLoad={onMapLoad} ---This callback is called when 
                //the map instance has loaded. It is called with the map instance.
            > 
                {markers.map((marker) => (
                    <Marker 
                        key={marker.location_id} 
                        position={{lat: parseFloat(marker.latitude,10), lng: parseFloat(marker.longitude,10)}}
                        onClick={() =>{
                            setSelected(marker);
                        }}
                    /> 
                ))}
                {selected  ?(
                    <InfoWindow 
                        position={{lat: parseFloat(selected.latitude,10), lng: parseFloat(selected.longitude,10)}} 
                        onCloseClick={()=>{setSelected(null);}}>
                        <div>
                            <div className='restName' onClick={() => onSelectRest(selected.location_id)}>
                                <h2>{selected.name}</h2>
                            </div>
                            <p> Address:{selected.address_obj.street1} {selected.address_obj.city}, {selected.address_obj.state}</p>
                            <p> Phone Number: {selected.phone}</p>
                        </div>
                    </InfoWindow>
                ) : 
                    null
                }
            </GoogleMap>
        </MapWrapper>
    )

}
export default Map;
