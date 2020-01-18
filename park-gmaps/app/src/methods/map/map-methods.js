import { useRef } from 'react';
import treeIcon from './../../tree-icon-100x100.png';

// I think at some point these get emptied due to app re-render again bad structure/poor foresight
let pickedMapPoints = [];
let pickedMapMarkers = [];
export let searchLayoutActive = true; // this is bad,
// but the setState isn't working or not bound to event anyway for canceling plotting of tree icons when switching to manual picker while async pagination in progress

let activeMarkers = [];
let placesService;
export let selectedRadius = 15;

export const isFloatOrInt = (numVal) => {
    // from SO
    if (numVal % 1 === 0) {
        return numVal;
    }

    if (Number(numVal) === numVal && numVal % 1 !== 0) {
        return numVal;
    }

    return "";
};

export const showAddressSearchOverlay = (addressInputGroup, addressInputParent, show) => {
    // this is ugly, bad foresight, direct manipulation no state
    // setAddressInput({ active: false }); // ugly app refresh original
    addressInputGroup.current.style.display = show ? 'flex' : 'none';
    addressInputParent.current.classList = show ? "App__map-group dark-overlay" : "App__map-group";
};

export const bindAutoCompleteInput = (autoCompleteInput) => {
    autoCompleteInput.current = new window.google.maps.places.Autocomplete(
        autoCompleteInput.current,
        { types: ['geocode'] }
    );
    autoCompleteInput.current.addListener( 'place_changed', updateLocation );
    clearAndFocusAddressInput();
};

export const clearMap = (activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay) => {
    // technically should not do it for both
    // autocomplete
    if (activeMarkers.length) {
        activeMarkers.forEach((marker) => {
            marker.setMap(null);
        });
        activeMarkers = [];
    }

    // manual
    if (pickedMapMarkers.length) {
        pickedMapMarkers.forEach((marker) => {
            marker.setMap(null);
        });
        pickedMapMarkers = [];
        pickedMapPoints = [];
        pickedMapPointsDisplay.current.innerHTML = "";
    }
};

// skipping stuff or now like marker styling/click event/etc...
// can add info of the park from results, show on click of icon in window
export const plotPoints = (
        activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, points,
        searchLayoutActive, treeIcon, mapTarget
    ) => {
    // this is an ugly async thing... a pagination can still be in progress, you switch over to the other layout and it plots it there.
    if (!searchLayoutActive) {
        clearMap(activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay);
        return;
    }

    clearMap(activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay);
    const bounds = new window.google.maps.LatLngBounds();

    points.forEach((park) => {
        const icon = {
            url: treeIcon, // lol I drew this tree in GIMP
            scaledSize: new window.google.maps.Size(50, 50),
            origin: new window.google.maps.Point(0,0),
            anchor: new window.google.maps.Point(0,0)
        };

        const marker = new window.google.maps.Marker({
            position: park.geometry.location,
            map: mapTarget.current,
            icon
        });
        activeMarkers.push(marker);
        bounds.extend(marker.position);
    });

    mapTarget.current.fitBounds(bounds);
};

// this I think is fine to show 20, then you store those as you zoom out/increase radius
// then you don't have to use the pagination from same event/do it in the background/and add to list
export const plotParks = (
        activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, parks,
        searchLayoutActive, treeIcon, mapTarget, pagination
    ) => {
    plotPoints(activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, parks,
        searchLayoutActive, treeIcon, mapTarget);
    if (pagination.hasNextPage) {
        // 2 second delay apparently

        // this is functional, but I'm turning it off to reduce API calls
        // if this is on though it automatically keeps loading results until they're all returned
        // setTimeout(() => {
        // 	pagination.nextPage(); // plots more points on map, not added to marker list though...
        // }, 2000);
        
        // this delay blows, do not call it faster than 2 seconds, if you do you will get denied every subsequent response without doing some changes
    }
};

// radius is meters
export const basicParkSearch = (
        radiusMiles, activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, points,
        searchLayoutActive, treeIcon, mapTarget
    ) => {
    const radiusInMeters = (Math.round(10000*(radiusMiles*5280 / 3.281))/10000);

    placesService.nearbySearch(
        {location: mapTarget.current.getCenter(), radius: radiusInMeters, type: ['park']},
        (results, status, pagination) => {
            if (status !== 'OK' || !results.length) {
                alert('No parks found near you, try increasing your radius or try a new address');
            } else {
                if (activeMarkers.length) {
                    const curPoints = activeMarkers.map((marker) => {
                        return Object.assign({}, {
                            "geometry":{
                                "location": marker.position
                            }
                        })
                    });

                    // this is a super ugly hack, again lack of foresight, I'm mimicking part of the original
                    // object structure from results so it has geometry.location
                    results.splice.apply(results, [0, 0].concat(curPoints)); // prepends exisitng markers to paginated results
                }
                plotParks(
                    activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, results,
                    searchLayoutActive, treeIcon, mapTarget, pagination
                );
            }
        });
};

export const updateLocation = (addressInputGroup, radiusMiles, activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, points,
    searchLayoutActive, treeIcon, mapTarget) => {
    placesService = new window.google.maps.places.PlacesService(mapTarget.current);
    const selectedPlace = autoCompleteInput.current.getPlace();
    if ( selectedPlace ) {
        const selectedLat = selectedPlace.geometry.location.lat();
        const selectedLng = selectedPlace.geometry.location.lng();

        mapTarget.current.setCenter({
            "lat": selectedLat,
            "lng": selectedLng
        });

        showAddressSearchOverlay(addressInputGroup, addressInputParent, false);
        basicParkSearch(selectedRadius, radiusMiles, activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay, points,
            searchLayoutActive, treeIcon, mapTarget);
    } else {
        alert( 'Failed to determine location' );
    }
}

export const clearAndFocusAddressInput = () => {
    const autoCompleteInput = document.querySelector('.App__autocomplete');
    if (autoCompleteInput) {
        autoCompleteInput.value = ""; // reset
        autoCompleteInput.focus();
    }
};

export const plotPickedMapPoints = () => {
    const bounds = new window.google.maps.LatLngBounds();

    pickedMapPoints.forEach((point) => {
        const marker = new window.google.maps.Marker({
            position: {lat: point.lat(), lng: point.lng()},
            map: mapTarget.current
        });
        pickedMapMarkers.push(marker); // could do this if you want to store all, will just plot as picked, could use to clear map
        bounds.extend(marker.position);
    });

    if (pickedMapPoints.length > 1) { // so zoom doesn't change if only 1
        mapTarget.current.fitBounds(bounds);
    }

    // update sidebar, not using state because single global state = bad
    // this is really bad sorry...
    let strConcat = "<br>";
    // alright... I'm going to render HTML from user input potentially bad
    // but the dynamic part I will check if it's a float/integer and if it is will let through
    pickedMapPoints.forEach((point) => {
        strConcat += "lat: " + isFloatOrInt(point.lat()) + "<br>" + "lng: " + isFloatOrInt(point.lng()) + "<br><br>";
    });
    pickedMapPointsDisplay.current.innerHTML = strConcat /// oooh danger zone XSS if using innerHTML
};

export const clearPickerMapDisplay = () => {
    clearMap(activeMarkers, pickedMapMarkers, pickedMapPoints, pickedMapPointsDisplay);
};

export const updatePickedMapPoints = (newPoint) => {
    pickedMapPoints.push(newPoint); // could do this if you want to store all, will just plot as picked, could use to clear map
    plotPickedMapPoints();
};