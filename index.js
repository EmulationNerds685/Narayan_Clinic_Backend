import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Appointments from './models/appointment.js'
dotenv.config()

const app=express()
const port=process.env.PORT
app.use(cors())
app.use(express.json())


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Connected to Mongo")
}).catch((err)=>{
    console.log("Error Connecting:",err)
})
app.get('/',(req,res)=>{
    res.send("Hello")
})
app.post('/book', async (req, res) => {
    const { name, phoneNumber, service, address, appointmentDate, timeSlot } = req.body;
  
    try {
      // Count existing patients
      const count = await Appointments.countDocuments();
  
      const patient_info = {
        name: name,
        ph_number: phoneNumber,
        address: address,
        service: service,
        appointment_date: appointmentDate,
        appointment_time: timeSlot,
        patient_number: count + 1, // Set the next patient number
      };
  
      const newPatient = new Appointments(patient_info);
      await newPatient.save();
  
      res.status(201).json({ message: "Appointment Booked Successfully! " });
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

app.listen(port,()=>{
    console.log(`Server is listening on port:${port}`)
})