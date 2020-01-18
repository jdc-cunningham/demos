import React, { useState, useEffect, useRef } from 'react';
import './css-reset.css';
import './App.scss';
import STYLE from './MapStyle.json';
// import axios from 'axios';

import Sidebar from './components/sidebar/Sidebar.js';
import Navbar from './components/navbar/Navbar.js';

import {
	bindAutoCompleteInput,
    clearMap,
    updateLocation,
    clearAndFocusAddressInput,
    clearPickerMapDisplay,
	updatePickedMapPoints,
	showAddressSearchOverlay,
	selectedRadius
} from './methods/map/map-methods.js';

/**
 * Dev notes: some of this is ugly, I did not realize until later eg. I should set state but directly modified css properties
 * due to ugly full-component re-render. I was trying to get this done in a night.
 */

const App = () => {
	const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
	const [map, setMap] = useState({ ready: false }); // ehh this sucks
	const [searchLayout, setSearchLayout] = useState({ active: true });
	const [addressInput, setAddressInput] = useState({ active: true });
	const [autoComplete, setAutoComplete] = useState({ loaded: false });
	const [center, setCenter] = useState({
		lat: 39.092965,
		lng: -94.583778 // plexpod crossroads
	});
	const mapBtnSearch = useRef(null);
	const mapBtnAddParks = useRef(null);

	if (!map.ready) {
		const script = document.createElement('script'); //creates the html script element that points to external script via src
		script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY + '&libraries=places';
		script.async = true; 
		script.defer = true;
		script.addEventListener('load', () => {
		  	setMap({ ready: true });
		});
		document.head.append(script);
	}

	const mapTarget = useRef(null); 
	const addressInputParent = useRef(null);
	const addressInputGroup = useRef(null);
	const pickedMapPointsDisplay = useRef(null);
	const autoCompleteInput = useRef(null);

	let searchLayoutActive = true; // this is bad,
	// but the setState isn't working or not bound to event anyway for canceling plotting of tree icons when switching to manual picker while async pagination in progress

	let selectedRadius = 15;

	useEffect(() => {
		// load map after script added
		if (map.ready) {
			mapTarget.current = new window.google.maps.Map(
				document.getElementById('map'), {
					zoom: 12,
					center: {
						lat: center.lat,
						lng: center.lng},
					styles: STYLE //JSON map style imported from above
				}
			);

			mapTarget.current.addListener('click', (e) => {
				updatePickedMapPoints(e.latLng);
			});

			bindAutoCompleteInput(autoCompleteInput);
		}
	}, [map]);

	useEffect(() => {
		if (
			(map.isReady && autoCompleteInput.current && Object.entries( window.google ).length !== 0 && window.google.constructor === Object)
		) {
			bindAutoCompleteInput(autoCompleteInput);
		}
	}, [searchLayout]);

	const toggleSearchLayout = (active) => {
		setSearchLayout({ active: active });
		searchLayoutActive = active;
		showAddressSearchOverlay(addressInputGroup, addressInputParent, active); // this is somewhat lazy, could have put an icon over map
		clearAndFocusAddressInput();
		clearMap();
	}

	const updateSearchRadius = (radius) => {
		selectedRadius = radius;

		// no no
		if (document.querySelector('.App__autocomplete').value) {
			updateLocation(addressInputGroup);
		}
	};

	return (
		<div className="App">
			<div className="App__row">
				<Sidebar />
				<div className="App__map-wrapper">
					<Navbar props={{ searchLayout, mapBtnSearch, mapBtnAddParks, toggleSearchLayout, updateSearchRadius }}/>
					<div ref={ addressInputParent } className={ addressInput.active ? "App__map-group dark-overlay" : "App__map-group" }>
						<div
							className={
								addressInput.active ? "App__address-input" : "App__address-input hidden"
							}
							ref={ addressInputGroup }>
							<input type="text" className="App__autocomplete" placeholder="search a location" ref={ autoCompleteInput } />
							<button type="button" className="App__cancel-search" onClick={ () => showAddressSearchOverlay(addressInputGroup, addressInputParent, false) }>Cancel</button>
						</div>
						<div id="map" className="App__map"></div>
						<div className={ searchLayout.active ? "App__sidebar hidden" : "App__sidebar" }>
							<h4>Click anywhere on the map and they will show up below.</h4>
							<button type="button" onClick={ () => clearPickerMapDisplay() }>Clear Map</button>
							<div className="App__sidebar-map-points" ref={ pickedMapPointsDisplay }></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
