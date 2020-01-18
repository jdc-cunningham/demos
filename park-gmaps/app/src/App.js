import React, { useState, useEffect, useRef } from 'react';
import './css-reset.css';
import './App.scss';
import STYLE from './MapStyle.json';
// import axios from 'axios';
import treeIcon from './tree-icon-100x100.png';

import Sidebar from './components/sidebar/Sidebar.js';
import Navbar from './components/navbar/Navbar.js';

/**
 * Dev notes: some of this is ugly, I did not realize until later eg. I should set state but directly modified css properties
 * due to ugly full-component re-render. I was trying to get this done in a night.
 */

// I think at some point these get emptied due to app re-render again bad structure/poor foresight
let pickedMapPoints = [];
let pickedMapMarkers = [];
let searchLayoutActive = true; // this is bad,
// but the setState isn't working or not bound to event anyway for canceling plotting of tree icons when switching to manual picker while async pagination in progress

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
	const mapTarget = useRef(null); 
	const mapBtnSearch = useRef(null);
	const mapBtnAddParks = useRef(null);
	const autoCompleteInput = useRef(null);
	const addressInputParent = useRef(null);
	const addressInputGroup = useRef(null);
	const pickedMapPointsDisplay = useRef(null);

	let placesService;
	let selectedRadius = 15;
	let activeMarkers = [];

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

			bindAutoCompleteInput();
		}
	}, [map]);

	useEffect(() => {
		if (
			(map.isReady && autoCompleteInput.current && Object.entries( window.google ).length !== 0 && window.google.constructor === Object)
		) {
			bindAutoCompleteInput();
		}
	}, [searchLayout]);

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

	const toggleSearchLayout = (active) => {
		setSearchLayout({ active: active });
		searchLayoutActive = active;
		showAddressSearchOverlay(active); // this is somewhat lazy, could have put an icon over map
		clearAndFocusAddressInput();
		clearMap();
	}
	
	const clearMap = () => {
		// technically should not do it for both
		// autocomplete
		if (activeMarkers.length) {
			activeMarkers.forEach((marker) => {
				marker.setMap(null);
			});
			activeMarkers = [];
		}

		// manual
		if (pickedMapMarkers.length) {
			pickedMapMarkers.forEach((marker) => {
				marker.setMap(null);
			});
			pickedMapMarkers = [];
			pickedMapPoints = [];
			pickedMapPointsDisplay.current.innerHTML = "";
		}
	};

	// skipping stuff or now like marker styling/click event/etc...
	// can add info of the park from results, show on click of icon in window
	const plotPoints = (points) => {
		// this is an ugly async thing... a pagination can still be in progress, you switch over to the other layout and it plots it there.
		if (!searchLayoutActive) {
			clearMap();
			return;
		}

		clearMap();
		const bounds = new window.google.maps.LatLngBounds();

		points.forEach((park) => {
			const icon = {
				url: treeIcon, // lol I drew this tree in GIMP
				scaledSize: new window.google.maps.Size(50, 50),
				origin: new window.google.maps.Point(0,0),
				anchor: new window.google.maps.Point(0,0)
			};

			const marker = new window.google.maps.Marker({
				position: park.geometry.location,
				map: mapTarget.current,
				icon
			});
			activeMarkers.push(marker);
			bounds.extend(marker.position);
		});

		mapTarget.current.fitBounds(bounds);
	};

	// this I think is fine to show 20, then you store those as you zoom out/increase radius
	// then you don't have to use the pagination from same event/do it in the background/and add to list
	const plotParks = (parks, pagination) => {
		plotPoints(parks);
		if (pagination.hasNextPage) {
			// 2 second delay apparently
			setTimeout(() => {
				pagination.nextPage(); // plots more points on map, not added to marker list though...
			}, 2000);
			// this delay blows, do not call it faster than 2 seconds, if you do you will get denied every subsequent response without doing some changes
		}
	};

	// radius is meters
	const basicParkSearch = (radiusMiles) => {
		const radiusInMeters = (Math.round(10000*(radiusMiles*5280 / 3.281))/10000);

		placesService.nearbySearch(
			{location: mapTarget.current.getCenter(), radius: radiusInMeters, type: ['park']},
			(results, status, pagination) => {
				if (status !== 'OK' || !results.length) {
					alert('No parks found near you, try increasing your radius or try a new address');
				} else {
					if (activeMarkers.length) {
						const curPoints = activeMarkers.map((marker) => {
							return Object.assign({}, {
								"geometry":{
									"location": marker.position
								}
							})
						});

						// this is a super ugly hack, again lack of foresight, I'm mimicking part of the original
						// object structure from results so it has geometry.location
						results.splice.apply(results, [0, 0].concat(curPoints)); // prepends exisitng markers to paginated results
					}
					plotParks(results, pagination);
				}
			});
	};

	const updateLocation = () => {
		placesService = new window.google.maps.places.PlacesService(mapTarget.current);
		const selectedPlace = autoCompleteInput.current.getPlace();
		if ( selectedPlace ) {
			const selectedLat = selectedPlace.geometry.location.lat();
			const selectedLng = selectedPlace.geometry.location.lng();

			mapTarget.current.setCenter({
				"lat": selectedLat,
				"lng": selectedLng
			});

			showAddressSearchOverlay(false);
			basicParkSearch(selectedRadius)
		} else {
			alert( 'Failed to determine location' );
    	}
	}

	const updateSearchRadius = (radius) => {
		selectedRadius = radius;

		// no no
		if (document.querySelector('.App__autocomplete').value) {
			updateLocation();
		}
	};

	const radiusSelectOptions = () =>  {
		return [5, 10, 15, 25, 50, 100].map((distance, index) => {
			return (<option key={index} value={distance}>{distance}</option>)
		});
	}

	const showAddressSearchOverlay = (show) => {
		// this is ugly, bad foresight, direct manipulation no state
		// setAddressInput({ active: false }); // ugly app refresh original
		addressInputGroup.current.style.display = show ? 'flex' : 'none';
		addressInputParent.current.classList = show ? "App__map-group dark-overlay" : "App__map-group";
	};

	const updatePickedMapPoints = (newPoint) => {
		pickedMapPoints.push(newPoint); // could do this if you want to store all, will just plot as picked, could use to clear map
		plotPickedMapPoints();
	};

	const isFloatOrInt = (numVal) => {
		// from SO
		if (numVal % 1 === 0) {
			return numVal;
		}

		if (Number(numVal) === numVal && numVal % 1 !== 0) {
			return numVal;
		}

		return "";
	};


	const plotPickedMapPoints = () => {
		const bounds = new window.google.maps.LatLngBounds();

		pickedMapPoints.forEach((point) => {
			const marker = new window.google.maps.Marker({
				position: {lat: point.lat(), lng: point.lng()},
				map: mapTarget.current
			});
			pickedMapMarkers.push(marker); // could do this if you want to store all, will just plot as picked, could use to clear map
			bounds.extend(marker.position);
		});

		if (pickedMapPoints.length > 1) { // so zoom doesn't change if only 1
			mapTarget.current.fitBounds(bounds);
		}

		// update sidebar, not using state because single global state = bad
		// this is really bad sorry...
		let strConcat = "<br>";
		// alright... I'm going to render HTML from user input potentially bad
		// but the dynamic part I will check if it's a float/integer and if it is will let through
		pickedMapPoints.forEach((point) => {
			strConcat += "lat: " + isFloatOrInt(point.lat()) + "<br>" + "lng: " + isFloatOrInt(point.lng()) + "<br><br>";
		});
		pickedMapPointsDisplay.current.innerHTML = strConcat /// oooh danger zone XSS if using innerHTML
	};

	const clearPickerMapDisplay = () => {
		clearMap();
	};

	return (
		<div className="App">
			<div className="App__row">
				<Sidebar />
				<div className="App__map-wrapper">
					<Navbar />
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
