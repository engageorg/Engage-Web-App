import React, { useEffect, useState } from "react";
import { LoadingMessage } from "./LoadingMessage";
import { defaultLang, languages, setLanguage } from "../i18n";
export const InitializeApp = (props) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const updateLang = async () => {
      await setLanguage(currentLang);
    };
    const currentLang =
      languages.find((lang) => lang.code === props.langCode) || defaultLang;
    updateLang();
    setLoading(false);
  }, [props.langCode]);
  return loading ? <LoadingMessage /> : props.children;
};
