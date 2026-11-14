import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// À chaque changement de page, on revient en haut : sans ça le navigateur garde la position de défilement de la page
// précédente (ex. : bas de "Recipe List" -> on arrivait tout en bas du formulaire d'édition).
// Le retour arrière du navigateur (POP) garde son comportement habituel.
const ScrollToTop = () => {
    const { key } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        if (navigationType !== 'POP') window.scrollTo(0, 0);
    }, [key, navigationType]);

    return null;
};

export default ScrollToTop;
