// // useIsMobile.js
// import { useState, useEffect } from "react";

// export default function useIsMobile(breakpoint = 1280) {
//     const [isMobile, setIsMobile] = useState(false);

//     useEffect(() => {
//         const check = () => setIsMobile(window.innerWidth <= breakpoint);
//         check();
//         window.addEventListener("resize", check);
//         return () => window.removeEventListener("resize", check);
//     }, [breakpoint]);

//     return isMobile;
// }

import { useState, useEffect } from "react";

export default function useIsMobile(breakpoint = 1280) {
    const query = `(max-width: ${breakpoint}px)`;

    const [isMobile, setIsMobile] = useState(() =>
        window.matchMedia(query).matches
    );

    useEffect(() => {
        const media = window.matchMedia(query);
        const handler = (e) => setIsMobile(e.matches);

        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, [query]);

    return isMobile;
}
