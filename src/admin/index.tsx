import {Admin, Resource, ListGuesser} from "react-admin";
import {useEffect, useState} from "react";
import buildGraphQLProvider from 'ra-data-graphql';
import {DataProvider} from "ra-core";
import defaultBuildQuery from './dataProvider/buildQuery';
import {httpLink} from "./links/httpLink";
import {operationNames as customOperationNames} from "./dataProvider/graphqlConventions"

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

    return (
        <Admin dataProvider={dataProvider}>
            <Resource name="OwnerDTO" list={ListGuesser} options={{ label: 'Owners' }}/>
            <Resource name="PetTypeDTO" list={ListGuesser} options={{ label: 'Pet types' }}/>
        </Admin>
    )
}

export default App;
