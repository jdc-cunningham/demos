import React from 'react';
import './Sidebar.scss';


const Sidebar = () => {

	return (
        <div className="App__Sidebar">
			<h1>Park Finder Demo</h1>
			<p>After you search a location, to reset, click on "Search Parks Near Me"</p>
			<br/>
			<p>Add parks manually is just a basic coordinate picker</p>
			<br/>
			<p>Note: the delay while the parks load is from the pagination, there is a mandatory 2 second delay between requests. Can do it in the background/show all at once, show loading icon, etc...</p>
		</div>
	);
}

export default Sidebar;