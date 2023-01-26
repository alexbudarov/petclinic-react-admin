import React from 'react';
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox';
import {PaletteTree} from './palette';
import {OwnerCreate} from "../admin/owner/OwnerCreate";
import {OwnerList} from "../admin/owner/OwnerList";
import {ResourceContextProvider} from "react-admin";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/OwnerCreate">
                <ResourceContextProvider value="OwnerDTO">
                    <OwnerCreate/>
                </ResourceContextProvider>
            </ComponentPreview>
            <ComponentPreview path="/OwnerList">
                <ResourceContextProvider value="OwnerDTO">
                    <OwnerList/>
                </ResourceContextProvider>
            </ComponentPreview>
            <ComponentPreview path="/OwnerList">
                <OwnerList/>
            </ComponentPreview>
            <ComponentPreview path="/OwnerCreate">
                <OwnerCreate/>
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;