import React from "react";
import {Layout} from "react-admin";
import {MainMenu} from "./menu/MainMenu";

export const AdminLayout = (props) => {
    return (
        <Layout {...props} menu={MainMenu} />
    );
};