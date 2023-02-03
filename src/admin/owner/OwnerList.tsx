import {Create, List, SimpleForm, TextInput} from "react-admin";


import {ApolloClient, InMemoryCache, ApolloProvider, gql, from} from '@apollo/client';
import {httpLink} from "../links/httpLink";
import {useQuery} from "react-query";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
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

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID'},
    {field: 'firstName', headerName: 'First Name'},
    {field: 'lastName', headerName: 'Last Name'},
];

export const OwnerList = () => {

    const {data} = useQuery(
        ['OwnerDTO', 'getListCustom'],
        () => {
            return client.query({
                query: OWNER_LIST_BY_NAMES_FILTER_OFFSET_PAGE_SORTED
            }).then(result => {
                return {data: result.data.ownerListByNamesFilterOffsetPageSorted.content};
            })
        }
    );

    return (
        <List>
            <div style={{height: 600, width: '100%'}}>
                <DataGrid
                    rows={data?.data ?? []}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection
                />
            </div>
        </List>
    );
};