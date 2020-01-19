import React from 'react';
import './MapGroup.scss';
import Map from './map/Map.js';
import MapSidebar from './map-sidebar/MapSidebar.js';

const MapGroup = () => {

	return (
		<div className="App__MapGroup">
			<Map />
			<MapSidebar />
		</div>
	);
}

export default MapGroup;