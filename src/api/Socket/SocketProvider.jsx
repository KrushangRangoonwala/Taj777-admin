import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext";
import { SOCKETS } from "./socketConfig";

const SocketProvider = ({ children }) => {
    const [ready, setReady] = useState(false);
    const socketsRef = useRef({
        casino: null,
        mining: null,
    });

    useEffect(() => {
        // 🎰 Casino Socket
        socketsRef.current.casino = io(SOCKETS.CASINO, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        // ⛏ Mining Socket
        // socketsRef.current.mining = io(SOCKETS.MINING, {
        //     transports: ["websocket", "polling"],
        //     auth: {
        //         token: "Token1234",
        //         userId: "7",
        //         userType: "",
        //     },
        //     autoConnect: true,
        //     reconnection: true,
        //     reconnectionAttempts: 10,
        //     reconnectionDelay: 1000,
        //     reconnectionDelayMax: 5000,
        //     timeout: 20000,
        // });
        setReady(true);

        Object.entries(socketsRef.current).forEach(([key, socket]) => {
            socket?.on("connect", () => {
                console.log(`✅ ${key} socket connected`, socket.id);
            });

            socket?.on("disconnect", (reason) => {
                console.log(`⚠️ ${key} socket disconnected`, reason);
            });
        });

        return () => {
            Object.values(socketsRef.current).forEach((socket) => {
                socket?.off();
                socket?.disconnect();
            });
        };
    }, []);

    return (
        <SocketContext.Provider value={{ ready, socketsRef }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
