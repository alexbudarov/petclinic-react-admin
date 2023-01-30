import React, {useState} from "react";
import { Menu } from 'react-admin';

export const MainMenu = () => {
    return (
        <Menu>
            <Menu.DashboardItem />
            <Menu.ResourceItem name="OwnerDTO" />
            <Menu.ResourceItem name="PetTypeDTO" />
            <Menu.ResourceItem name="PetDTO" />
            <Menu.Item to="/addon" primaryText="Addon"/>
        </Menu>
    );
};