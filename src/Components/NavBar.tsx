import { Link } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, Clock, Package } from 'react-feather';
import './NavBar.css';

const NavBar = () => {

    return(
        <>
        <div className="globalNavSection">
            <div className="sticky">
                <img src="/meal_prep_logo_v2.svg"/>
                <div className="LinksPart">
                    <Link to={"/"}><Home className="navIcon"/>Home Page</Link>
                    <Link to={"/RecipeList"}><BookOpen className="navIcon"/>Recipe List</Link>
                    <Link to={"/NewMeal"}><PlusCircle className="navIcon"/>New Meal</Link>
                    <Link to={"/MealHistory"}><Clock className="navIcon"/>Meal History</Link>
                    <Link to={"/CurrentStock"}><Package className="navIcon"/>Current Stock</Link>
                </div>
            </div>
        </div>
        </>
    )
}

export default NavBar;