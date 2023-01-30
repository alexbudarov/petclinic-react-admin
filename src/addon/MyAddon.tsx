import {useTranslate} from "react-admin";

export const MyAddon = () => {

    const translate = useTranslate();

    return (
        <h2>{translate('addon.title')}</h2>
    );
};