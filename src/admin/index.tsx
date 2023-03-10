import {AdminContext, AdminUI, Resource, CustomRoutes,} from "react-admin";
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
import { from } from "@apollo/client";
import {localeLink} from "./links/localeLink";
import {i18nProvider} from "../i18nProvider";
import {AdminLayout} from "./AdminLayout";
import { Route } from "react-router-dom";
import {MyAddon} from "../addon/MyAddon";


const App = () => {
    const [dataProvider, setDataProvider] = useState<DataProvider>();

    useEffect(() => {
        buildGraphQLProvider({
            clientOptions: {
                link: from([localeLink, httpLink])
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
                      i18nProvider={i18nProvider}>
            <DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}>
                <AdminUI layout={AdminLayout}>
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
                    <CustomRoutes>
                        <Route path={'/addon'} element={<MyAddon/>} />
                    </CustomRoutes>
                </AdminUI>
            </DevSupport>
        </AdminContext>
    )
}

export default App;
