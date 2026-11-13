import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageProvider';
import './Privacy.css';

const Footer = () => {
    const { t } = useT();

    return (
        <footer className="siteFooter">
            <Link to="/Privacy">{t("privacy.link")}</Link>
        </footer>
    );
};

export default Footer;
