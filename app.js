const express= require("express")
const app =express();
const mongoose = require("mongoose")
const Participant=require("./models/participants")
const Meeting=require("./models/meeting")
app.use(express.json())
require("dotenv/config")
app.get("/",(req,res)=>{
    res.send("First Request");
});
app.get("/meetings",(req,res)=>{
    res.send("Here are the scheduled meetings");
});
// to add the participants 
app.post("/addparticipant",async(req,res)=>{
    console.log(req.body)
    try{
        var participant=new Participant(req.body);
            await participant.save();
            res.send(participant);

    }
    catch(error)
    {
        res.send({message:error})
    }
   

})
app.post("/addmeeting",async(req,res)=>{
    console.log(req.body)
    try{
        var meeting=new Meeting(req.body);
            await meeting.save();
            res.send(meeting);

    }
    catch(error)
    {
        res.send({message:error})
    }
   

})

mongoose.connect(process.env.DB_CONNECTION_STRING,(req,res)=>{
    console.log("Connected to the database")
})

app.listen(3000,()=>{
    console.log("Listening to 3000");
});