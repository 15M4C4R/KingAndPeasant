import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import "../SocialPanel.css";
import { useNavigate } from "react-router-dom";
import { createLobby } from "../../lobbies/components/LobbyService";

interface User {
    idUser: number;
    name: string;
}

export default function FriendsList() {
    const { user, socket } = useAuth();
    const [friends, setFriends] = useState<User[]>([]);
    const [onlineIds, setOnlineIds] = useState<number[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchFriends = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL+"/api/friendship/list", {
                    headers: { "Authorization": `Bearer ${user.authToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data);
                }
            } catch (err) {
                console.error("Error cargando amigos", err);
            }
        };

        fetchFriends();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('getOnlineUsers', (ids: number[]) => {
            setOnlineIds(ids);
        });

        return () => {
            socket.off('connect');
        };
    }, [socket]);

    const handleInvite = async (friendId: number) => {
        try {
            if (user && user.authToken && socket) {
                const lobbyName = `Partida de ${user.name}`;
                const newLobby = await createLobby(lobbyName, "PRIVATE", user.id, user.authToken);
                socket.emit('inviteToLobby', {
                    receiverId: friendId,
                    lobbyId: newLobby.id,
                    senderName: user.name
                });
                navigate(`/lobby/${newLobby.id}`);
            }  
        } catch (err) {
            console.error("Error al invitar al amigo:", err);
        }
    };

    return (
        <div className="social-panel">
            <h3>Mis amigos({friends.length})</h3>
            
            {friends.length === 0 ? (
                <p style={{ color: '#888' }}>Aún no tienes amigos</p>
            ) : (
                <div className="user-list">
                    {friends.map((friend) => {

                        const isOnline = onlineIds.includes(friend.idUser);
                        
                        return (
                            <div key={friend.idUser} className="user-card friend">
                                <div className="user-info">
                                    <span className="user-name">
                                        {isOnline ? '🟢' : '🔴'} {friend.name}
                                    </span>
                                </div>
                            
                                <button 
                                    onClick={() => handleInvite(friend.idUser)} 
                                    className="action-btn btn-blue" 
                                >
                                    Jugar
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}