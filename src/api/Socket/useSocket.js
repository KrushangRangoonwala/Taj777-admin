import { useContext } from "react";
import SocketContext from "./SocketContext";

const useSocket = (type) => {
    const { ready, socketsRef } = useContext(SocketContext);
    return ready ? socketsRef.current[type] : null;
};
export default useSocket;