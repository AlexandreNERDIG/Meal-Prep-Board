import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Components/HomePage';
import MealHistory from './Components/MealHistory';
import NavBar from './Components/NavBar';
import NewMeal from './Components/NewMeal';
import RecipeList from './Components/RecipeList';
import CurrentStock from './Components/CurrentStock';
import { useEffect } from 'react';
import { RecipeInfo, defaultList } from './Components/typeFile'
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {

    const initLocalStorage = () => {
        if (!localStorage.getItem("globalRecipeList")) {
          localStorage.setItem("globalRecipeList", JSON.stringify(RecipeInfo));
        }

        if (!localStorage.getItem("mealHistoryList")) {
          localStorage.setItem("mealHistoryList", JSON.stringify([]));
        }

        if (!localStorage.getItem("currentStockList")) {
          localStorage.setItem("currentStockList", JSON.stringify(defaultList));
        }
    };

    initLocalStorage();

    return (
        <Router>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <div className='ContentDisplay'>
                <NavBar />
                <Routes>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/RecipeList' element={<RecipeList />} />
                    <Route path='/NewMeal' element={<NewMeal />} />
                    <Route path='/MealHistory' element={<MealHistory />} />
                    <Route path='/CurrentStock' element={<CurrentStock />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;