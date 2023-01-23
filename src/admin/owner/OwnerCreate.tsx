import {Create, SelectInput, SimpleForm, TextInput} from "react-admin";

export const OwnerCreate = () => {
    return (
        <Create redirect="list">
            <SimpleForm>
                <TextInput source="firstName" required/>
                <TextInput source="lastName" required/>
                <TextInput source="address" required/>
                <TextInput source="city" required/>
                <TextInput source="email"/>
                <TextInput source="telephone"/>
            </SimpleForm>
        </Create>
    );
};