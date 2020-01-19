import React from 'react';
import './MapSection.scss';
import MapNavbar from './map-navbar/MapNavbar.js';
import MapGroup from './map-group/MapGroup.js';

const MapSection = () => {

	return (
		<div className="App__MapSection">
			<MapNavbar />
			<MapGroup />
		</div>
	);
}

export default MapSection;