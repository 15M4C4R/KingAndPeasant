import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth"; 
import { AnnouncementModal } from "../../game/components/AnnouncementModal.tsx"; 
import { joinLobby } from "../../lobbies/components/LobbyService";

export default function GlobalInviteListener() {
    const { user, socket } = useAuth();
    const [invitation, setInvitation] = useState<{lobbyId: number, senderName: string} | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!socket) return;

        const handleInviteReceived = (data: {lobbyId: number, senderName: string}) => {
            if (location.pathname.startsWith('/game')) {
                console.log(`Invitación enviada por ${data.senderName} recibida pero estás en una partida, ignorando.`);
                return;
            }
            setInvitation(data);
        };

        socket.on('gameInviteReceived', handleInviteReceived);

        return () => {
            socket.off('gameInviteReceived', handleInviteReceived);
        };
    }, [socket, location.pathname]);

    const handleAccept = async () => {
        if (!invitation || !user || !user.authToken) return;
        try {
            await joinLobby(invitation.lobbyId, user.id.toString(), user.authToken);
            const targetLobbyId = invitation.lobbyId;
            setInvitation(null);
            navigate(`/lobby/${targetLobbyId}`);
        } catch (err) {
            console.error("Error al unirse al lobby:", err);
            setInvitation(null);
        }
    };

    const handleReject = () => {
        if (invitation) {
            socket?.emit('rejectGameInvite', {
                lobbyId: invitation.lobbyId,
                rejecterName: user?.name
            });
        }
        setInvitation(null);
    };

    return (
        <AnnouncementModal
            isOpen={!!invitation}
            onClose={handleReject}
            onConfirm={handleAccept}
            title="¡Nueva Invitación!"
            message={invitation ? `El jugador ${invitation.senderName} te ha invitado a un partida privada.` : ""}
            confirmText="ACEPTAR"
        />
    );

}