import { useState } from "react";
import { useTranslation } from "react-i18next";
import useTranslationLoader from "../../utils/useTranslationLoader";
import { useNavigate } from "react-router-dom";
import Typography from "@/components/Typography";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { changeLanguage } = useTranslationLoader();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleSelectChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSave = () => {
    changeLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("appLanguage", selectedLanguage);
    navigate("/");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[400px] max-w-[500px] p-6">
        <CardContent className="pt-6">
          <Typography component="h6" className="text-center mb-6 text-[15px] font-semibold">
            {t("selectLanguage")}
          </Typography>

          <div className="flex items-center gap-3">
            <div className="flex-grow">
              <Select value={selectedLanguage} onValueChange={handleSelectChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("menu.language.en")}</SelectItem>
                  <SelectItem value="it">{t("menu.language.it")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              intent="primary"
              variant="filled"
              size="small"
              onClick={handleSave}
              className="min-w-[80px] h-8"
            >
              {t("buttons.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LanguageSelector;