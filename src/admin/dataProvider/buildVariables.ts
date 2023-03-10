/* eslint-disable default-case */
import {
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionNamedTypeRef,
    IntrospectionNonNullTypeRef,
    IntrospectionType,
} from 'graphql';
import {CREATE, DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE,} from 'ra-core';
import {IntrospectedResource, IntrospectionResult} from 'ra-data-graphql';

import getFinalType from './getFinalType';
import isList from './isList';
import {IntrospectionInputTypeRef, IntrospectionInputValue} from "graphql/utilities/getIntrospectionQuery";
import {DELETE_MANY} from "react-admin";

export default (introspectionResults: IntrospectionResult) => (
    resource: IntrospectedResource,
    raFetchMethod: string,
    params: any,
    queryType: IntrospectionField
) => {
    const preparedParams = prepareParams(
        params,
        queryType,
        introspectionResults
    );

    switch (raFetchMethod) {
        case GET_LIST: {
            return buildGetListVariables(introspectionResults)(
                resource,
                raFetchMethod,
                preparedParams
            );
        }
        case GET_MANY:
            return {
                ids: preparedParams.ids
            };
        case GET_MANY_REFERENCE: {
            let variables = buildGetListVariables(introspectionResults)(
                resource,
                raFetchMethod,
                preparedParams
            );

            variables.filter = {
                ...variables.filter,
                [preparedParams.target]: preparedParams.id,
            };

            return variables;
        }
        case DELETE_MANY: // deleteManyXxx(ids: [ID]!): Void
            return {
                ids: preparedParams.ids,
            };
        case GET_ONE:
        case DELETE:
            return {
                id: preparedParams.id,
            };
        case CREATE:
        case UPDATE: {
            return buildCreateUpdateVariables(introspectionResults)(
                resource,
                raFetchMethod,
                preparedParams,
                queryType
            );
        }
    }
    return {};
};

const sanitizeValue = (type: IntrospectionType, value: any) => {
    if (type.name === 'Int') {
        return parseInt(value, 10);
    }

    if (type.name === 'Float') {
        return parseFloat(value);
    }

    return value;
};

const castType = (
    value: any,
    type: IntrospectionType | IntrospectionNonNullTypeRef | IntrospectionInputTypeRef
) => {
    const realType = type.kind === 'NON_NULL' ? type.ofType : type;
    switch (
        `${realType.kind}:${(realType as IntrospectionNamedTypeRef).name}`
    ) {
        case 'SCALAR:Int':
            return Number(value);

        case 'SCALAR:String':
            return String(value);

        case 'SCALAR:Boolean':
            return Boolean(value);

        default:
            return value;
    }
};

const prepareParams = (
    params: any,
    queryType: Partial<IntrospectionField>,
    introspectionResults: IntrospectionResult
) => {
    const result = {};

    if (!params) {
        return params;
    }

    Object.keys(params).forEach(key => {
        const param = params[key];
        let arg: IntrospectionInputValue | null  = null;

        if (!param) {
            result[key] = param;
            return;
        }

        if (queryType && Array.isArray(queryType.args)) {
            arg = queryType.args.find(item => item.name === key);
        }

        if (param instanceof File) {
            result[key] = param;
            return;
        }

        if (param instanceof Date) {
            result[key] = param.toISOString();
            return;
        }

        if (
            param instanceof Object &&
            !Array.isArray(param) &&
            arg &&
            arg.type.kind === 'INPUT_OBJECT'
        ) {
            const args = (introspectionResults.types.find(
                item =>
                    item.kind === arg?.type.kind && item.name === arg.type.name
            ) as IntrospectionInputObjectType).inputFields;
            result[key] = prepareParams(param, { args }, introspectionResults);
            return;
        }

        if (
            param instanceof Object &&
            !(param instanceof Date) &&
            !Array.isArray(param)
        ) {
            result[key] = prepareParams(param, queryType, introspectionResults);
            return;
        }

        if (!arg) {
            result[key] = param;
            return;
        }

        result[key] = castType(param, arg.type);
    });

    return result;
};

