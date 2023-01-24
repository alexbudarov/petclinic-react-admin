import {IntrospectedResource, IntrospectionResult, QUERY_TYPES} from "ra-data-graphql";
import {TypeKind} from "graphql/type";
import {
    IntrospectionField,
    IntrospectionInputValue,
    IntrospectionNamedTypeRef,
    IntrospectionObjectType,
    IntrospectionUnionType
} from "graphql/utilities";
import * as gqlTypes from 'graphql-ast-types-browser';
import getFinalType from "./getFinalType";
import {DELETE, DELETE_MANY, GET_LIST, GET_MANY, GET_MANY_REFERENCE} from "react-admin";
import {ArgumentNode, TypeNode, VariableDefinitionNode} from "graphql/language";
import isList from "./isList";
import {IntrospectionListTypeRef, IntrospectionScalarType} from "graphql/utilities/getIntrospectionQuery";
import {isShallowRequired} from "./isRequired";


export default (introspectionResults: IntrospectionResult) => (
    resource: IntrospectedResource,
    raFetchMethod: string,
    queryType: IntrospectionField,
    variables: any
) => {
    const { sortField, sortOrder, ...metaVariables } = variables;
    const apolloArgs = buildApolloArgs(queryType, variables);
    const args = buildArgs(queryType, variables);
    const metaArgs = buildArgs(queryType, metaVariables);

    if (
        raFetchMethod === GET_LIST ||
        raFetchMethod === GET_MANY ||
        raFetchMethod === GET_MANY_REFERENCE
    ) {
        const fields = buildFieldsForListQuery(introspectionResults, resource.type.fields, queryType);
        return gqlTypes.document([
            gqlTypes.operationDefinition(
                'query',
                gqlTypes.selectionSet([
                    gqlTypes.field(
                        gqlTypes.name(queryType.name),
                        gqlTypes.name('items'),
                        args,
                        null,
                        gqlTypes.selectionSet(fields)
                    )
                ]),
                gqlTypes.name(queryType.name),
                apolloArgs
            ),
        ]);
    }

    const fields = buildFields(introspectionResults)(resource.type.fields);

    if (raFetchMethod === DELETE || raFetchMethod === DELETE_MANY) {
        return gqlTypes.document([
            gqlTypes.operationDefinition(
                'mutation',
                gqlTypes.selectionSet([
                    gqlTypes.field(
                        gqlTypes.name(queryType.name),
                        null,
                        args,
                    ),
                ]),
                gqlTypes.name(queryType.name),
                apolloArgs
            ),
        ]);
    }

    return gqlTypes.document([
        gqlTypes.operationDefinition(
            QUERY_TYPES.includes(raFetchMethod) ? 'query' : 'mutation',
            gqlTypes.selectionSet([
                gqlTypes.field(
                    gqlTypes.name(queryType.name),
                    gqlTypes.name('data'),
                    args,
                    null,
                    gqlTypes.selectionSet(fields)
                ),
            ]),
            gqlTypes.name(queryType.name),
            apolloArgs
        ),
    ]);
};

export const buildFieldsForListQuery = (
    introspectionResults: IntrospectionResult,
    fields: ReadonlyArray<IntrospectionField>,
    queryType: IntrospectionField
) => {
    const resourceFields = buildFields(introspectionResults)(fields);
    const queryResultType = queryType.type

    if (isList(queryResultType)) { // no paging
        return resourceFields;
    }

    // paging with Amplicode conventions
    // queryName(page: $page) {
    //       content {
    //         ... resource fields
    //       }
    //       totalElements
    //     }
    //   }
    if (queryResultType.kind === 'OBJECT') {
        const type = introspectionResults.types.find(t => t.name === queryResultType.name);
        const typeFields = (type as IntrospectionObjectType).fields;

        const objectFields = buildFields(introspectionResults)(typeFields)
        return objectFields.map(f => {
            if (f.name.value !== 'content') {
                return f;
            }

            // replace the element, add internal selection set
            return gqlTypes.field(
                gqlTypes.name(f.name.value),
                null,
                null,
                null,
                gqlTypes.selectionSet(resourceFields)
            )
        });
    }

    console.error('Unknown query result type: ' + queryResultType)
    return resourceFields;
}

