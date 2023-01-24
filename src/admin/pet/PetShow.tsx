import {DateField, FunctionField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField} from "react-admin";
import React from "react";

export const PetShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="identificationNumber"/>
                <DateField source="birthDate" />
                <NumberField source="weightInGrams" />
                <ReferenceField source="type.id" reference="PetTypeDTO" label="Type"/>
                <ReferenceField source="owner.id" reference="OwnerDTO" label="Owner"/>
            </SimpleShowLayout>
        </Show>
    );
};