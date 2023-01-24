import {Datagrid, EditButton, List, TextField} from "react-admin";

export const OwnerList = () => {
    return (
        <List>
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