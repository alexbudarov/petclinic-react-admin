import {Show, SimpleShowLayout, TextField} from "react-admin";

export const OwnerShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="firstName" />
                <TextField source="lastName" />
                <TextField source="address" />
                <TextField source="city" />
                <TextField source="email" />
                <TextField source="telephone" />
            </SimpleShowLayout>
        </Show>
    );
};