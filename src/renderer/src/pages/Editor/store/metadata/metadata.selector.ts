import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";


const metadata = (state: RootState) => state.metadata;

export const metadataSelector = createSelector(
    metadata,
    (state) => state.metadata
    );

export const metadataMandatorySelector = createSelector(
    metadata,
    //@ts-ignore
    (state) =>  state.filter(({optional}) => !optional)
);

export const metadataCheckedSelector = createSelector(
    metadata,
        //@ts-ignore
    (state) => state.filter(({isChecked}) => isChecked)
);


export const metadataCustomSelector = createSelector(
    metadata,
        //@ts-ignore
    (state) => state.filter(({typology}) => typology === 'custom')
);