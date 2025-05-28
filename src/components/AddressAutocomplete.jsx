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
            onChange(place.formatted_address || '', true);
        }
    };

    return isLoaded ? (
        <div
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    required
                    onChange={(e) => {
                        setAddress(e.target.value);
                        onChange(e.target.value, false);
                    }}
                    style={{
                        width: '100%',
                        padding: '20px',
                        zIndex: 1300,
                        position: 'relative'
                    }}
                />
            </Autocomplete>
        </div>
    ) : (
        <p>Loading...</p>
    );
};

export default AddressAutocomplete;