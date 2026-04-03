import { z } from "zod";

const bookAppointmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    ph_number: z.string().length(10, "Phone number must be exactly 10 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    service: z.string().min(2, "Service name is required"),
    appointment_date: z.string(),
    appointment_time: z.string(),
  }),
});

export { bookAppointmentSchema };
