import React, { setState, useRef, useState } from 'react';
import './MapSection.scss';
import MapNavbar from './map-navbar/MapNavbar.js';
import MapGroup from './map-group/MapGroup.js';
import STYLE from './../../MapStyle.json';
// import axios from 'axios';
import treeIcon from './../../tree-icon-100x100.png';

const MapSection = () => {
	const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
	const [searchLayout, setSearchLayout] = useState({ active: true });
	const [addressInput, setAddressInput] = useState({ active: true });
	const [autoComplete, setAutoComplete] = useState({ loaded: false });

	const mapTarget = useRef(null);
	const mapBtnSearch = useRef(null);
	const mapBtnAddParks = useRef(null);
	const autoCompleteInput = useRef(null);
	const pickedMapPointsDisplay = useRef(null);
	const addressInputGroup = useRef(null);
	const addressInputParent = useRef(null);

	let placesService;
	let selectedRadius = 15;
	let pickedMapPoints = [];
	let pickedMapMarkers = [];
	let searchLayoutActive = true;
	let activeMarkers = [];

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

	const clearAndFocusAddressInput = () => {
		const autoCompleteInput = document.querySelector('.App__autocomplete');
		if (autoCompleteInput) {
			autoCompleteInput.value = ""; // reset
			autoCompleteInput.focus();
		}
	};

	const updateSearchRadius = (radius) => {
		selectedRadius = radius;

		// no no
		if (document.querySelector('.App__autocomplete').value) {
			updateLocation();
		}
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
	};

	const toggleSearchLayout = (active) => {
		setSearchLayout({ active: active });
		searchLayoutActive = active;
		showAddressSearchOverlay(active); // this is somewhat lazy, could have put an icon over map
		clearAndFocusAddressInput();
		clearMap();
	};

	const bindAutoCompleteInput = () => {
		autoCompleteInput.current = new window.google.maps.places.Autocomplete(
			autoCompleteInput.current,
			{ types: ['geocode'] }
		);
		autoCompleteInput.current.addListener( 'place_changed', updateLocation );
		clearAndFocusAddressInput();
	};

	const showAddressSearchOverlay = (show) => {
		// this is ugly, bad foresight, direct manipulation no state
		// setAddressInput({ active: false }); // ugly app refresh original
		addressInputGroup.current.style.display = show ? 'flex' : 'none';
		addressInputParent.current.classList = show ? "App__MapGroup dark-overlay" : "App__MapGroup";
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

	const clearPickerMapDisplay = () => {
		clearMap();
	};

	return (
		<div className="App__MapSection">
			<MapNavbar props={{
				searchLayout,
				updateSearchRadius,
				mapBtnAddParks,
				mapBtnSearch,
				toggleSearchLayout
			}}/>
			<MapGroup props={{
				addressInput,
				addressInputGroup,
				mapTarget,
				autoCompleteInput,
				bindAutoCompleteInput,
				STYLE,
				GOOGLE_MAPS_KEY,
				searchLayout,
				pickedMapPoints,
				pickedMapMarkers,
				isFloatOrInt,
				pickedMapPointsDisplay,
				clearPickerMapDisplay,
				addressInputParent
			}}/>
		</div>
	);
}

export default MapSection;