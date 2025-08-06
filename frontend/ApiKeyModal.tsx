import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertTriangle, CheckCircle, Trash2, Languages } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string;
}

export function ApiKeyModal({ isOpen, onClose, onSave, currentApiKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const [isIndonesian, setIsIndonesian] = useState(false);

  useEffect(() => {
    setApiKey(currentApiKey);
    setValidationResult(null);
  }, [currentApiKey, isOpen]);

  const validateApiKey = async (key: string) => {
    if (!key || !key.startsWith('sk-')) {
      setValidationResult('invalid');
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${key}`,
        },
      });

      if (response.ok) {
        setValidationResult('valid');
        return true;
      } else {
        setValidationResult('invalid');
        return false;
      }
    } catch (error) {
      setValidationResult('invalid');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) return;

    const isValid = await validateApiKey(trimmedKey);
    if (isValid) {
      onSave(trimmedKey);
    }
  };

  const handleDelete = () => {
    setApiKey("");
    setValidationResult(null);
    onSave("");
  };

  const handleClose = () => {
    onClose();
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setValidationResult(null);
  };

  const isValidFormat = apiKey.trim().startsWith('sk-');

  const translations = {
    en: {
      title: "OpenAI API Key",
      securityNotice: "Security Notice",
      securityText: "Your API key is stored locally in your browser and sent directly to OpenAI. While we don't store it on our servers, be aware that:",
      securityPoints: [
        "Network requests can be monitored by browser dev tools",
        "API calls are visible in network logs",
        "Consider using API keys with usage limits"
      ],
      apiKeyLabel: "API Key",
      formatError: "❌ API key must start with \"sk-\"",
      validKey: "✅ API key is valid and working",
      invalidKey: "❌ Invalid API key or insufficient permissions",
      getApiKeyText: "Get your API key from",
      openaiPlatform: "OpenAI Platform",
      deleteTitle: "Delete API Key",
      deleteText: "This will remove your API key from local storage. You'll need to enter it again to use the app.",
      deleteButton: "Delete API Key",
      cancel: "Cancel",
      save: "Save",
      validating: "Validating...",
      close: "Close"
    },
    id: {
      title: "Kunci API OpenAI",
      securityNotice: "Pemberitahuan Keamanan",
      securityText: "Kunci API Anda disimpan secara lokal di browser dan dikirim langsung ke OpenAI. Meskipun kami tidak menyimpannya di server kami, perlu diketahui bahwa:",
      securityPoints: [
        "Permintaan jaringan dapat dipantau melalui dev tools browser",
        "Panggilan API terlihat di log jaringan",
        "Pertimbangkan menggunakan kunci API dengan batas penggunaan"
      ],
      apiKeyLabel: "Kunci API",
      formatError: "❌ Kunci API harus dimulai dengan \"sk-\"",
      validKey: "✅ Kunci API valid dan berfungsi",
      invalidKey: "❌ Kunci API tidak valid atau izin tidak mencukupi",
      getApiKeyText: "Dapatkan kunci API Anda dari",
      openaiPlatform: "Platform OpenAI",
      deleteTitle: "Hapus Kunci API",
      deleteText: "Ini akan menghapus kunci API Anda dari penyimpanan lokal. Anda perlu memasukkannya lagi untuk menggunakan aplikasi.",
      deleteButton: "Hapus Kunci API",
      cancel: "Batal",
      save: "Simpan",
      validating: "Memvalidasi...",
      close: "Tutup"
    }
  };

  const t = translations[isIndonesian ? 'id' : 'en'];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsIndonesian(!isIndonesian)}
              className="p-2 hover:bg-gray-100"
            >
              <Languages className="h-4 w-4 mr-2" />
              {isIndonesian ? 'EN' : 'ID'}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Security Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">{t.securityNotice}</p>
                <p className="text-yellow-700">
                  {t.securityText}
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
                  {t.securityPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">{t.apiKeyLabel}</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..."
                className={`pr-20 ${
                  validationResult === 'valid' ? 'border-green-500' : 
                  validationResult === 'invalid' ? 'border-red-500' : ''
                }`}
              />
              <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
                {validationResult === 'valid' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {validationResult === 'invalid' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Validation Messages */}
            {!isValidFormat && apiKey.trim() && (
              <p className="text-sm text-red-500">
                {t.formatError}
              </p>
            )}
            {validationResult === 'valid' && (
              <p className="text-sm text-green-600">
                {t.validKey}
              </p>
            )}
            {validationResult === 'invalid' && (
              <p className="text-sm text-red-500">
                {t.invalidKey}
              </p>
            )}
            
            <p className="text-sm text-gray-500">
              {t.getApiKeyText}{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t.openaiPlatform}
              </a>
            </p>
          </div>

          {/* Delete API Key Button */}
          {currentApiKey && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 mb-1">{t.deleteTitle}</p>
                  <p className="text-sm text-red-700 mb-3">
                    {t.deleteText}
                  </p>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.deleteButton}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t.close}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!apiKey.trim() || !isValidFormat || isValidating}
            >
              {isValidating ? t.validating : t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
