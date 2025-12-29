import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { parsePhoneNumber, AsYouType } from "libphonenumber-js";
import { COLORS, TYPOGRAPHY } from "@/config/theme";
import { Call } from "iconsax-react-native";

interface PhoneInputProps {
  value?: string;
  onChangeText: (formattedNumber: string) => void;
  onChangeCountryCode?: (countryCode: string) => void;
  placeholder?: string;
  defaultCountryCode?: CountryCode;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChangeText,
  onChangeCountryCode,
  placeholder = "Phone number",
  defaultCountryCode = "NG",
  error,
}) => {
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode);
  const [callingCode, setCallingCode] = useState<string>("234");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleCountrySelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    if (onChangeCountryCode) {
      onChangeCountryCode(`+${country.callingCode[0]}`);
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    
    // Format as you type using libphonenumber-js
    const formatter = new AsYouType(countryCode as any);
    formatter.input(cleaned);
    
    // Return the full formatted number with country code
    const fullNumber = `+${callingCode}${cleaned}`;
    onChangeText(fullNumber);
    
    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    formatPhoneNumber(cleaned);
  };

  // Extract phone number without country code for display
  const displayValue = value ? value.replace(`+${callingCode}`, "").trim() : "";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {/* Country Picker Button */}
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles.countryButton}
          activeOpacity={0.7}
        >
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCode
            withEmoji
            onSelect={handleCountrySelect}
            visible={isPickerVisible}
            onClose={() => setPickerVisible(false)}
            containerButtonStyle={styles.countryPickerButton}
            theme={{
              primaryColor: COLORS.primary,
              primaryColorVariant: COLORS.primary,
              backgroundColor: "#fff",
              onBackgroundTextColor: "#000",
              fontSize: 16,
              fontFamily: "Quicksand_500Medium",
            }}
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
          <View style={styles.divider} />
        </TouchableOpacity>

        {/* Phone Icon */}
        <View style={styles.iconContainer}>
          <Call size={20} color={isFocused ? COLORS.primary : "#999"} variant="Bold" />
        </View>

        {/* Text Input */}
        <TextInput
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={15}
        />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainerError: {
    borderColor: "#ff3b30",
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  countryPickerButton: {
    marginRight: 4,
  },
  callingCode: {
    fontSize: 16,
    fontFamily: "Quicksand_600SemiBold",
    color: "#333",
    minWidth: 40,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#e0e0e0",
    marginLeft: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Quicksand_500Medium",
    color: "#000",
    paddingVertical: 0,
    height: "100%",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Quicksand_500Medium",
    color: "#ff3b30",
    marginTop: 6,
    marginLeft: 4,
  },
});

export default PhoneInput;
