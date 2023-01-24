import {AutocompleteInput, Create, DateInput, NumberInput, ReferenceInput, SimpleForm, TextInput} from "react-admin";

export const PetCreate = () => {
    return (
        <Create redirect="list">
            <SimpleForm>
                <TextInput source="identificationNumber" required autoFocus/>
                <DateInput source="birthDate"/>
                <NumberInput source="weightInGrams"/>
                <ReferenceInput source="owner.id"
                                reference="OwnerDTO"
                                sort={{ field: 'firstName', order:'ASC' }}>
                    <AutocompleteInput label="Owner" />
                </ReferenceInput>
                <ReferenceInput source="type.id"
                                reference="PetTypeDTO"
                >
                    <AutocompleteInput label="Type" />
                </ReferenceInput>
            </SimpleForm>
        </Create>
    );
};