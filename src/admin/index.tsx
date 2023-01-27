import {AdminContext, AdminUI, defaultI18nProvider, Resource} from "react-admin";
import React, {useEffect, useState} from "react";
import buildGraphQLProvider from 'ra-data-graphql';
import {DataProvider} from "ra-core";
import defaultBuildQuery from './dataProvider/buildQuery';
import {httpLink} from "./links/httpLink";
import {operationNames as customOperationNames} from "./dataProvider/graphqlConventions"
import {PetTypeList} from "./pettype/PetTypeList";
import {OwnerList} from "./owner/OwnerList";
import {PetTypeShow} from "./pettype/PetTypeShow";
import {OwnerShow} from "./owner/OwnerShow";
import {PetTypeEdit} from "./pettype/PetTypeEdit";
import {PetTypeCreate} from "./pettype/PetTypeCreate";
import {OwnerEdit} from "./owner/OwnerEdit";
import {OwnerCreate} from "./owner/OwnerCreate";
import {QueryClient} from 'react-query';
import {PetList} from "./pet/PetList";
import {PetShow} from "./pet/PetShow";
import {PetEdit} from "./pet/PetEdit";
import {PetCreate} from "./pet/PetCreate";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "../dev";
import {authProvider} from "../authProvider";

const App = () => {
    const [dataProvider, setDataProvider] = useState<DataProvider>();

    useEffect(() => {
        buildGraphQLProvider({
            clientOptions: {
                link: httpLink
            },
            introspection: {
                operationNames: customOperationNames,
            },
            buildQuery: defaultBuildQuery
        })
            .then(dp => setDataProvider(dp));
    }, [setDataProvider]);

    if (!dataProvider) {
        return <div>Loading</div>;
    }

    // disable annoying refetch
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 10000,
                retry: false,
                refetchOnWindowFocus: false,
            },
        },
    });

    return (
        <AdminContext dataProvider={dataProvider}
                      authProvider={authProvider}
                      queryClient={queryClient}
                      i18nProvider={defaultI18nProvider}>
            <DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}>
                <AdminUI>
                    <Resource name="OwnerDTO"
                              list={OwnerList}
                              create={OwnerCreate}
                              edit={OwnerEdit}
                              show={OwnerShow}
                              options={{label: 'Owner'}}
                              recordRepresentation={(record) => `${record.firstName} ${record.lastName}`}
                    />
                    <Resource name="PetTypeDTO"
                              list={PetTypeList}
                              create={PetTypeCreate}
                              edit={PetTypeEdit}
                              show={PetTypeShow}
                              options={{label: 'Pet type'}}
                              recordRepresentation="name"
                    />
                    <Resource name="PetDTO"
                              list={PetList}
                              create={PetCreate}
                              show={PetShow}
                              edit={PetEdit}
                              options={{label: 'Pet'}}
                              recordRepresentation="identificationNumber"
                    />
                </AdminUI>
            </DevSupport>
        </AdminContext>
    )
}

export default App;
