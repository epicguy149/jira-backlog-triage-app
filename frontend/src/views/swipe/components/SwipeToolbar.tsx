// Swipe mode search + filter, modelled after ADS icon explorer page

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../../app/AppContext';
import debounce from 'lodash/debounce';
import { Box, Inline, xcss } from '@atlaskit/primitives';
import Textfield from '@atlaskit/textfield';
import SearchIcon from '@atlaskit/icon/core/search';
import FilterIcon from '@atlaskit/icon/core/filter';
import Button from '@atlaskit/button/new';
import DropdownMenu, {
	DropdownItemCheckbox,
	DropdownItemCheckboxGroup,
} from '@atlaskit/dropdown-menu';
import Badge from '@atlaskit/badge';
import { cssMap } from '@atlaskit/css';

const SearchIconBefore = () => (
	<Box paddingInlineStart="space.100">
		<SearchIcon label="Search" color="currentColor" />
	</Box>
);

const filterItemStyles = xcss({
	flex: '0 0 auto',
});

const styles = cssMap({
    searchContainer: {
        flexGrow: 1 
    }
})

export function SwipeToolbar() {
    const { 
        searchQuery,
        setSearchQuery,
        swipeFilters,
        setSwipeFilters
    } = useAppContext();
    // holds realtime search input
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // called 300ms after typing stops
    const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 300), [setSearchQuery]);

    // clears pending debounced calls on unmount
    useEffect(
        () => () => {
            debouncedSetSearchQuery.cancel();
        },
        [debouncedSetSearchQuery,]
    );

    // synchronize localQuery if searchQuery changes from global changes (filter/clearfilter)
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setLocalQuery(value);
        debouncedSetSearchQuery(value);
    };

    const activeFilterCount = Object.values(swipeFilters.status).filter(Boolean).length;

    // handle toggling of swipe/unswipe
    const handleFilterChange = (type: 'unswiped' | 'swiped') => {

        // receives prev state
        setSwipeFilters((prevFilters) => ({
            // copies from prev
            ...prevFilters,

            status: {
                ...prevFilters.status,

                // flip swipe/unswipe
                [type]: !prevFilters.status[type],
            },
        }));
    };

    return (
        <Inline space="space.200" alignBlock="center">
            <Box xcss={styles.searchContainer}>
                <Textfield 
                    placeholder="Search backlog"
                    elemBeforeInput={<SearchIconBefore />}
                    value={localQuery}
                    onChange={handleChange}
                    isDisabled
                />
            </Box>

            <Box xcss={filterItemStyles}>
                <DropdownMenu<HTMLButtonElement>
                    trigger={({triggerRef, ...props }) =>(
                        <Button {...props} ref={triggerRef} iconAfter={FilterIcon}>
                            Filters{' '}
                            <Badge appearance={props.isSelected ? 'primary' : 'default'}>
                                {activeFilterCount}
                            </Badge>
                        </Button>
                    )}
                >
                    {/* Swiped status */}
                    <DropdownItemCheckboxGroup id="swiped-status" title="Swiped">
                        {/* unswiped */}
                        <DropdownItemCheckbox
                            id="unswiped"
                            isSelected={swipeFilters.status.unswiped}
                            onClick={() => handleFilterChange('unswiped')}
                        >
                            Unswiped
                        </DropdownItemCheckbox>
                        {/* swiped */}
                        <DropdownItemCheckbox
                            id="swiped"
                            isSelected={swipeFilters.status.swiped}
                            onClick={() => handleFilterChange('swiped')}
                        >
                            Swiped
                        </DropdownItemCheckbox>
                    </DropdownItemCheckboxGroup>
                </DropdownMenu>
            </Box>
        </Inline>
    )
}