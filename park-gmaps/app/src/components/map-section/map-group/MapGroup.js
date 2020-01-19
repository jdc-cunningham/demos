import React from 'react';
import './MapGroup.scss';
import MapOverlay from './map-overlay/MapOverlay.js';
import Map from './map/Map.js';
import MapSidebar from './map-sidebar/MapSidebar.js';

const MapGroup = (props) => {
	// the props.props is weird but it is nesting by key the same value
	const {
		addressInput, addressInputGroup, autoCompleteInput, showAddressSearchOverlay,
		searchLayout, clearPickerMapDisplay, pickedMapPointsDisplay, addressInputParent
	} = props.props;

	return (
		<div ref={ addressInputParent } className={ addressInput.active ? "App__MapGroup dark-overlay" : "App__MapGroup" }>
			<MapOverlay props={{
				addressInput,
				addressInputGroup,
				autoCompleteInput,
				showAddressSearchOverlay
			}} />
			<Map props={props.props} />
			<MapSidebar props={{
				searchLayout,
				clearPickerMapDisplay,
				pickedMapPointsDisplay
			}} />
		</div>
	);
}

export default MapGroup;