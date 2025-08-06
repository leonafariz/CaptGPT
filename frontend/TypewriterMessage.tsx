import React, { useState, useEffect } from "react";

interface TypewriterMessageProps {
  content: string;
}

export function TypewriterMessage({ content }: TypewriterMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 1000 / 400); // 400 characters per second = 2.5ms per character

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex]);

  useEffect(() => {
    // Reset when content changes
    setDisplayedContent("");
    setCurrentIndex(0);
  }, [content]);

  return (
    <div className="whitespace-pre-wrap">
      {displayedContent}
    </div>
  );
}
