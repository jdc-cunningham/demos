import React from 'react';
import './MapOverlay.scss';

const MapOverlay = (props) => {
    // double nested again
    const { addressInput, addressInputGroup, autoCompleteInput, showAddressSearchOverlay } = props.props;

	return (
        <div
            className={addressInput.active ? "App__MapOverlay" : "App__MapOverlay hidden"}
            ref={ addressInputGroup }>
                <input type="text" className="App__autocomplete" placeholder="search a location" ref={ autoCompleteInput } />
                <button type="button" className="App__cancel-search" onClick={ () => showAddressSearchOverlay(false) }>Cancel</button>
		</div>
	);
}

export default MapOverlay;