const buildGetListVariables = (introspectionResults: IntrospectionResult) => (
    resource: IntrospectedResource,
    raFetchMethod: string,
    params: any
) => {
    let variables: Partial<{
        filter: { [key: string]: any };
        page: { number: number, size: number };
        sort: Array<{ direction: string, property: string }>
    }> = { filter: {} };
    if (params.filter) {
        variables.filter = Object.keys(params.filter).reduce((acc, key) => {
            if (key === 'ids') {
                return { ...acc, ids: params.filter[key] };
            }

            if (typeof params.filter[key] === 'object') {
                const type = introspectionResults.types.find(
                    t => t.name === `${resource.type.name}Filter`
                );
                const filterSome = (type as IntrospectionInputObjectType)?.inputFields?.find(
                    t => t.name === `${key}_some`
                );

                if (filterSome) {
                    const filter = Object.keys(params.filter[key]).reduce(
                        (acc, k) => ({
                            ...acc,
                            [`${k}_in`]: params.filter[key][k],
                        }),
                        {}
                    );
                    return { ...acc, [`${key}_some`]: filter };
                }
            }

            const parts = key.split('.');

            if (parts.length > 1) {
                if (parts[1] === 'id') {
                    const type = introspectionResults.types.find(
                        t => t.name === `${resource.type.name}Filter`
                    );
                    const filterSome = (type as IntrospectionInputObjectType)?.inputFields?.find(
                        t => t.name === `${parts[0]}_some`
                    );

                    if (filterSome) {
                        return {
                            ...acc,
                            [`${parts[0]}_some`]: { id: params.filter[key] },
                        };
                    }

                    return { ...acc, [parts[0]]: { id: params.filter[key] } };
                }

                const resourceField = resource.type.fields.find(
                    f => f.name === parts[0]
                );

                // added by AB to fix compilation
                if (!resourceField) {
                    return acc;
                }

                const type = getFinalType(resourceField.type);
                return {
                    ...acc,
                    [key]: sanitizeValue(type, params.filter[key]),
                };
            }

            const resourceField = resource.type.fields.find(
                f => f.name === key
            );

            if (resourceField) {
                const type = getFinalType(resourceField.type);
                const isAList = isList(resourceField.type);

                if (isAList) {
                    return {
                        ...acc,
                        [key]: Array.isArray(params.filter[key])
                            ? params.filter[key].map(value =>
                                  sanitizeValue(type, value)
                              )
                            : sanitizeValue(type, [params.filter[key]]),
                    };
                }

                return {
                    ...acc,
                    [key]: sanitizeValue(type, params.filter[key]),
                };
            }

            return { ...acc, [key]: params.filter[key] };
        }, {});
    }

    // Amplicode pagination protocol
    // page {
    //   number: Int!
    //   size: Int!
    // }
    if (params.pagination) {
        variables.page = {
            number: parseInt(params.pagination.page, 10) - 1,
            size: parseInt(params.pagination.perPage, 10)
        }
    }

    // Amplicode sorting protocol
    // sort: [XxxOrderByInput]
    //
    // input XxxOrderByInput {
    //   direction: Direction
    //   property: XxxOrderByProperty
    // }
    //
    // enum Direction {
    //   ASC
    //   DESC
    // }
    //
    // enum XxxOrderByProperty {
    //   PROPERTY_ONE_IN_CONSTANT_CASE
    //   PROPERTY_TWO
    //   PROPERTY_THREE
    // }
    if (params.sort && params.sort.field !== 'id') {
        const fieldUpperCase = camelCaseToUpperSnakeCase(params.sort.field);
        const sortParam = {
            direction: params.sort.order, // React Admin and Amplicode backend have the same constants
            property: fieldUpperCase
        }
        variables.sort = [sortParam];
    }

    return variables;
};

// from camelCase to UPPER_SNAKE_CASE
function camelCaseToUpperSnakeCase(str: string) {
    return str.split('').map((character) => {
        if (character == character.toUpperCase()) {
            return '_' + character;
        } else {
            return character.toUpperCase();
        }
    })
        .join('');
}

const buildCreateUpdateVariables = (introspectionResults: IntrospectionResult) => (
    resource: IntrospectedResource,
    raFetchMethod,
    { id, data }: any,
    queryType: IntrospectionField
) => {
    // Amplicode create/update input param convention
    const inputArg = queryType.args.find(a => a.name === 'input');
    if (inputArg && inputArg.type.kind === 'INPUT_OBJECT') {
        // need to clean junk fields from the data
        const inputType = introspectionResults.types.find(t => t.name === (inputArg.type as IntrospectionNamedTypeRef).name);
        const inputArgAttrs = (inputType as IntrospectionInputObjectType).inputFields;
        const cleanedData = Object.keys(data).reduce(
            (acc, key: string) => {
                if (inputArgAttrs.find(attr => attr.name === key)) {
                    return {
                        ...acc,
                        [key]: data[key],
                    };
                }
                return acc;
            },
            { id }
        )
        return {
            [inputArg.name]: cleanedData
        };
    }

    return Object.keys(data).reduce(
        (acc, key) => {
            if (Array.isArray(data[key])) {
                const arg = queryType.args.find(a => a.name === `${key}Ids`);

                if (arg) {
                    return {
                        ...acc,
                        [`${key}Ids`]: data[key].map(({ id }) => id),
                    };
                }
            }

            if (typeof data[key] === 'object') {
                const arg = queryType.args.find(a => a.name === `${key}Id`);

                if (arg) {
                    return {
                        ...acc,
                        [`${key}Id`]: data[key].id,
                    };
                }
            }

            return {
                ...acc,
                [key]: data[key],
            };
        },
        { id }
    );
}