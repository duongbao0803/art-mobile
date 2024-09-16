import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";

import { router } from "expo-router";
import { SplashScreen } from "@/components/custom";

const Index = () => {
  const [isShowSplash, setIsShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setIsShowSplash(false);
      router.replace("/(tabs)/(home)/HomeScreen");
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {isShowSplash && <SplashScreen />}
    </>
  );
};

export default Index;
