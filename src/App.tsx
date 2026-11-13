import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Components/HomePage';
import MealHistory from './Components/MealHistory';
import NavBar from './Components/NavBar';
import NewMeal from './Components/NewMeal';
import RecipeList from './Components/RecipeList';
import CurrentStock from './Components/CurrentStock';
import { recipeInfo, defaultList } from './Components/typeFile'
import { Toaster } from 'react-hot-toast';
import { syncDefaultStock } from './lib/recipeUtils';
import { LanguageProvider } from './i18n/LanguageProvider';
import Privacy from './Components/Privacy';
import Footer from './Components/Footer';
import './App.css';
import './responsive.css';

function App() {

    const initLocalStorage = () => {
        if (!localStorage.getItem("globalRecipeList")) {
          localStorage.setItem("globalRecipeList", JSON.stringify(recipeInfo));
        }

        if (!localStorage.getItem("mealHistoryList")) {
          localStorage.setItem("mealHistoryList", JSON.stringify([]));
        }

        if (!localStorage.getItem("currentStockList")) {
          localStorage.setItem("currentStockList", JSON.stringify(defaultList));
        }

        syncDefaultStock();
    };

    initLocalStorage();

    return (
        <LanguageProvider>
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
                    <Route path='/Privacy' element={<Privacy />} />
                </Routes>
                <Footer />
            </div>
        </Router>
        </LanguageProvider>
    );
}

export default App;