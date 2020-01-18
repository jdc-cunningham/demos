import React, { useState, useEffect, useRef } from 'react';
import './Navbar.scss';

const Navbar = (props) => {
	const mapNavBtns = (props) => {
        const {
            mapBtnSearch, mapBtnAddParks, toggleSearchLayout, updateSearchRadius
        } = props;
        
        const radiusSelectOptions = () =>  {
            return [5, 10, 15, 25, 50, 100].map((distance, index) => {
                return (<option key={index} value={distance}>{distance}</option>)
            });
        }

		return (
			<>
				<button
					type="button"
					ref={ mapBtnSearch } onClick={ () => toggleSearchLayout(true) }>
                    Search Parks Near Me</button>
				<button
					type="button"
					ref={ mapBtnAddParks } onClick={ () => toggleSearchLayout(false) }>
                        Add Parks Manually</button>
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
        <div className="App__navbar">
            { mapNavBtns(props) }
        </div>
    );
}

export default Navbar;