import { useState } from 'react';
import './HomePage.css';
import NavBar from './NavBar';

export const RecipeInfo = [
    {
        RecipeName : "Gochujang Glazed Beef & Vegetables",
        Ingredient: [
            "For the Base",
            "",
            "2 lbs (908 g) ground beef (90/10)",
            "1 medium (150 g) green pepper",
            "1 small (125 g) yellow onion",
            "8 oz (227 g) cabbage (a whole head or pre-shredded in a bag)",
            "2 medium (150 g) carrots",
            "1 tbsp oil",
            "3 stalks green onion (optional)",
            "",
    
            "For the Sauce",
            "",
            "2 tbsp (30 g) soy sauce (gluten free if needed)",
            "3 tbsp (45 g) gochujang",
            "2 tbsp (42 g) honey",
            "2 tbsp (30 g) water",
            "1 tbsp (15 g) minced garlic",
            "1 tbsp (15 g) minced ginger",
            "",
    
            "For the Rice",
            "3¾ cups (563 g) cooked rice"
        ],
        Macro : "572 Calories | | 52g C | 42g P | 22g F",
        image : "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg"
    },
    {
        RecipeName : "Chicken Fajita Fried Rice",
        Ingredient: [
            "For the Chicken",
            "",
            "2 lbs (908 g) boneless skinless chicken thighs",
            "2 tbsp (30 g) oil",
            "1 tbsp (15 g) lime juice",
            "2 tsp (6 g) garlic powder",
            "1 tsp (1 g) oregano",
            "1 tsp (3 g) coriander",
            "1 tsp (3 g) cumin",
            "1 tsp (3 g) paprika",
            "2 tsp (6 g) chili powder",
            "1 tsp (6 g) salt",
            "1 tsp (2 g) pepper",
            "",

            "For the Vegetables and Rice",
            "",
            "3 cups (450 g) cooked rice",
            "1 medium (200 g) onion",
            "1 medium (150 g) red pepper",
            "1 medium (150 g) green pepper or poblano",
            "1 tbsp (15 g) minced garlic",
            "2 tbsp (30 g) lime juice",
            "Salt and pepper to taste",
            "1 tbsp (15 g) oil",
            "¼ cup cilantro (optional for garnish)",
            "1 lime (optional for garnish)"
        ],
        Macro : "481 Calories | 41g C | 40g P | 18g F",
        image : "../img/Chicken-Fajita-Fried-Rice-807x1024.jpg"
    },
    {
        RecipeName : "Chicken Red Curry",
        Ingredient: [
            "For the Pot",
            "",
            "1kg Chicken",
            "1kg Brocolie",
            "Red Curry Packet",
            "Seasonings",
            "400mL Coco Milk",
            "400g White Onions",
            "50g Echalote",
            "",

            "For the Rice",
            "",
            "2 cups (300 g) uncooked rice",
            "Salt",
            "1 tbsp (15 g) fish Sauce",
        ],
        Macro : "750 Calories | 51g C | 55g P | 27g F",
        image : "../img/thai-red-curry-34c1e6d.jpg"
    },
    {
        RecipeName: "Lemon Garlic Turkey Bowls",
        Ingredient: [
            "For the Potatoes",
            "",
            "3 medium (700 g) russet potatoes",
            "½ tbsp (8 g) oil",
            "Salt and pepper to taste",
            "",
            
            "For the Broccoli",
            "",
            "1 lb (454 g) frozen broccoli or fresh",
            "1 tsp (5 g) oil",
            "Salt and pepper to taste",
            "",
            
            "For the Bowls",
            "",
            "2 lbs (908 g) ground turkey (93/7) or chicken",
            "1 tbsp (15 g) oil",
            "2 cups (300 g) cooked rice (day old or frozen is best)",
            "6 cloves (20 g) garlic",
            "¼ cup (60 g) lemon juice",
            "1 tbsp (5 g) lemon zest",
            "2 tsp (2 g) dried oregano",
            "1 tsp (3 g) dried coriander",
            "2 tsp (6 g) onion powder",
            "10 tbsp (150 g) tzatziki sauce (store-bought)",
            "1 tsp red pepper flakes (optional)"
        ],
        Macro: "613 Calories | 54g C | 43g P | 25g F",
        image: "../img/Lemon-Garlic-Turkey-Bowls-806x1024.jpg"
    },
    {
        RecipeName: "Honey Sriracha Rice Bowls",
        Ingredient: [
            "For the Rice Bowls",
            "",
            "2 lbs (908 g) boneless skinless chicken thighs",
            "4 cups (600 g) cooked rice",
            "12 oz (340 g) broccoli",
            "3 medium (150 g) carrots",
            "1 small (125 g) onion",
            "4 stalks (50 g) green onions",
            "½ tbsp (7.5 g) minced garlic",
            "1 tbsp (15 g) oil",
            "Oil spray",
            "",
            
            "For the Sauce",
            "",
            "3 tbsp (45 g) soy sauce (GF if needed)",
            "1½ tbsp (23 g) lime juice",
            "2½ tbsp (40 g) sriracha",
            "2 tsp (10 g) sesame oil",
            "¼ cup (84 g) honey",
            "½ tbsp (7.5 g) garlic"
        ],
        Macro: "575 Calories | 62g C | 39g P | 19g F",
        image: "../img/Honey-Sriracha-Rice-Bowls-807x1024.jpg"
    },
    {
        RecipeName: "Teriyaki Ground Beef Bowls",
        Ingredient: [
            "For the Bowls",
            "",
            "5 cups (750 g) cooked rice",
            "2 lbs (908 g) ground beef (90/10)",
            "1 medium (250 g) zucchini",
            "½ lb (227 g) carrots",
            "½ lb (227 g) celery",
            "1 small (125 g) onion",
            "1 tbsp (15 g) minced garlic",
            "2 tbsp (30 g) oil",
            "½ cup (120 g) teriyaki sauce (pick a bottled one from the store)"
        ],
        Macro: "652 Calories | 66g C | 44g P | 24g F",
        image: "../img/Teriyaki-Ground-Beef-Bowls-WP-864x1024.jpg"
    },
    {
        RecipeName: "Honey BBQ Chicken with Potato Wedges",
        Ingredient: [
            "For the Broccoli",
            "",
            "1½ lbs (680 g) broccoli",
            "2 tbsp (30 g) oil",
            "Salt and pepper",
            
            "",
            
            "For the Potatoes",
            "",
            "5 small (750 g) russet potatoes",
            "1 tbsp (15 g) oil",
            "2 tsp (6 g) garlic powder",
            "2 tsp (6 g) paprika",
            "1 tsp (8 g) chili powder",
            "Salt and pepper to taste",
            
            "",
            
            "For the Chicken",
            "",
            "2½ lbs (1135 g) boneless skinless chicken thighs",
            "½ cup (120 g) BBQ sauce (vinegar based is preferred)",
            "2 tbsp (42 g) honey",
            "Salt and pepper to taste"
        ],
        Macro: "542 Calories | 38g C | 44g P | 24g F",
        PrepTime: "15 minutes",
        CookTime: "35 minutes",
        image: "../img/Honey-BBQ-Chicken-WP-813x1024.png"
    },
    {
        RecipeName: "Spicy Adobo Chicken and Peppers",
        Ingredient: [
            "For the Chicken and Vegetables",
            "",
            "2 lbs (908 g) boneless skinless chicken thighs",
            "1½ tbsp (23 g) olive oil",
            "1 medium (150 g) red bell pepper",
            "1 medium (150 g) green bell pepper",
            "1 medium (200 g) onion",
            
            "",
            
            "For the Rice",
            "",
            "3½ cups (525 g) cooked rice",
            "1 tbsp (15 g) lime juice",
            
            "",
            
            "For the Sauce",
            "",
            "4 tbsp (60 g) chipotle peppers in adobo sauce",
            "1 tsp (3 g) garlic powder",
            "Salt and pepper to taste"
        ],
        Macro: "506 Calories | 39g C | 47g P | 18g F",
        PrepTime: "10 minutes",
        CookTime: "25 minutes",
        image: "../img/Spicy-Adobo-Chicken-and-Peppers-WP.jpg"
    },
    {
        RecipeName: "Teriyaki Rotisserie Chicken Bowls",
        Ingredient: [
            "For the Chicken",
            "",
            "1.5 lbs (681 g) pulled rotisserie chicken",
            "9 tbsp (135 g) teriyaki sauce",
            "2 tsp (10 g) sesame seeds",
            "2 (10 g) green onions",
            
            "",
            
            "For the Rice",
            "",
            "4 cups (568 g) cooked rice",
            "1 tbsp (15 g) soy sauce",
            "1 tbsp (15 g) rice vinegar",
            "1 tbsp (15 g) crunchy chili garlic oil",
            
            "",
            
            "For the Slaw",
            "",
            "12 oz (340 g) shredded cabbage",
            "1 cup (100 g) matchstick carrots",
            "2 tbsp (30 g) rice vinegar",
            "1 tbsp (15 g) crunchy chili garlic oil",
            "1 tbsp (21 g) honey"
        ],
        Macro: "557 Calories | 63g C | 38g P | 17g F",
        PrepTime: "20 minutes",
        CookTime: "5 minutes",
        image: "../img/Teriyaki-Rotisserie-Chicken-Bowls-WP-807x1024.jpg"
    },
    {
        RecipeName: "Honey Garlic Chicken Noodle Bowls",
        Ingredient: [
            "For the Meat and Vegetables",
            "",
            "2 lbs (908 g) ground chicken (93/7)",
            "8 oz (227 g) sweet potato glass noodles",
            "1 small (125 g) onion",
            "1 medium (150 g) red pepper",
            "8 oz (227 g) mushrooms",
            "8 oz (227 g) shredded cabbage (pre-shredded)",
            "4 cloves (15 g) garlic",
            "5 stalks (25 g) green onions",
            "2 tbsp (30 g) oil",
            "Salt and pepper",
            
            "",
            
            "For the Sauce",
            "",
            "2 tbsp (30 g) soy sauce",
            "¼ cup (84 g) honey",
            "¼ cup (80 g) oyster sauce",
            "2 tsp (10 g) sesame oil",
            "1 tbsp (15 g) sriracha"
        ],
        Macro: "597 Calories | 66g C | 36g P | 21g F",
        PrepTime: "15 minutes",
        CookTime: "30 minutes",
        image: "../img/Honey-Garlic-Chicken-Noodle-Bowls-WP-807x1024.jpg"
    },
    {
        RecipeName: "Korean Beef and Rice Cakes (Tteokbokki)",
        Ingredient: [
            "1 medium (60 g) carrot",
            "5 medium (40 g) green onions",
            "1 tbsp (15 g) garlic",
            "1 cup (200 g) kimchi",
            "1 lb (454 g) rice cakes",
            "1 lb (454 g) 90/10 beef",
            "1 tbsp (15 g) gochujang",
            "2 tbsp (30 g) soy sauce",
            "2 tsp (8 g) sugar",
            "2 tbsp (30 g) rice cake water",
            "Salt to taste"
        ],
        Macro: "531 Calories | 69g C | 31g P | 14.5g F",
        PrepTime: "5 minutes",
        CookTime: "20 minutes",
        image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg"
    }    
]

