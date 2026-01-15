import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  zipCode: z.string().min(4, { message: "Zip code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: "Card number must be 16 digits" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be MM/YY" }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "CVV must be 3 or 4 digits" }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
