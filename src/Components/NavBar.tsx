import { NavLink } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, Clock, Package } from 'react-feather';
import './NavBar.css';

const NavBar = () => {

    return(
        <>
        <div className="globalNavSection">
            <div className="sticky">
                <img src="/meal_prep_logo_v2.svg"/>
                <div className="LinksPart">
                    <NavLink to={"/"} end><Home className="navIcon"/>Home Page</NavLink>
                    <NavLink to={"/RecipeList"}><BookOpen className="navIcon"/>Recipe List</NavLink>
                    <NavLink to={"/NewMeal"}><PlusCircle className="navIcon"/>New Meal</NavLink>
                    <NavLink to={"/MealHistory"}><Clock className="navIcon"/>Meal History</NavLink>
                    <NavLink to={"/CurrentStock"}><Package className="navIcon"/>Current Stock</NavLink>
                </div>
            </div>
        </div>
        </>
    )
}

export default NavBar;