const HomePage = () => {

    const [weeklyRecipe1, setWeeklyRecipe1] = useState<number>(0);
    const [weeklyRecipe2, setWeeklyRecipe2] = useState<number>(0);

    const ChosenRecipe = () => {
        let finalWeeklyRecipe : number[] = [];
        while (finalWeeklyRecipe.length < 2) {
            let randomNumber = Math.floor(Math.random() * (RecipeInfo.length))
            if (!finalWeeklyRecipe.includes(randomNumber)) {
                finalWeeklyRecipe.push(randomNumber);
            }
        }
        setWeeklyRecipe1(finalWeeklyRecipe[0]);
        setWeeklyRecipe2(finalWeeklyRecipe[1]);
    }

    const ReplaceRecipe1 = () => {
        let randomNumber = Math.floor(Math.random() * (RecipeInfo.length));
        if (weeklyRecipe1 !== randomNumber) {
            setWeeklyRecipe1(randomNumber);
        }
    }

    const ReplaceRecipe2 = () => {
        let randomNumber = Math.floor(Math.random() * (RecipeInfo.length));
        if (weeklyRecipe2 !== randomNumber) {
            setWeeklyRecipe2(randomNumber);
        }
    }

    return(
        <>
        <div className="globalHomeSection">

            <div className='sectionHeader'><p>Home Page</p></div>
            <div className="generateButton" onClick={ChosenRecipe}><p>Generate Weekly Recipe</p></div>

            <div className="RecipeDisplay" style={{}}>
                <div className="recipe">
                    <img src={RecipeInfo[weeklyRecipe1].image}/>
                    <div className="recipeDetails">
                        <h2>{RecipeInfo[weeklyRecipe1].RecipeName}</h2>
                        <ul>
                            {RecipeInfo[weeklyRecipe1].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{RecipeInfo[weeklyRecipe1].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe1}>Replace Recipe</p></div>
                    </div>
                </div>
                <div className="recipe">
                    <div className="recipeDetails">
                        <h2>{RecipeInfo[weeklyRecipe2].RecipeName}</h2>
                        <ul>
                            {RecipeInfo[weeklyRecipe2].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{RecipeInfo[weeklyRecipe2].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe2}>Replace Recipe</p></div>
                    </div>
                    <img src={RecipeInfo[weeklyRecipe2].image}/>
                </div>
            </div>

            <div className="NutritionSection">
                <div className="sectionHeader"><p>Weekly Intakes</p></div>
                <div className="WeeklyInfos">
                    <div className="WeeklyGroceries">
                        <h2>Grocery List :</h2>
                        <p>Element 1 sdfsf</p>
                        <p>Element 1</p>
                    </div>
                    <div className="WeeklyMacro">
                        <h2>Weekly Macro :</h2>
                        <p>Fat : 200g</p>
                        <p>Fat : 200g</p>
                        <p>Fat : 200g</p>
                    </div>
                </div>
            </div>

        </div>
        </>
    )
}

export default HomePage;