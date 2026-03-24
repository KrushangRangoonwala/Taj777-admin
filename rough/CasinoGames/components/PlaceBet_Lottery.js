import React, { useState, useEffect } from "react";
import { useGetFileData } from "../../../hooks/useGetFileData";
import { useSocket } from "../../Socket/useSocket";
import useIsMobile from "../../../hooks/useIsMobile";
import Result_Parent from "../results/Result_Parent";


const PlaceBet_Lottery = () => {
    const { CODE, game_type, phpFile, matchName, game_name, iframe_url, result_image } = useGetFileData();
    const isMobile = useIsMobile(767);
    const [lastResults, setLastResults] = useState([]);
    const socket = useSocket("casino");
    const [mid, setMid] = useState();

    const onSpanClick = (e, result) => {
        e.preventDefault();
        setMid(result.mid);
    }


    function LastResults({ lastResults }) {
        return (
            <div
                className="lottery-last-result d-none-desktop w-100 bg-color11"
                style={{ color: 'var(--text-body) !important' }}
            >
                <div className="lottery-last-result-title">
                    <div>Last Results</div>
                </div>

                {lastResults.map((result, index) => {
                    const oneResult = result.win.split(" ").filter(Boolean);
                    return (
                        <div
                            className="lottery-result-group"
                            key={index}
                            onClick={(e) => onSpanClick(e, result)}
                        >
                            {oneResult.map((ball, ballIndex) => (
                                <div className="lottery-result-icon" key={ballIndex}>{ball}</div>
                            ))}
                        </div>
                    )
                })}
            </div>
        )
    }


    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            socket.emit("Room", game_type);
        };
        //
        if (socket.connected) {
            handleConnect();
        }

        function handleLastResult(data) {
            const results = data?.res || data?.data || [];
            setLastResults(results.slice(0, 10));
        }

        socket.on("connect", handleConnect);
        socket.on("gameResult", handleLastResult);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("gameResult", handleLastResult);
        };
    }, [socket, game_type]);

    return (
        <>
            {mid && <Result_Parent name={game_name} mid={mid} type={game_type} />}

            <LastResults lastResults={lastResults} />
        </>
    )
}

export default PlaceBet_Lottery