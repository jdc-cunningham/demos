import React from 'react';
import './MapSidebar.scss';

const MapSidebar = (props) => {
	const { searchLayout, clearPickerMapDisplay, pickedMapPointsDisplay } = props.props;
	return (
		<div className={ searchLayout.active ? "App__MapSidebar hidden" : "App__MapSidebar" }>
			<h4>Click anywhere on the map and they will show up below.</h4>
			<button type="button" onClick={ () => clearPickerMapDisplay() }>Clear Map</button>
			<div className="App__sidebar-map-points" ref={ pickedMapPointsDisplay }></div>
		</div>
	);
}

export default MapSidebar;