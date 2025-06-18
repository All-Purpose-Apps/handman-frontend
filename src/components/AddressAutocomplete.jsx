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
            setAddress(place?.formatted_address || '');

            const components = place?.address_components || [];
            const getComponent = (types) =>
                components.find(c => types.every(t => c.types.includes(t)))?.long_name || '';

            const streetNumber = getComponent(['street_number']);
            const route = getComponent(['route']);
            const city = getComponent(['locality']) || getComponent(['sublocality']);
            const state = getComponent(['administrative_area_level_1']);
            const zip = getComponent(['postal_code']);
            const streetAddress = [streetNumber, route].filter(Boolean).join(' ');

            onChange({
                address: place?.formatted_address || '',
                streetAddress,
                city,
                state,
                zip,
            }, true);
        }
    };

    return isLoaded ? (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
        >
            <div
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <input
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    required
                    onChange={(e) => {
                        setAddress(e.target.value);
                        onChange(e.target.value, false);
                    }}
                    autoComplete="off"
                    style={{
                        width: '100%',
                        padding: '20px',
                        zIndex: 1300,
                        position: 'relative',
                    }}
                    onFocus={(e) => {
                        // Optional: select text on focus
                        e.target.select();
                    }}
                    onClick={(e) => {
                        // Optional: prevent bubbling
                        e.stopPropagation();
                    }}
                />
            </div>
        </Autocomplete>
    ) : (
        <p>Loading...</p>
    );
};

export default AddressAutocomplete;