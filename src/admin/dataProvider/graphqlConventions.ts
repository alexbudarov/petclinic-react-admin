import {DELETE_MANY, GET_LIST} from "react-admin";
import {CREATE, DELETE, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE} from "ra-core";

export const operationNames = {
    [GET_LIST]: resource => `${decapitalize(removeDtoSuffix(resource.name))}List`, // FooDTO --> fooList
    [GET_ONE]: resource => `${decapitalize(removeDtoSuffix(resource.name))}`, // FooDTO --> foo
    [GET_MANY]: resource => `${resource.name}`, // todo not implemented
    [GET_MANY_REFERENCE]: resource => `${resource.name}`, // todo not implemented
    [CREATE]: resource => `update${removeDtoSuffix(resource.name)}`, // FooDTO --> updateFoo
    [UPDATE]: resource => `update${removeDtoSuffix(resource.name)}`, // FooDTO --> updateFoo
    [DELETE]: resource => `delete${removeDtoSuffix(resource.name)}`, // FooDTO --> deleteFoo
    [DELETE_MANY]: resource => `deleteMany${removeDtoSuffix(resource.name)}`, // FooDTO --> deleteManyFoo
}

function capitalize(string) {
    if (string.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return string;
}

function decapitalize(string: string) {
    if (string.length > 0) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }
    return string;
}

function removeDtoSuffix(str: string) {
    let suffix1 = 'DTO';
    if (str.endsWith(suffix1)) {
        return str.slice(0, str.length - suffix1.length)
    }
    let suffix2 = 'Dto';
    if (str.endsWith(suffix2)) {
        return str.slice(0, str.length - suffix2.length)
    }
    return str;
}