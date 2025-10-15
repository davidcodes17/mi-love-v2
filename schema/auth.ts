import * as Yup from "yup";

const authSchema = [
  // Step 1: Email
  Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  }),
  // Step 2: OTP
  Yup.object({
    otp: Yup.string()
      .length(6, "OTP must be exactly 6 digits")
      .required("OTP is required"),
  }),
  // Step 3: Name & Username
  Yup.object({
    firstName: Yup.string().required("First name cannot be empty"),
    lastName: Yup.string().required("Last name cannot be empty"),
    username: Yup.string().required("Username is required"),
  }),
  // Step 4: Interests
  Yup.object({
    interests: Yup.array().min(
      1,
      "Please select at least one interest to continue"
    ),
  }),
  // Step 5: Emergency Contact
  Yup.object({
    emergencyContact: Yup.string().required(
      "Please provide an emergency contact number"
    ),
  }),
  // Step 6: Password
  Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Please confirm your password"),
  }),
  // Step 7: Know More (Gender, DOB, Profile Image)
  Yup.object({
    gender: Yup.string().required("Please select your gender"),
    dob: Yup.string().required("Date of birth is required"),
    profileImage: Yup.string().required("Please upload a profile image"),
  }),
  // Step 8: Where you are
  Yup.object({
    home_address: Yup.string().required("Home address is required"),
    country: Yup.string().required("Country is required"),
    phonenumber: Yup.string().required("Phone number is required"),
  }),
  // Step 9: Who are you (Bio)
  Yup.object({
    bio: Yup.string().required("Please write a short bio about yourself"),
  }),
  // Step 10: Thank You (No validation needed)
  Yup.object({}),
];

export default authSchema;
