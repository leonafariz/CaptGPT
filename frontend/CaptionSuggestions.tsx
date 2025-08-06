import React from "react";
import { Button } from "@/components/ui/button";

interface CaptionSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function CaptionSuggestions({ onSuggestionClick }: CaptionSuggestionsProps) {
  const suggestions = [
    {
      label: "Story Telling",
      prompt: "Buatkan caption storytelling untuk postingan saya. Sebelum membuat caption, ajukan 1–3 pertanyaan klarifikasi terlebih dahulu. Tujuannya untuk memahami konteks dan kebutuhan user secara akurat. Setelah kamu mendapatkan jawaban user, barulah kamu memberikan caption terbaik",
      color: "text-purple-600",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      )
    },
    {
      label: "Viral Capt",
      prompt: "Buatkan caption viral untuk postingan saya. Sebelum membuat caption, ajukan 1–3 pertanyaan klarifikasi terlebih dahulu. Tujuannya untuk memahami konteks dan kebutuhan user secara akurat. Setelah kamu mendapatkan jawaban user, barulah kamu memberikan caption terbaik",
      color: "text-pink-600",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
      )
    },
    {
      label: "Edukasi",
      prompt: "Buatkan caption edukasi untuk postingan saya. Sebelum membuat caption, ajukan 1–3 pertanyaan klarifikasi terlebih dahulu. Tujuannya untuk memahami konteks dan kebutuhan user secara akurat. Setelah kamu mendapatkan jawaban user, barulah kamu memberikan caption terbaik",
      color: "text-green-600",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      )
    },
    {
      label: "Quotes",
      prompt: "Buatkan caption quotes untuk postingan saya. Sebelum membuat caption, ajukan 1–3 pertanyaan klarifikasi terlebih dahulu. Tujuannya untuk memahami konteks dan kebutuhan user secara akurat. Setelah kamu mendapatkan jawaban user, barulah kamu memberikan caption terbaik",
      color: "text-yellow-600",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
        </svg>
      )
    },
    {
      label: "Lainnya",
      prompt: "Buatkan caption lainnya untuk postingan saya. Sebelum membuat caption, ajukan 1–3 pertanyaan klarifikasi terlebih dahulu. Tujuannya untuk memahami konteks dan kebutuhan user secara akurat. Setelah kamu mendapatkan jawaban user, barulah kamu memberikan caption terbaik",
      color: "text-indigo-600",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-3 justify-center flex-wrap">
        {suggestions.slice(0, 2).map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className={`px-4 py-2 rounded-2xl border border-gray-400 bg-transparent text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:border-gray-600 flex items-center gap-2 ${suggestion.color}`}
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            {suggestion.icon}
            {suggestion.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {suggestions.slice(2).map((suggestion, index) => (
          <Button
            key={index + 2}
            variant="outline"
            className={`px-4 py-2 rounded-2xl border border-gray-400 bg-transparent text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:border-gray-600 flex items-center gap-2 ${suggestion.color}`}
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            {suggestion.icon}
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