export const buildFields = (
    introspectionResults: IntrospectionResult,
    paths: any[] = []
) => fields =>
    fields.reduce((acc, field) => {
        const type = getFinalType(field.type);

        if (type.name.startsWith('_')) {
            return acc;
        }

        if (type.kind !== TypeKind.OBJECT && type.kind !== TypeKind.INTERFACE) {
            return [...acc, gqlTypes.field(gqlTypes.name(field.name))];
        }

        const linkedResource = introspectionResults.resources.find(
            r => r.type.name === type.name
        );

        if (linkedResource) {
            let idAttribute: string | undefined = 'id'
            let hasIdField = linkedResource.type.fields.find(f => f.name === 'id');

            if (!hasIdField) {
                // support IDs with name other than 'id'
                idAttribute = linkedResource.type.fields.find(f => {
                    return f.type.kind === 'SCALAR' && (f.type as IntrospectionScalarType).name === 'ID'
                })?.name

                if (!idAttribute) {
                    return acc; // skip object attribute if we can't find its ID
                }
            }
            return [
                ...acc,
                gqlTypes.field(
                    gqlTypes.name(field.name),
                    null,
                    null,
                    null,
                    gqlTypes.selectionSet([gqlTypes.field(gqlTypes.name(idAttribute))])
                ),
            ];
        }

        const linkedType = introspectionResults.types.find(
            t => t.name === type.name
        );

        if (linkedType && !paths.includes(linkedType.name)) {
            const possibleTypes =
                (linkedType as IntrospectionUnionType).possibleTypes || [];
            return [
                ...acc,
                gqlTypes.field(
                    gqlTypes.name(field.name),
                    null,
                    null,
                    null,
                    gqlTypes.selectionSet([
                        ...buildFragments(introspectionResults)(possibleTypes),
                        ...buildFields(introspectionResults, [
                            ...paths,
                            linkedType.name,
                        ])((linkedType as IntrospectionObjectType).fields),
                    ])
                ),
            ];
        }

        // NOTE: We might have to handle linked types which are not resources but will have to be careful about
        // ending with endless circular dependencies
        return acc;
    }, []);

export const buildFragments = (introspectionResults: IntrospectionResult) => (
    possibleTypes: readonly IntrospectionNamedTypeRef<IntrospectionObjectType>[]
) =>
    possibleTypes.reduce((acc: IntrospectionNamedTypeRef<IntrospectionObjectType>[], possibleType) => {
        const type = getFinalType(possibleType);

        const linkedType = introspectionResults.types.find(
            t => t.name === type.name
        );

        return [
            ...acc,
            gqlTypes.inlineFragment(
                gqlTypes.selectionSet(
                    buildFields(introspectionResults)(
                        (linkedType as IntrospectionObjectType).fields
                    )
                ),
                gqlTypes.namedType(gqlTypes.name(type.name))
            ),
        ];
    }, []);

export const buildArgs = (
    query: IntrospectionField,
    variables: any
): ArgumentNode[] => {
    if (query.args.length === 0) {
        return [];
    }

    const validVariables = Object.keys(variables).filter(
        k => typeof variables[k] !== 'undefined'
    );
    let args = query.args
        .filter(a => validVariables.includes(a.name))
        .reduce(
            (acc: ArgumentNode[], arg) => [
                ...acc,
                gqlTypes.argument(
                    gqlTypes.name(arg.name),
                    gqlTypes.variable(gqlTypes.name(arg.name))
                ),
            ],
            []
        );

    return args;
};

export const buildApolloArgs = (
    query: IntrospectionField,
    variables: any
): VariableDefinitionNode[] => {
    if (query.args.length === 0) {
        return [];
    }

    const validVariables = Object.keys(variables).filter(
        k => typeof variables[k] !== 'undefined'
    );

    let args = query.args
        .filter(a => validVariables.includes(a.name))
        .reduce((acc: VariableDefinitionNode[], arg) => {
            return [
                ...acc,
                gqlTypes.variableDefinition(
                    gqlTypes.variable(gqlTypes.name(arg.name)),
                    getArgType(arg)
                ) as VariableDefinitionNode,
            ];
        }, []);

    return args;
};

export const getArgType = (arg: IntrospectionInputValue): TypeNode => {
    const type = getFinalType(arg.type);
    
    // fix for delete mutation argument (improper nullable argument type was sent)
    const required = isShallowRequired(arg.type);
    
    const list = isList(arg.type);

    const finalNode = gqlTypes.namedType(gqlTypes.name(type.name)); // T

    if (list) {
        const unwrappedType = (arg.type as IntrospectionListTypeRef).ofType;
        const requiredInternal = isShallowRequired(unwrappedType);

        const internalNode = requiredInternal ? gqlTypes.nonNullType(finalNode) : finalNode; // T! or T
        const listNode = gqlTypes.listType(internalNode); // [T!] or [T]
        return required ? gqlTypes.nonNullType(listNode) : listNode; // [T!]! or [T]! or [T!] or [T]
    }

    if (required) {
        return gqlTypes.nonNullType(finalNode); // T!
    }

    return finalNode; // T
};
