import React, { useEffect, useRef } from 'react';

const SafeIframe = ({ src, title, children, ...props }) => {
  const iframeRef = useRef(null);
  const prevSrc = useRef(src || "");

  useEffect(() => {
    if (iframeRef.current && src && src !== prevSrc.current) {
      try {
        // Use location.replace for updates to avoid history entries
        iframeRef.current.contentWindow.location.replace(src);
      } catch (err) {
        // Fallback for cross-origin errors
        iframeRef.current.src = src;
      }
      prevSrc.current = src;
    }
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      title={title || "iframe-content"}
      src={src}
      {...props}
    >
      {children}
    </iframe>
  );
};

export default SafeIframe;
