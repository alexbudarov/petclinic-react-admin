import { Show, SimpleShowLayout, TextField, DateField, RichTextField } from 'react-admin';

export const PetTypeShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id"/>
                <TextField source="name" />
                <TextField source="defenseStatus" />
            </SimpleShowLayout>
        </Show>
    );
};