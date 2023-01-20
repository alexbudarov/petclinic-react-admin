import {Admin, Resource, ListGuesser} from "react-admin";
import {useEffect, useState} from "react";
import buildGraphQLProvider from 'ra-data-graphql';
import {DataProvider} from "ra-core";
import defaultBuildQuery from './buildQuery';
import {httpLink} from "./links/httpLink";

const App = () => {
    const [dataProvider, setDataProvider] = useState<DataProvider>();

    useEffect(() => {
        buildGraphQLProvider({
            clientOptions: {
                link: httpLink
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
            <Resource name="Owner" list={ListGuesser}/>
            <Resource name="PetType" list={ListGuesser}/>
        </Admin>
    )
}

export default App;
