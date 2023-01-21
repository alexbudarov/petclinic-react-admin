import {Datagrid, EditButton, List, TextField} from "react-admin";

export const OwnerList = () => {
    return (
        <List>
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="firstName" />
                <TextField source="lastName" />
                <TextField source="address" />
                <TextField source="city" />
                <TextField source="email" />
                <TextField source="telephone" />
                <EditButton />
            </Datagrid>
        </List>
    );
};