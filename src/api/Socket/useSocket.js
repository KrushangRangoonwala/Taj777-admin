import { useContext } from "react";
import SocketContext from "./SocketContext";

export const useSocket = (type) => {
    const { ready, socketsRef } = useContext(SocketContext);
    return ready ? socketsRef.current[type] : null;
};
