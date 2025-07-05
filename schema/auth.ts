import * as Yup from "yup";

const authShema = [
  // Step 1: Email
  Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
  }),
  // Step 2: OTP
  Yup.object({
    otp: Yup.string().length(6, "Must be 6 digits").required("Required"),
  }),
  // Step 3: Name & Username
  Yup.object({
    fullName: Yup.string().required("Required"),
    username: Yup.string().required("Required"),
  }),
  // Step 4: Interests
  Yup.object({
    interests: Yup.array().min(1, "Select at least one interest"),
  }),
  // Step 5: Emergency Contact
  Yup.object({
    emergencyContact: Yup.string().required("Required"),
  }),
  // Step 6: Password
  Yup.object({
    password: Yup.string().min(6, "Min 6 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Required"),
  }),
  // Step 7: Know More (Gender, DOB, Profile Image)
  Yup.object({
    gender: Yup.string().required("Required"),
    dob: Yup.string().required("Required"),
    profileImage: Yup.string().required("Required"),
  }),
  // Step 8: Where you are
  Yup.object({
    home_address: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    phonenumber: Yup.string().required("Required"),
  }),
  // Step 9: Who are you (Bio)
  Yup.object({
    bio: Yup.string().required("Required"),
  }),
  // Step 10: Thank You (No validation needed)
  Yup.object({}),
];

export default authShema;
