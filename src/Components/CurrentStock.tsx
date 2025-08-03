import NavBar from './NavBar';
import './CurrentStock.css';

const CurrentStock = () => {

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
    };

    return(
        <>
        <div className="globalMealHistorySection">

            <div className='sectionHeader'><p>Current Stock</p></div>

        </div>
        </>
    )
}

export default CurrentStock;