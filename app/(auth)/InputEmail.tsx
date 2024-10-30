import { checkUser, loginGoogle } from "@/api/authApi";
import {
  ButtonComponent,
  InputComponent,
  LoadingScreen,
  SectionComponent,
  SpaceComponent,
} from "@/components/custom";
import { appInfo } from "@/constants/appInfoStyles";
import { globalStyles } from "@/constants/globalStyles";
import useAuthen from "@/hooks/useAuthen";
import { GoogleSignInResponse } from "@/types/auth.types";
import { CustomError } from "@/types/error.types";
import { validateEmail } from "@/utils/validates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { Sms } from "iconsax-react-native";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

const InputEmail: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  // const [, setUserInfo] = useState<GoogleSignInResponse | null>(null);

  GoogleSignin.configure({
    webClientId:
      "47109893633-6fdvrq36r3om3b3f9qmt0vni2ogag6fb.apps.googleusercontent.com",
  });

  const handleLoginWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: User = await GoogleSignin.signIn();
      const googleSignInResponse: GoogleSignInResponse = {
        idToken: userInfo.idToken ?? undefined,
        user: {
          id: userInfo.user.id,
          name: userInfo.user.name ?? "",
          email: userInfo.user.email,
          photo: userInfo.user.photo ?? "",
          familyName: userInfo.user.familyName ?? "",
          givenName: userInfo.user.givenName ?? "",
        },
        scopes: userInfo.scopes,
        serverAuthCode: userInfo.serverAuthCode ?? undefined,
      };
      // setUserInfo(googleSignInResponse);
      if (userInfo && userInfo.idToken) {
        await sendUserInfoToServer(userInfo.idToken);
      }
    } catch (err) {}
  };

  const handleEmail = async () => {
    if (!email) {
      ToastAndroid.show("Vui lòng nhập email", ToastAndroid.CENTER);
      return;
    }
    if (!validateEmail(email)) {
      ToastAndroid.show("Email không hợp lệ", ToastAndroid.CENTER);
      return;
    }
    try {
      const res = await checkUser(email);
      ToastAndroid.show("Vui lòng nhập mật khẩu", ToastAndroid.CENTER);

      if (res && res.status === 200) {
        router.push({
          pathname: "InputPassword",
          params: { email },
        });
      }
    } catch (error) {
      router.push({
        pathname: "InputName",
        params: { email },
      });
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem("fcmToken", token);
      }
      return token;
    } catch (error) {
      return null;
    }
  };

  const sendUserInfoToServer = async (idToken: string) => {
    const authStore = useAuthen.getState();
    authStore.setIsLoading(true);
    try {
      const res = await loginGoogle(idToken);
      if (res && res.status === 200) {
        await Promise.all([
          AsyncStorage.setItem("accessToken", res.data["access-token"]),
          AsyncStorage.setItem("refreshToken", res.data["refresh-token"]),
        ]);
        const jwtToken = await AsyncStorage.getItem("accessToken");
        if (jwtToken) {
          const decoded: any = jwtDecode(jwtToken);
          const role =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          if (role != "USER") {
            ToastAndroid.show(
              "Bạn không có quyền truy cập vào ứng dụng này",
              ToastAndroid.CENTER,
            );
            authStore.setIsLoading(false);
            authStore.logoutGoogle();
            return;
          } else {
            const authStore = useAuthen.getState();
            authStore.setRole(role);
            authStore.login("google");
          }
        }
      } else {
        authStore.logoutGoogle();
      }
    } catch (error) {
      const err = error as CustomError;
      if (err.response && err.response.data && err.response.data) {
        ToastAndroid.show(`${err.response.data.message}`, ToastAndroid.CENTER);
      }
      authStore.setIsLoading(false);
      authStore.logoutGoogle();
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Animatable.View animation="fadeInRight">
          <SectionComponent styles={styles.container_logo}>
            <Image
              source={require("@/assets/images/logo/logo_app.png")}
              style={styles.logo}
            />
          </SectionComponent>
          <SectionComponent styles={styles.container_form}>
            <SectionComponent>
              <Text style={styles.text}>CHÀO MỪNG ĐÃ TRỞ LẠI</Text>
            </SectionComponent>
            <SpaceComponent height={45} />
            <SectionComponent>
              <Text style={styles.email}>
                <Text style={{ color: "red" }}>*</Text> Email của bạn
              </Text>
              <SpaceComponent height={10} />
              <InputComponent
                text="Usename"
                placeholder="Email"
                onChange={(val) => setEmail(val)}
                affix={<Sms size={22} color="gray" />}
              />
            </SectionComponent>
            <TouchableOpacity onPress={handleEmail} style={styles.button_login}>
              <Text style={styles.button_text_login}>Tiếp tục</Text>
            </TouchableOpacity>
            <SectionComponent styles={styles.section_or}>
              <Text style={globalStyles.text}>hoặc</Text>
            </SectionComponent>
            <SectionComponent>
              <ButtonComponent
                text="Tiếp tục với Google"
                source={require("@/assets/images/logo/logo_google.png")}
                imageStyle={styles.image_google}
                buttonStyle={styles.button_google}
                textStyle={styles.button_text_google}
                onPress={handleLoginWithGoogle}
              />
            </SectionComponent>
          </SectionComponent>
        </Animatable.View>
      </View>
      <LoadingScreen />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: appInfo.sizes.HEIGHT * 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  container_form: {
    backgroundColor: "white",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 0,
    paddingLeft: 30,
    paddingRight: 30,
  },
  text: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  email: {
    color: "black",
    fontSize: 15,
  },
  container_logo: {
    alignItems: "center",
  },
  logo: {
    width: appInfo.sizes.WIDTH * 0.6,
    height: appInfo.sizes.HEIGHT * 0.1,
    resizeMode: "contain",
  },
  background_color: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row-reverse",
  },
  button_login: {
    backgroundColor: "#1CBCD4",
    padding: 10,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dfe2e6",
  },
  button_text_login: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    padding: 5,
  },
  section_or: {
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
  },
  image_google: {
    width: 20,
    height: 20,
  },
  button_google: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#101010",
  },
  button_text_google: {
    color: "#000000",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
    padding: 5,
  },
  section_signup: {
    flexDirection: "row",
    justifyContent: "center",
  },
  section_signup_text: {
    color: "#3094ff",
  },
  section_welcome: {
    marginBottom: 5,
  },
});

export default InputEmail;
