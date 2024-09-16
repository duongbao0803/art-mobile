import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ButtonProps {
  text?: string;
  source?: ImageSourcePropType;
  buttonStyle?: string;
  textStyle?: string;
  imageStyle?: string;
  onPress?: () => void;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { text, source, buttonStyle, textStyle, imageStyle, onPress } = props;
  return (
    <View className="justify-center">
      <TouchableOpacity className={buttonStyle} onPress={onPress}>
        {source && <Image source={source} className={imageStyle} />}
        <Text className={textStyle}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;
