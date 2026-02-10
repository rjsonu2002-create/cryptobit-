import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { useLanguage, type LanguageCode } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

const languages: { code: LanguageCode; name: string; native: string; flag: string }[] = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
];

export default function Language() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: t("language.saved"),
      description: languages.find(l => l.code === language)?.name,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Globe className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("language.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("language.subtitle")}</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t("language.select")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    language === lang.code
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  data-testid={`button-lang-${lang.code}`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm text-muted-foreground">{lang.native}</div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button onClick={handleSave} className="w-full sm:w-auto" data-testid="button-save-language">
                {t("language.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
