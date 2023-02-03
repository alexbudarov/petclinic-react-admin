import {Create, Datagrid, List, ListContextProvider, SimpleForm, TextField, TextInput, useList} from "react-admin";


import {ApolloClient, InMemoryCache, ApolloProvider, gql, from} from '@apollo/client';
import {httpLink} from "../links/httpLink";
import {useQuery} from "react-query";
import * as React from "react";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink
});

const OWNER_LIST_BY_NAMES_FILTER_OFFSET_PAGE_SORTED = gql(`
  query Get_Owner_List_With_Filter_Page_Sort($filter: OwnerFilterInput, $page: OffsetPageInput, $sort: [OwnerOrderByInput]) {
  ownerListByNamesFilterOffsetPageSorted(filter: $filter, page: $page, sort: $sort) {
    content {
      id
      firstName
      lastName
      city
      address
      telephone
      email
    }
    totalElements
  }
}
`);

export const OwnerList = () => {

    const res = useQuery(
        ['OwnerDTO', 'getListCustom'],
        () => {
            return client.query({
                query: OWNER_LIST_BY_NAMES_FILTER_OFFSET_PAGE_SORTED
            }).then(result => {
                return {
                    data: result.data.ownerListByNamesFilterOffsetPageSorted.content,
                    isLoading: result.loading
                };
            })
        }
    );

    const data: any[] | undefined  = res.data?.data;
    const listContext = useList({ data, isLoading: res.isLoading });

    return (
        <List>
        <ListContextProvider value={listContext}>
            <Datagrid>
                <TextField source="id" />
                <TextField source="firstName" />
                <TextField source="lastName" />
            </Datagrid>
        </ListContextProvider>
        </List>
    );
};