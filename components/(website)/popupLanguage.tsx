"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage, type Language } from "@/context/language-context";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
];

const PopupLanguage = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const chooseLanguage = (code: Language) => {
    setLanguage(code);
    try {
      localStorage.setItem("language", code);
    } catch {}
    setOpen(false);
  };

  const continueWithCurrent = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden shadow-xl" style={{
        borderRadius: "1.25rem",
        background: "linear-gradient(135deg, #8f3fff 0%, #ff3f8f 50%, #ff3f3f 100%)",
        color: "#fff",
      }}>
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="text-2xl font-bold mb-4">
              अपनी भाषा चुनें / Choose your language
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {LANGUAGE_OPTIONS.map((opt) => {
                const isActive = opt.code === language;
                return (
                  <Button
                    key={opt.code}
                    onClick={() => chooseLanguage(opt.code)}
                    style={{
                      background: isActive ? "#ffe03a" : "rgba(255,255,255,0.08)",
                      color: isActive ? "#1a1a1a" : "#fff",
                      border: isActive ? "2px solid #ffe03a" : "2px solid rgba(255,255,255,0.15)",
                      fontWeight: 600,
                      fontSize: "1rem",
                      boxShadow: isActive ? "0 2px 8px 0 rgba(255,224,58,0.10)" : undefined,
                      transition: "all 0.15s",
                    }}
                    className="py-2"
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={continueWithCurrent}>
              {language === 'hi' ? 'इसी भाषा में जारी रखें' :
               language === 'mr' ? 'याच भाषेत पुढे जा' :
               language === 'ta' ? 'இந்த மொழியிலேயே தொடரவும்' :
               language === 'bn' ? 'এই ভাষাতেই চালিয়ে যান' :
               language === 'te' ? 'ఈ భాషలోనే కొనసాగించండి' :
               'Continue with current language'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupLanguage;