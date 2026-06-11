import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, onComplete, onChange }) => {
    const inputsRef = useRef([]);

    useEffect(() => {
        // Auto focus first input on mount
        const timeout = setTimeout(() => inputsRef.current[0]?.focus(), 500);
        return () => clearTimeout(timeout);
    }, []);

    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        // Allow only one digit
        if (!/^[0-9]?$/.test(value)) {
            e.target.value = "";
            return;
        }

        // Move to next input if value is entered
        if (value && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }

        notifyChange();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        } else if (e.key === "ArrowLeft" && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        } else if (e.key === "ArrowRight" && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
        if (pastedData) {
            pastedData.split("").forEach((char, i) => {
                if (inputsRef.current[i]) {
                    inputsRef.current[i].value = char;
                }
            });
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputsRef.current[focusIndex]?.focus();
            notifyChange();
        }
    };

    const notifyChange = () => {
        const otpArr = inputsRef.current.map((i) => i?.value || "").filter(Boolean);
        const otp = otpArr.join("");

        if (onChange) onChange(otp);
        if (otpArr.length === length && onComplete) {
            onComplete(otp);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div is-input-num="true" style={{ display: "flex" }}>
                {[...Array(length)].map((_, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center" }}>
                        <input
                            min="0"
                            max="9"
                            maxLength="1"
                            pattern="[0-9]"
                            type="tel"
                            className="otp-input"
                            ref={(el) => (inputsRef.current[index] = el)}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OtpInput;
