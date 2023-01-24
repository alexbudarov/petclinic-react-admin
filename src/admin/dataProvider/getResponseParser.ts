import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'ra-core';
import { IntrospectionResult, IntrospectedResource } from 'ra-data-graphql';
import { IntrospectionField } from 'graphql';
import { ApolloQueryResult } from '@apollo/client';
import {DELETE_MANY} from "react-admin";

export default (introspectionResults: IntrospectionResult) => (
    raFetchMethod: string,
    resource: IntrospectedResource,
    queryType: IntrospectionField
) => (response: ApolloQueryResult<any>) => {
    const data = response.data;

    if (
        raFetchMethod === GET_LIST ||
        raFetchMethod === GET_MANY ||
        raFetchMethod === GET_MANY_REFERENCE
    ) {
        let items = response.data.items;

        // no paging
        if (items && Array.isArray(items)) {
            return {
                data: items.map(sanitizeResource),
                total: items.length
            };
        }

        // Amplicode convention for paging result
        if (items && items.content && Array.isArray(items.content) && items.totalElements) {
            return {
                data: items.content.map(sanitizeResource),
                total: (items.totalElements as number)
            };
        }

        console.error("Unknown list response structure: " + items)
        return {
            data: [],
            total: 0
        };
    }

    if (
        raFetchMethod === DELETE_MANY
    ) {
        return {
            data: [] // todo we kinda should return list of actually deleted IDs
        };
    }

    return {
        data: (data?.data ? sanitizeResource(data.data) : null)
    };
};

const sanitizeResource = (data: any) => {
    const result = Object.keys(data).reduce((acc, key) => {
        if (key.startsWith('_')) {
            return acc;
        }

        const dataForKey = data[key];

        if (dataForKey === null || dataForKey === undefined) {
            return acc;
        }

        if (Array.isArray(dataForKey)) {
            if (
                typeof dataForKey[0] === 'object' &&
                dataForKey[0] != null &&
                // If there is no id, it's not a reference but an embedded array
                dataForKey[0].id != null
            ) {
                return {
                    ...acc,
                    [key]: dataForKey.map(sanitizeResource),
                    [`${key}Ids`]: dataForKey.map(d => d.id),
                };
            } else {
                return { ...acc, [key]: dataForKey };
            }
        }

        if (
            typeof dataForKey === 'object' &&
            dataForKey != null &&
            // If there is no id, it's not a reference but an embedded object
            dataForKey.id != null
        ) {
            return {
                ...acc,
                ...(dataForKey &&
                    dataForKey.id && {
                        [`${key}.id`]: dataForKey.id,
                    }),
                // We should only sanitize gql types, not objects
                [key]: dataForKey.__typename
                    ? sanitizeResource(dataForKey)
                    : dataForKey,
            };
        }

        return { ...acc, [key]: dataForKey };
    }, {});

    return result;
};
