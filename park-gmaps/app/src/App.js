import React, { useState, useEffect, useRef } from 'react';
import './css-reset.css';
import './App.scss';
import STYLE from './MapStyle.json';

function App() {
	const [state, setState] = useState({
		mapReady: false
	});
	const map = useRef(null);

	if (!state.mapReady) {
		const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
		const script = document.createElement('script'); //creates the html script element that points to external script via src
		script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY + '&libraries=places';
		script.async = true; 
		script.defer = true;
		script.addEventListener('load', () => {
		  setState({ mapReady: true });
		});
		document.head.append(script);
	}

	useEffect(() => {
		// load map after script added
		if (state.mapReady) {
			map.current = new window.google.maps.Map(
				document.getElementById('map'), {
					zoom: 12,
					center: {lat: 39.092965, lng: -94.583778}, // plexpod crossroads
					styles: STYLE //JSON map style imported from above
				}
			);
		}
	});

	const mapNavBtns = () => {

	}

	return (
		<div className="App">
			<div className="App__navbar">
				{ mapNavBtns() }
			</div>
			<div className="App__map-group">
				<div id="map" className="App__map">
					<div className="App__address-input hidden"></div>
				</div>
				<div className="App__sidebar"></div>
			</div>
		</div>
	);
}

export default App;
