import {Datagrid, DeleteWithConfirmButton, EditButton, List, TextField} from "react-admin";

export const PetTypeList = () => {
    return (
        <List>
            <Datagrid bulkActionButtons={false} rowClick="show">
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="defenseStatus" />
                <EditButton />
                <DeleteWithConfirmButton confirmTitle="Confirm delete pet type #%{id}"/>
            </Datagrid>
        </List>
    );
};