import React from 'react';
import './App.scss';
import Sidebar from './components/sidebar/Sidebar.js';
import MapSection from './components/map-section/MapSection.js';

const App = () => {
	// these are here because they get cleared incorrectly in map area
	let pickedMapPoints = [];
	let pickedMapMarkers = [];
	let searchLayoutActive = true;
	let activeMarkers = [];

	return (
		<div className="App">
			<div className="App__row">
				<Sidebar />
				<MapSection mapSectionProps={{
					pickedMapPoints,
					pickedMapMarkers,
					searchLayoutActive,
					activeMarkers
				}} />
			</div>
		</div>
	);
}

export default App;