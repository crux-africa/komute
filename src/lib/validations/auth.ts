import { z } from "zod";

const nigerianPhoneRegex = /^(0[7-9][0-1]\d{8}|\+234[7-9][0-1]\d{8})$/;

export const LoginSchema = z.object({
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(14, "Phone number is too long")
    .regex(nigerianPhoneRegex, "Enter a valid Nigerian phone number"),
  email: z.email("Enter a valid email").optional(),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(14, "Phone number is too long"),
  email: z.email("Enter a valid email").optional(),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(11),
  email: z.email("Enter a valid email").optional(),
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numbers only"),
});

export const onboardingSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  role: z.enum(["RIDER", "DRIVER", "BOTH"]),
  homeArea: z.string().min(2, "Enter your home area").optional(),
  workArea: z.string().min(2, "Enter your work area").optional(),
});

export const ninVerificationSchema = z.object({
  nin: z
    .string()
    .length(11, "NIN must be 11 digits")
    .regex(/^\d{11}$/, "NIN must be numbers only"),
});

export const driverOnboardingSchema = z.object({
  vehicleType: z.enum(["CAR", "SHUTTLE", "KEKE"]),
  vehicleMake: z.string().min(2, "Enter vehicle make").optional(),
  vehicleModel: z.string().min(1, "Enter vehicle model").optional(),
  vehicleColor: z.string().min(2, "Enter vehicle color").optional(),
  vehicleYear: z.coerce
    .number()
    .min(2000)
    .max(new Date().getFullYear() + 1)
    .optional(),
  plateNumber: z
    .string()
    .min(6, "Enter a valid plate number")
    .max(12),
  maxSeats: z.coerce.number().int().min(1).max(14),
  licenseNumber: z
    .string()
    .min(8, "Enter a valid license number")
    .max(20),
});

export const bankDetailsSchema = z.object({
  bankCode: z.string().min(3, "Select a bank"),
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d{10}$/, "Account number must be numbers only"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type NINVerificationInput = z.infer<typeof ninVerificationSchema>;
// export type DriverOnboardingInput = z.infer<typeof driverOnboardingSchema>;
export type DriverOnboardingFormInput = z.input<typeof driverOnboardingSchema>;
export type DriverOnboardingData = z.output<typeof driverOnboardingSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;