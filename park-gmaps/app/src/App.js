import React, { useState, useEffect, useRef } from 'react';
import './css-reset.css';
import './App.scss';
import STYLE from './MapStyle.json';

function App() {
	const [map, setMap] = useState({ ready: false }); // ehh this sucks
	const [searchLayout, setSearchLayout] = useState({ active: true });
	const [addressInput, setAddressInput] = useState({ active: true });
	const [autoComplete, setAutoComplete] = useState({ loaded: false });
	const [center, setCenter] = useState({
		lat: 39.092965,
		lng: -94.583778 // plexpod crossroads
	});
	const mapTarget = useRef(null); 
	const mapBtnSearch = useRef(null);
	const mapBtnAddParks = useRef(null);
	const autoCompleteInput = useRef(null);
	const addressInputParent = useRef(null);
	const addressInputGroup = useRef(null);
	

	if (!map.ready) {
		const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
		const script = document.createElement('script'); //creates the html script element that points to external script via src
		script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY + '&libraries=places';
		script.async = true; 
		script.defer = true;
		script.addEventListener('load', () => {
		  setMap({ ready: true });
		});
		document.head.append(script);
	}

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

			bindAutoCompleteInput();
		}
	}, [map]);

	// hide overlay after changing location
	// useEffect(() => {
	// 	if (map.ready && addressInputGroup.current && addressInputParent) {
	// 		showAddressSearchOverlay(false);
	// 	}
	// }, [center]);

	const clearAndFocusAddressInput = () => {
		const autoCompleteInput = document.querySelector('.App__autocomplete');
		if (autoCompleteInput) {
			autoCompleteInput.value = ""; // reset
			autoCompleteInput.focus();
		}
	};

	const bindAutoCompleteInput = () => {
		autoCompleteInput.current = new window.google.maps.places.Autocomplete(
			autoCompleteInput.current,
			{ types: ['geocode'] }
		);
		autoCompleteInput.current.addListener( 'place_changed', updateLocation );
		clearAndFocusAddressInput();
	};

	useEffect(() => {
		if (
			(map.isReady && autoCompleteInput.current && Object.entries( window.google ).length !== 0 && window.google.constructor === Object)
		) {
			bindAutoCompleteInput();
		}
	}, [searchLayout]);

	const toggleSearchLayout = (active) => {
		setSearchLayout({ active: active });
		showAddressSearchOverlay(active); // this is somewhat lazy, could have put an icon over map
		clearAndFocusAddressInput();
	}

	const updateLocation = () => {
		const selectedPlace = autoCompleteInput.current.getPlace();
		if ( selectedPlace ) {
			// setCenter({
			// 	"lat": selectedPlace.geometry.location.lat(),
			// 	"lng": selectedPlace.geometry.location.lng()
			// });

			// changing state causes isues with auto complete input not being ready on re-render
			mapTarget.current.setCenter({
				"lat": selectedPlace.geometry.location.lat(),
				"lng": selectedPlace.geometry.location.lng()
			});
			showAddressSearchOverlay(false);
		} else {
			alert( 'Failed to determine location' );
    	}
	}

	const mapNavBtns = () => {
		return (
			<>
				<button
					type="button"
					ref={ mapBtnSearch } onClick={ () => toggleSearchLayout(true) }
					className={ !searchLayout.active ? "" : "active" }
				>Search Parks Near Me</button>
				<button
					type="button"
					ref={ mapBtnAddParks } onClick={ () => toggleSearchLayout(false) }
					className={ searchLayout.active ? "" : "active" }
				>Add Parks Manually</button>
			</>
		);
	}

	const showAddressSearchOverlay = (show) => {
		// this is ugly, bad foresight, direct manipulation no state
		// setAddressInput({ active: false }); // ugly app refresh original
		addressInputGroup.current.style.display = show ? 'flex' : 'none';
		addressInputParent.current.classList = show ? "App__map-group dark-overlay" : "App__map-group";
	};

	const info = () => {
		return (
			<>
				<h1>Park Finder Demo</h1>
				<p>After you search a location, to reset, click on "Search Parks Near Me"</p>
			</>
		);
	};

	return (
		<div className="App">
			<div className="App__row">
				<div className="App__info">
					{ info() }
				</div>
				<div className="App__map-wrapper">
					<div className="App__navbar">
						{ mapNavBtns() }
					</div>
					<div ref={ addressInputParent } className={ addressInput.active ? "App__map-group dark-overlay" : "App__map-group" }>
						<div
							className={
								addressInput.active ? "App__address-input" : "App__address-input hidden"
							}
							ref={ addressInputGroup }>
							<input type="text" className="App__autocomplete" placeholder="search a location" ref={ autoCompleteInput } />
							<button type="button" className="App__cancel-search" onClick={ () => showAddressSearchOverlay(false) }>Cancel</button>
						</div>
						<div id="map" className="App__map"></div>
						<div className={ searchLayout.active ? "App__sidebar hidden" : "App__sidebar" }></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
