import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext";

const SocketApp = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    const hasConnected = useRef(false);

    useEffect(() => {
        if (hasConnected.current) return;
        hasConnected.current = true;

        // const socket = io("https://dataservicedetails.com:8443", {
        const socket = io("https://mininginfo.org:2053", {
            transports: ["websocket", "polling"],
            auth: {
                token: "Token1234",
                userId: "7",
                userType: "",
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket Connected:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            setConnected(false);
        });

        return () => {
            console.log("Cleaning sockets...");

            if (socketRef.current) {
                socketRef.current.off();      // remove all listeners
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketApp;
