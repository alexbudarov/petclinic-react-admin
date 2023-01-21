import {Admin, Resource} from "react-admin";
import {useEffect, useState} from "react";
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
import { QueryClient } from 'react-query';

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
        <Admin dataProvider={dataProvider} queryClient={queryClient}>
            <Resource name="OwnerDTO"
                      list={OwnerList}
                      create={OwnerCreate}
                      edit={OwnerEdit}
                      show={OwnerShow}
                      options={{ label: 'Owners' }}/>
            <Resource name="PetTypeDTO"
                      list={PetTypeList}
                      create={PetTypeCreate}
                      edit={PetTypeEdit}
                      show={PetTypeShow}
                      options={{ label: 'Pet types' }}/>
        </Admin>
    )
}

export default App;
