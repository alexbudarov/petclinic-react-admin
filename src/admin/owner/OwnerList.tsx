import {Datagrid, EditButton, List, TextField, TextInput} from "react-admin";

const postFilters = [
    <TextInput label="First name" source="firstName"/>,
    <TextInput label="Last name" source="lastName"/>,
];

export const OwnerList = () => {
    return (
        <List filters={postFilters}>
            <Datagrid rowClick="show">
                <TextField source="id" sortable={false}/>
                <TextField source="firstName" />
                <TextField source="lastName" />
                <TextField source="address" sortable={false}/>
                <TextField source="city" />
                <TextField source="email" sortable={false}/>
                <TextField source="telephone" sortable={false} />
                <EditButton />
            </Datagrid>
        </List>
    );
};