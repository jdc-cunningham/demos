import React, { useState, useEffect, useRef } from 'react';
import './Navbar.scss';

const Navbar = () => {
	const mapNavBtns = () => {
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
        <div className="App__navbar">
            { mapNavBtns() }
        </div>
    );
}

export default Navbar;