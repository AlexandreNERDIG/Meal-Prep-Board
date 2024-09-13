import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {

    return(
        <>
        <div className="globalNavSection">
            <div className="sticky">
                <img src="/meal_prep_logo_v2.svg"/>
                <div className="LinksPart">
                    <Link to={"/"}>Home Page</Link>
                    <Link to={"/RecipeList"}>Recipe List</Link>
                    <Link to={"/NewMeal"}>New Meal</Link>
                    <Link to={"/MealHistory"}>Meal History</Link>
                    <Link to={"/CurrentStock"}>Current Stock</Link>
                </div>
            </div>
        </div>
        </>
    )
}

export default NavBar;