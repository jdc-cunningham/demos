import React from 'react';
import './MapNavbar.scss';

const MapNavbar = (props) => {
    const radiusSelectOptions = () =>  {
		return [5, 10, 15, 25, 50, 100].map((distance, index) => {
			return (<option key={index} value={distance}>{distance}</option>)
		});
    }
    
    const mapNavBtns = (props) => {
        const {
            searchLayout,
            updateSearchRadius,
            mapBtnAddParks,
            mapBtnSearch,
            toggleSearchLayout
        } = props.mapNavbarProps;
		return (
			<>
				<button
					type="button"
					ref={ mapBtnSearch } onClick={ () => toggleSearchLayout(true) }
					className={ !searchLayout.active ? "" : "active" }
				>Search Parks Near Me</button>
				<button
					type="button"
					ref={ mapBtnAddParks } onClick={ () => toggleSearchLayout(false) }
					className={ searchLayout.active ? "" : "active" }
				>Add Parks Manually</button>
				<div className="App__search-radius"> {/* should disable this, until search happened */}
					<h3>Radius in miles</h3>
					<select onChange={ (e) => updateSearchRadius(e.target.value) }>
						{ radiusSelectOptions() }
					</select>
				</div>
			</>
		);
	}

	return (
		<div className="App__MapNavbar">
            { mapNavBtns(props) }
		</div>
	);
}

export default MapNavbar;