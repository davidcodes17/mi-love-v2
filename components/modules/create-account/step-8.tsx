import React, { useState, useRef, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import InputField from "@/components/common/input-field";
import { Flag, Home, SearchNormal } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import PhoneInput from "react-native-phone-number-input";

// List of countries
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface Step8Props {
  values: any;
  errors: any;
  touched: any;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Step8 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step8Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Bottom sheet refs
  const countryBottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const countrySnapPoints = useMemo(() => ["70%"], []);

  // Callbacks
  const handleCountryPresentModalPress = useCallback(() => {
    countryBottomSheetRef.current?.present();
  }, []);

  // Country selection handler
  const handleCountrySelect = (country: string) => {
    handleChange("country")(country);
    setSearchQuery(""); // Clear search when country is selected
    countryBottomSheetRef.current?.dismiss();
  };

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    return countries.filter(country =>
      country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <>
      <ThemedView>
        <ThemedText marginTop={20} fontSize={30}>
          How do we reach you?
        </ThemedText>
        <ThemedText marginTop={7}>
          Create an account by filling out the form below.
        </ThemedText>

        <InputField
          icon={<Home color="#ddd" size={20} />}
          placeholder="Home Address"
          label="Home Address"
          value={values.home_address}
          onChangeText={handleChange("home_address")}
          onBlur={() => handleBlur("home_address")}
        />
        {touched.home_address && errors.home_address && (
          <ThemedText color="red" marginTop={4}>{errors.home_address}</ThemedText>
        )}

        {/* Country Picker */}
        <ThemedView marginTop={10}>
          <ThemedText>Country</ThemedText>
          <TouchableOpacity onPress={handleCountryPresentModalPress}>
            <ThemedView
              borderWidth={0.3}
              borderColor={"#ddd"}
              borderRadius={10}
              marginTop={5}
              padding={12}
              flexDirection="row"
              alignItems="center"
              gap={10}
            >
              <Flag color="#ddd" size={20} />
              <ThemedText>
                {values.country ? values.country : "Select Country"}
              </ThemedText>
            </ThemedView>
            {touched.country && errors.country && (
              <ThemedText color="red" marginTop={4}>{errors.country}</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        <ThemedView marginTop={15}>
          <ThemedText marginBottom={6}>Phone Number</ThemedText>
          <PhoneInput
            defaultValue={values.phonenumber}
            defaultCode="NG"
            layout="first"
            onChangeFormattedText={(text) =>
              handleChange("phonenumber")(text)
            }
            containerStyle={styles.phoneContainer}
            textContainerStyle={styles.phoneTextContainer}
            codeTextStyle={{ color: "#000", fontSize: 16 }}
            textInputStyle={{ color: "#000", fontSize: 16 }}
            flagButtonStyle={styles.flagButton}
            withDarkTheme={false}
            withShadow={false}
          />
          {touched.phonenumber && errors.phonenumber && (
            <ThemedText color="red" marginTop={4}>
              {errors.phonenumber}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView
          width={"40%"}
          justifyContent="flex-end"
          alignSelf="flex-end"
          marginTop={20}
        >
          <NativeButton
            onPress={onNext}
            text={isLast ? "Submit" : "Next"}
            mode="fill"
            style={{ borderRadius: 100 }}
          />
        </ThemedView>
      </ThemedView>

      {/* Country Selection BottomSheet */}
      <BottomSheetModal
        ref={countryBottomSheetRef}
        index={0}
        snapPoints={countrySnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20, flex: 1 }}>
          <ThemedText fontSize={20} marginBottom={20} textAlign="center" weight="bold">Select Country</ThemedText>
          
          {/* Search Input */}
          <ThemedView
            borderWidth={1}
            borderColor="#ddd"
            borderRadius={12}
            padding={12}
            flexDirection="row"
            alignItems="center"
            gap={10}
            marginBottom={15}
            backgroundColor="#f8f9fa"
          >
            <SearchNormal color="#666" size={20} />
            <TextInput
              placeholder="Search countries..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: "#000",
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>
          
          <ScrollView 
            showsVerticalScrollIndicator={true}
            style={{ height: 350 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <TouchableOpacity 
                  key={country}
                  onPress={() => handleCountrySelect(country)}
                  activeOpacity={0.7}
                  style={{ 
                    padding: 16, 
                    borderWidth: 1, 
                    borderColor: values.country === country ? "#7B61FF" : "#eee", 
                    borderRadius: 12, 
                    marginBottom: 8,
                    backgroundColor: values.country === country ? "#f0f0ff" : "#fff"
                  }}
                >
                  <ThemedText fontSize={16} color={values.country === country ? "#7B61FF" : "#000"} weight={values.country === country ? "medium" : "regular"}>
                    {country}
                  </ThemedText>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedView alignItems="center" padding={20}>
                <ThemedText color="#666" fontSize={16}>No countries found</ThemedText>
              </ThemedView>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default Step8;

const styles = StyleSheet.create({
  phoneContainer: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F6FA",
  },
  phoneTextContainer: {
    borderRadius: 14,
    backgroundColor: "#F5F6FA",
  },
  flagButton: {
    marginRight: 8,
  },
});
