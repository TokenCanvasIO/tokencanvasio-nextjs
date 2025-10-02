import React from 'react';
import { useUserStore } from '../store/useUserStore.js';

const XrpFilterSwitch = () => {
    const { isXrpExcluded, toggleXrpExcluded } = useUserStore(state => ({
        isXrpExcluded: state.personalization.isXrpExcluded,
        toggleXrpExcluded: state.toggleXrpExcluded,
    }));

    return (
        <button
            onClick={toggleXrpExcluded}
            className={`filter-btn ${isXrpExcluded ? 'active' : ''}`}
        >
            -XRP
        </button>
    );
};

export default XrpFilterSwitch;