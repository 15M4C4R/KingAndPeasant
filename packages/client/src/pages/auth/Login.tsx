import { useUser } from "../../hooks/useUser";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import type { User } from  "../../context/AuthContext";
import "../../components/ParchmentMenu.css";

import { ParchmentCard } from "../../components/ParchmentCard";
import { FormInput } from "../../components/FormInput";
import { MenuButton } from "../../components/MenuButton";

const Login = () => {
    const { login } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        fetch(import.meta.env.VITE_API_URL+"/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then(async (res) => {
            if (res.ok) {
                const data = await res.json();

                const user : User = {
                    id: data.userId,
                    name: data.name,
                    email: data.email,
                    authToken: data.authToken
                }

                login(user!);
                navigate("/");
            } else {
                const data = await res.json();
                
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    const detailedErrors = data.errors.map((err: { message: string }) => err.message).join(' | ');
                    setError(detailedErrors);
                } else {
                    setError(data.message || data.error || "Error de inicio de sesion");
                }
            }
        })
        .catch((err) => {
            const errMsg = err instanceof Error ? err.message : err;
            setError("Ha ocurrido un error: " + errMsg + ". Por favor inténtelo de nuevo.");
        });
    };
    
    return (
        <ParchmentCard title="Inicia sesión en el Reino">
                <form className="menu-form" onSubmit = {handleSubmit}>
                    <FormInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FormInput
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <MenuButton type="submit">Login</MenuButton>
                </form>
                {error && <div className="menu-error">{error}</div>}

                <Link to="/register" className="menu-link">
                    ¿Aún no tienes corona? Regístrate aquí.
                </Link>

                <Link to="/" className="menu-link">
                    Regreso al reino
                </Link>
        </ParchmentCard>
    )

}

export default Login;