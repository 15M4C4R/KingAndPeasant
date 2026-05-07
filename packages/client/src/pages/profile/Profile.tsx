import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import "./Profile.css";
import "../../components/ParchmentMenu.css";

const Profile = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [games, setGames] = useState(0);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [createdAt, setCreatedAt] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const { user, isLogin } = useUser();

    useEffect (() => {
        
        if(!isLogin || !user) return;
        const localData = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_URL+"/api/auth/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${user.authToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setName(data.name);
                    setEmail(data.email);
                    setGames(data.games);
                    setWins(data.wins);
                    setLosses(data.losses);
                    setCreatedAt(data.createdAt);
                } else {
                    const data = await response.json();
                    setError(data.message || "Falló la obtención de datos de usuario.");
                }
            } catch (err) {
                setError("Ha ocurrido un error: " + err + ". Por favor inténtalo de nuevo.")
            }
        }
        localData();
    }, [user, isLogin]);

    if (error) {
        return (
            <div className="menu-container">
                <div className="menu-card">
                    <div className="menu-error">{error}</div>
                    <Link to="/" className="menu-link">Regreso al Reino</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="menu-container">
            <div className="menu-card">
                <h2 className="menu-title">Perfil del Señor {name}</h2>

                <div className="profile-info">
                    <p className="profile-text">
                        <strong>Email:</strong> {email}
                    </p>
                    <p className="profile-date">
                        <strong>Se unió el:</strong> {createdAt ? new Date(createdAt).toLocaleDateString() : 'Desconocido'}
                    </p>
                </div>

                <hr className="profile-divider" />

                <h3 className="stats-title">Estadísticas de guerra</h3>
                
                <div className="stats-grid">

                    <div className="stat-box">
                        <span className="stat-icon">⚔️</span>
                        <strong className="stat-number">{games}</strong>
                        <div className="stat-label">Partidas</div>
                    </div>

                    <div className="stat-box">
                        <span className="stat-icon">🏆</span>
                        <strong className="stat-number win">{wins}</strong>
                        <div className="stat-label">Victorias</div>
                    </div>

                    <div className="stat-box">
                        <span className="stat-icon">☠️</span>
                        <strong className="stat-number loss">{losses}</strong>
                        <div className="stat-label">Derrotas</div>
                    </div>
                </div>

                <Link to="/editProfile" state={{name, email}} className="menu-button btn-block">
                    Editar mi perfil.
                </Link>

                <Link to="/" className="menu-link link-block">
                    Regresa al Reino.
                </Link>

            </div>
        </div>
    );
} 

export default Profile;