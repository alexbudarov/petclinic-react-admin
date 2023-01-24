import {Edit, SelectInput, SimpleForm, TextInput} from "react-admin";

export const OwnerEdit = () => {
    return (
        <Edit mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled/>
                <TextInput source="firstName" required/>
                <TextInput source="lastName" required/>
                <TextInput source="address" required/>
                <TextInput source="city" required/>
                <TextInput source="email" type="email"/>
                <TextInput source="telephone"/>
            </SimpleForm>
        </Edit>
    );
};