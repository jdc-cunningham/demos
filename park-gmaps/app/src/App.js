import React from 'react';
import './App.scss';
import Sidebar from './components/sidebar/Sidebar.js';
import MapSection from './components/map-section/MapSection.js';

const App = () => {
	return (
		<div className="App">
			<div className="App__row">
				<Sidebar />
				<MapSection />
			</div>
		</div>
	);
}

export default App;