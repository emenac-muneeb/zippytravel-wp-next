"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../Helpers/apiHelper";
import { endpoints } from "../Helpers/endpoints";

const GeneralSettingsContext = createContext();

function buildNavigationTree(items) {
  if (!Array.isArray(items)) return [];
  const map = {};
  const roots = [];

  items.forEach((item) => {
    item.subItems = [];
    map[item.id] = item;
  });

  items.forEach((item) => {
    if (item.parent_id !== "0") {
      const parent = map[parseInt(item.parent_id, 10)];
      if (parent) {
        parent.subItems.push(item);
        parent.dropdown = true;
      }
    } else {
      roots.push(item);
    }
  });

  return roots;
}

function mapGlobalVariables(globalVariables) {
  return (globalVariables || []).reduce((acc, curr) => {
    if (curr.is_active) {
      const key = curr.code.replace(/[%\[\]]/g, "");
      acc[key] = curr.code_value;
    }
    return acc;
  }, {});
}

export const GeneralSettingsProvider = ({ children, initialResult = null }) => {
  const [settings, setSettings] = useState(initialResult?.settings ?? null);
  const [globalVariables, setGlobalVariables] = useState(
    initialResult?.global_variables ?? []
  );
  const [navigationBar, setNavigationBar] = useState(
    initialResult?.navigation_bar ?? []
  );
  const [footerSetting, setFooterSetting] = useState(
    initialResult?.footer_setting ?? null
  );
  const [frontIcons, setFrontIcons] = useState(
    initialResult?.front_icons ?? []
  );
  const [topAirlines, setTopAirlines] = useState(
    initialResult?.top_airlines ?? null
  );
  const [mainLogo, setMainLogo] = useState(() => {
    const logoSetting = initialResult?.settings?.find((item) => item.id === 3);
    return logoSetting?.contents?.main_logo ?? null;
  });
  const [loading, setLoading] = useState(!initialResult);

  const navTree = buildNavigationTree(navigationBar);
  const globalVarsMap = mapGlobalVariables(globalVariables);

  useEffect(() => {
    if (initialResult) {
      setLoading(false);
      return;
    }

    api
      .get(endpoints.generalSettings)
      .then((res) => {
        if (res.data.status === 1) {
          const result = res.data.result;
          setSettings(result.settings);
          setGlobalVariables(result.global_variables || []);
          setNavigationBar(result.navigation_bar || []);
          setFooterSetting(result.footer_setting ?? null);
          setFrontIcons(result.front_icons ?? []);
          setTopAirlines(result.top_airlines ?? null);
          const logoSetting = result.settings?.find((item) => item.id === 3);
          if (logoSetting?.contents?.main_logo) {
            setMainLogo(logoSetting.contents.main_logo);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching general settings:", err);
      })
      .finally(() => setLoading(false));
  }, [initialResult]);

  return (
    <GeneralSettingsContext.Provider
      value={{
        settings,
        loading,
        globalVariables,
        globalVarsMap,
        navigationBar,
        navTree,
        footerSetting,
        frontIcons,
        topAirlines,
        mainLogo,
      }}
    >
      {children}
    </GeneralSettingsContext.Provider>
  );
};

export const useGeneralSettings = () => useContext(GeneralSettingsContext);
