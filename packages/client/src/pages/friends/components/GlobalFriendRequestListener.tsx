import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { AnnouncementModal } from "../../game/components/AnnouncementModal";

export const changeFriendshipStatus = async (friendshipId: number, action: string, token: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friendship/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friendshipId, action })
    });
    if (!response.ok) throw new Error('Error al actualizar la solicitud');
    return response.json();
};

interface FriendRequestPayload {
    friendship: number;
    senderId: number;
    senderName: string;
}

export default function GlobalFriendRequestListener() {
    const [request, setRequest] = useState<FriendRequestPayload | null>(null);
    const location = useLocation();
    const { user, socket } = useAuth();

    useEffect(() => {
        if (!socket) return;

        const handleFriendRequest = (data: FriendRequestPayload) => {
            if (location.pathname.startsWith('/game')) {
                console.log(`Solicitud de ${data.senderName} silenciada por estar en partida.`);
                return;
            }
            setRequest(data);
        };

        socket.on('friendRequest', handleFriendRequest);

        return () => {
            socket.off('friendRequest', handleFriendRequest);
        };
    }, [socket, location.pathname]);

    const handleAccept = async () => {
        if (!request || !user || !user.authToken) return;
        try {
            await changeFriendshipStatus(request.friendship, 'ACCEPTED', user.authToken);
            setRequest(null);
        } catch (error) {
            console.error("Error al aceptar:", error);
        }
    };

    const handleReject = async () => {
        if (!request || !user || !user.authToken) return;
        try {
            await changeFriendshipStatus(request.friendship, 'DENIED', user.authToken);
            setRequest(null);
        } catch (error) {
            console.error("Error al rechazar:", error);
        }
    };

    return (
        <AnnouncementModal
            isOpen={!!request}
            onClose={handleReject}
            onConfirm={handleAccept}
            title="SOLICITUD DE AMISTAD"
            message={request ? `¡El jugador ${request.senderName} quiere añadirte a su lista de amigos!` : ""}
            confirmText="ACEPTAR"
        />
    );
}