import React, { useEffect, useState } from 'react';
import './Map.scss';

const Map = (props) => {
	const propContents = props.props; // weird
	const {
		mapTarget,
		autoCompleteInput,
		bindAutoCompleteInput,
		STYLE,
		GOOGLE_MAPS_KEY,
		searchLayout,
		pickedMapPoints,
		pickedMapMarkers,
		isFloatOrInt,
		pickedMapPointsDisplay
	} = propContents;
	const [map, setMap] = useState({ ready: false }); // ehh this sucks
	const [center, setCenter] = useState({
		lat: 39.092965,
		lng: -94.583778 // plexpod crossroads
	});

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

	const updatePickedMapPoints = (newPoint) => {
		pickedMapPoints.push(newPoint); // could do this if you want to store all, will just plot as picked, could use to clear map
		plotPickedMapPoints();
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

	return (
		<div className="App__Map">
			<div id="map"></div>
		</div>
	);
}

export default Map;