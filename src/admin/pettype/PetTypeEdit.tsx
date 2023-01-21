import {Edit, SelectInput, SimpleForm, TextInput} from "react-admin";

export const PetTypeEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled/>
                <TextInput source="name" required={true}/>
                <SelectInput source="defenseStatus" choices={[
                    { id: "NO_DANGER", name: "No danger" },
                    { id: "NEEDS_PROTECTION", name: "Needs protection" },
                    { id: "RED_BOOK", name: "Red book" },
                ]} />
            </SimpleForm>
        </Edit>
    );
};