import React, { useState, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

const AddressAutocomplete = ({ value, onChange }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_PEOPLE_API_KEY,
        libraries,
    });
    const [address, setAddress] = useState(value || '');
    const autocompleteRef = useRef(null);

    const onLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            setAddress(place.formatted_address || '');
            onChange(place.formatted_address || '');
        }
    };

    return isLoaded ? (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => {
                    setAddress(e.target.value);
                    onChange(e.target.value);
                }}
                style={{
                    width: '100%',
                    padding: '20px',
                    zIndex: 1300, // Ensures it's above the modal's z-index
                    position: 'relative'
                }}
            />
        </Autocomplete>
    ) : (
        <p>Loading...</p>
    );
};

export default AddressAutocomplete;