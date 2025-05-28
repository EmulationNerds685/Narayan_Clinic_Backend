import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Resend } from 'resend';
import mongoose from 'mongoose'
import Appointments from './models/appointment.js'
dotenv.config()

const app=express()
const port=process.env.PORT
app.use(cors())
app.use(express.json())
const resend = new Resend(process.env.RESEND_API_KEY);


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Connected to Mongo")
}).catch((err)=>{
    console.log("Error Connecting:",err)
})
async function sendConfirmationEmail(to, name, appointmentDate,timeSlot,service) {
  try {
    await resend.emails.send({
      from: 'Appointments@narayanheartandmaternitycentre.com', // your verified domain
      to:`${to}`,
      subject: 'Appointment Confirmation',
html: `
  <p>Dear ${name},</p>
  <p>Thank you for choosing <strong>Narayan Heart & Maternity Centre</strong>.</p>
  <p>We are pleased to confirm your appointment as per the following details:</p>
  <ul>
    <li><strong>Date:</strong> ${appointmentDate}</li>
    <li><strong>Time:</strong> ${timeSlot}</li>
    <li><strong>Service:</strong> ${service}</li>
  </ul>
  <p>If you have any questions or need to make changes to your appointment, please feel free to contact us at <a href="mailto:narayanheartmaternitycentre@gmail.com">narayanheartmaternitycentre@gmail.com</a> or call us at <strong>+91-9708441467</strong> or <strong>+91-9836197624</strong>.</p>
  <p>We look forward to seeing you.</p>
  <p>Warm regards,<br/>
  Narayan Heart & Maternity Centre<br/>
  <a href="https://narayanheartandmaternitycentre.com">narayanheartandmaternitycentre.com</a></p>
`
,
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
}


app.get('/',(req,res)=>{
    res.send("Hello")
})
app.post('/book', async (req, res) => {
    const { name,email, phoneNumber, service, address, appointmentDate, timeSlot } = req.body;
  
    try {
      // Count existing patients
      const count = await Appointments.countDocuments();
  
      const patient_info = {
        name: name,
        email:email,
        ph_number: phoneNumber,
        address: address,
        service: service,
        appointment_date: appointmentDate,
        appointment_time: timeSlot,
        patient_number: count + 1, // Set the next patient number
      };
  
      const newPatient = new Appointments(patient_info);
      await newPatient.save();
   try {
  await sendConfirmationEmail(email, name, appointmentDate,timeSlot,service);
} catch (emailErr) {
  console.error("Failed to send email, but booking saved.");
}
      res.status(201).json({ message: "Appointment Booked Successfully! You'll receive the confirmation Email shortly. " });
    } catch (err) {
      res.status(500).json({ message: "Failed to save post", err });
    }
  });
  

app.get('/appointments',async(req,res)=>{
    try{
const patients=await Appointments.find().sort({createdAt:-1})
res.json(patients)
    }catch(err){
        console.log(err)
        res.json({err})
    }
})
app.post('/contact',(req,res)=>{
console.log(req.body)
res.json({message:"Thanks for contacting"})
})
app.post('/feedback',(req,res)=>{
console.log(req.body)
res.sendStatus(200).json({message:"Thanks for your feedback"})
})
app.listen(port,()=>{
    console.log(`Server is listening on port:${port}`)
})