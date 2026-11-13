import { NavLink } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, Clock, Package } from 'react-feather';
import './NavBar.css';
import LanguageSwitch from './LanguageSwitch';
import { useT } from '../i18n/LanguageProvider';

const NavBar = () => {

    const { t } = useT();

    return(
        <>
        <div className="globalNavSection">
            <div className="sticky">
                <img src="/meal_prep_logo_v2.svg"/>
                <div className="LinksPart">
                    <NavLink to={"/"} end><Home className="navIcon"/>{t("page.home")}</NavLink>
                    <NavLink to={"/RecipeList"}><BookOpen className="navIcon"/>{t("page.recipes")}</NavLink>
                    <NavLink to={"/NewMeal"}><PlusCircle className="navIcon"/>{t("page.newMeal")}</NavLink>
                    <NavLink to={"/MealHistory"}><Clock className="navIcon"/>{t("page.history")}</NavLink>
                    <NavLink to={"/CurrentStock"}><Package className="navIcon"/>{t("page.stock")}</NavLink>
                </div>
                <LanguageSwitch />
            </div>
        </div>
        </>
    )
}

export default NavBar;