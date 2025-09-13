import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface CustomInputFieldProps extends TextInputProps {
  label: string;
  icon?: string;
  iconFamily?: 'ionicons' | 'material';
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  showPassword?: boolean;
  error?: string;
}

export const CustomInputField: React.FC<CustomInputFieldProps> = ({
  label,
  icon,
  iconFamily = 'ionicons',
  showPasswordToggle = false,
  onPasswordToggle,
  showPassword = false,
  error,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  ...otherProps
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const IconComponent = iconFamily === 'material' ? MaterialIcons : Ionicons;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputError]}
        onPress={handleContainerPress}
        activeOpacity={1}
      >
        {icon && (
          <IconComponent
            name={icon as any}
            size={20}
            color="#6B7280"
            style={styles.icon}
          />
        )}
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          selectTextOnFocus={false}
          returnKeyType="next"
          textContentType="none"
          underlineColorAndroid="transparent"
          {...otherProps}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={onPasswordToggle}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  icon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});
