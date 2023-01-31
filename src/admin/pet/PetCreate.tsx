import {
    AutocompleteInput,
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SimpleForm,
    TextInput, useCreate, useNotify,
    useRedirect
} from "react-admin";
import {useCallback, useState} from "react";
import {Alert} from "@mui/material";
import {FieldValues, SubmitHandler} from "react-hook-form";

export const PetCreate = () => {

    const redirect = useRedirect();
    const notify = useNotify();

    const [globalFormError, setGlobalFormError] = useState("");

    const [create] = useCreate();
    const save: SubmitHandler<FieldValues> = useCallback(
      async (data: FieldValues) => {
          setGlobalFormError("");
          try {
              await create('PetDTO',{ data },{ returnPromise: true });
              notify('ra.notification.created', {type: 'info', messageArgs: { smart_count: 1 }});
              redirect('list');
          } catch (response: any) {
              if (response?.body?.graphQLErrors?.length && response?.body?.graphQLErrors?.length > 0) {
                  const errors = (response.body.graphQLErrors as any[]);

                  if (errors[0]?.extensions?.path?.length && errors[0]?.extensions?.path?.length > 0) {
                      const message = errors[0].message;
                      const path = errors[0].extensions.path[0];

                      if (path.length > 0) {
                          return {[path]: message};
                      } else {
                          setGlobalFormError(message);
                          // notify(message, {type: 'error'})
                      }
                  }
              }

          }
      },
      [create, notify, redirect, setGlobalFormError]
    );

    return (
        <Create redirect="list">
            <SimpleForm onSubmit={save}>
                <TextInput source="identificationNumber" required autoFocus/>
                <DateInput source="birthDate"/>
                <NumberInput source="weightInGrams"/>
                <ReferenceInput source="owner.id"
                                reference="OwnerDTO"
                                sort={{ field: 'firstName', order:'ASC' }}>
                    <AutocompleteInput label="Owner" />
                </ReferenceInput>
                <ReferenceInput source="type.id"
                                reference="PetTypeDTO"
                >
                    <AutocompleteInput label="Type" />
                </ReferenceInput>
                {globalFormError?.length > 0 && <Alert severity="error">{globalFormError}</Alert>}
            </SimpleForm>
        </Create>
    );
};