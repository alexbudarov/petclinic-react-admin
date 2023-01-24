import {
    Datagrid,
    DateField,
    DeleteWithConfirmButton,
    EditButton,
    List,
    NumberField,
    ReferenceField,
    TextField
} from "react-admin";

export const PetList = () => {
    return (
        <List>
            <Datagrid bulkActionButtons={false} rowClick="show">
                <TextField source="id" />
                <TextField source="identificationNumber"/>
                <DateField source="birthDate" />
                <NumberField source="weightInGrams" />
                <ReferenceField source="type.id" reference="PetTypeDTO" label="Type"/>
                <ReferenceField source="owner.id" reference="OwnerDTO" label="Owner"/>
                <EditButton />
                <DeleteWithConfirmButton confirmTitle="Confirm delete pet #%{id}"/>
            </Datagrid>
        </List>
    );
};