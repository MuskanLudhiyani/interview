const express = require("express")
const hbs=require("hbs")
const app = express();
const mongoose = require("mongoose")
const Participant = require("./models/participants")
const Meeting = require("./models/meeting")
const bodyParser=require("body-parser")
const path=require("path");
const { urlencoded } = require("express");
const static_path=path.join(__dirname,"./templates/views")
const hbs_path=path.join(__dirname,"./templates/partials")
var nodemailer=require("nodemailer");
const { getMaxListeners } = require("process");

var transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:"m98923654@gmail.com",
        pass:"9450747560"
    }


})


app.use(bodyParser());
app.use(express.json())

app.use(urlencoded({extended:false}))

app.use(express.json()) 
app.set("view engine","hbs")
app.set("views",static_path)
hbs.registerPartials(hbs_path)
require("dotenv/config")
app.get("/",(req,res)=>{
    res.render("index");
});

// to add the participants 
app.post("/addparticipant",async(req,res)=>{
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
// get list of participants
app.get('/participants', (req,res)=>{
    try{
        
        Participant.getParticipants(function(err,participant){
            if (err)
            {
                throw err;
            }
    
            res.json(participant);
    })}
    catch(error){
        res.send({message:error.message})
    }   
});  
//add meetings
app.post("/addmeeting",async(req,res,next)=>{
    try{
        var starttime= new Date(req.body.start_time);
        var endtime= new Date(req.body.end_time);
        var firstid=req.body.id1;
        var secondid=req.body.id2;
        var now= new Date();
        
        if (firstid===secondid || firstid===0 || secondid==0)
        {
            res.send({message:"Please select two participants."})
            return;
             
              
            
        }
        if( req.body.start_time==="")
        {
            res.send({message:"Start time cannot be empty."})
            return;
           
        }
        else if (req.body.end_time==="") 
        {
            res.send({message:"End time cannot be empty."})
            return;
            
        }
        else if(req.body.start_time>=req.body.end_time)
        {
            res.send({message:"start time cannot be after end time"})
            return;
            
        }
        else if (starttime<now)
        {
            res.send({message:"please add date of future"})
            return;
        }
        else{
            flag=1;
            firstparticipant=await Participant.findOne({id:firstid});
            firstmail=firstparticipant.email;
            if (firstparticipant==null)
            {
                res.send("first id doesnot exist");
                return;
                
            }
            secondparticipant=await Participant.findOne({id:secondid});
            secondmail=secondparticipant.email
            if (secondparticipant==null)
            {
                res.send("second id doesnot exist")
                return;
            }
            console.log(flag)
            size1=firstparticipant.dates_occuped==null?0:firstparticipant.dates_occuped.length
            size2=secondparticipant.dates_occuped==null?0:secondparticipant.dates_occuped.length
            for (let j=0;j<size1;j++)
            {
                stime=firstparticipant.dates_occuped[j].start_time;
                etime=firstparticipant.dates_occuped[j].end_time;
                if (!(stime>=endtime || starttime>=etime))
                {
                    flag=0;
                    res.send({message:"Times are overlapping with first member"});
                    return;
                }
            }
            for (let j=0;j<size2;j++)
            {
                stime=secondparticipant.dates_occuped[j].start_time;
                etime=secondparticipant.dates_occuped[j].end_time;
                if (!(stime>=endtime || starttime>=etime))
                {
                    console.log("loop2if")
                    flag=0;
                    res.send({message:"Times are overlapping with second member"});
                    return;
                }
            }
            console.log(flag)
            if (flag===1)
            {
                var meeting=new Meeting(req.body);
                meeting.save();
                transporter.sendMail({
                    from: "m98923654@gmail.com",
                    to:firstmail,
                    subject:"Interview",
                    text:"Your Interview has been scheduled."
                },(error,info)=>{
                    if (error)
                    {
                        console.log(error);

                    }
                    else{
                        console.log("message_sent");
                    }
                
                })
                transporter.sendMail({
                    from: "m98923654@gmail.com",
                    to:secondmail,
                    subject:"Interview",
                    text:"Your Interview has been scheduled."
                },(error,info)=>{  
                    if (error)
                    {
                        console.log(error);

                    }
                    else{
                        console.log("message_sent");
                    }
                
                })
                 Participant.findOneAndUpdate({id:firstid},{$push:{dates_occuped:{start_time:starttime,end_time:endtime}}}).exec();
                 Participant.findOneAndUpdate({id:secondid},{$push:{dates_occuped:{start_time:starttime,end_time:endtime}}}).exec();
  
                res.send(meeting);
                next();
            }
           
            
        }
    }
    catch(error)
    {
        res.send({message:error})
    }
})
app.get("/addmeeting",(req,res)=>{
    res.render("addmeeting")
})
// get the list of scheduled meetings
app.get("/getmeetings",(req,res)=>{
    try{    
        meeting= Meeting.getmeetings(function(err,meeting){
            if (err)
            {
                throw err;
            }
           
    
            res.json(meeting);
            return;
    })}
    catch(error){
        res.send({message:error})
    }
})
app.post("/updatemeeting",async (req,res)=>{
    if(Meeting.count()==0 || (await Meeting.find({meetingid:req.body.id})).length==0)
    { 
        res.send("No such meeting exists");
        return;
    }
    
    mid=req.body.id
    meet=await Meeting.findOne({meetingid:mid})
    console.log(meet)
    firstparticipant=await Participant.findOne({id:meet.id1});
    secondparticipant=await Participant.findOne({id:meet.id2});
    size1=firstparticipant.dates_occuped==null?0:firstparticipant.dates_occuped.length
    size2=secondparticipant.dates_occuped==null?0:secondparticipant.dates_occuped.length
    firstparticipantindex=0
    secondparticipantindex=0 
    for (let j=0;j<size1;j++)
    {
        console.log(firstparticipant.dates_occuped[j].start_time)
        stime=firstparticipant.dates_occuped[j].start_time;
        etime=firstparticipant.dates_occuped[j].end_time;
        if (stime==meet.start_time)
        {
            firstparticipantindex=j;
            break ;
        }
    }
    for (let j=0;j<size2;j++)
    {
        stime=secondparticipant.dates_occuped[j].start_time;
        etime=secondparticipant.dates_occuped[j].end_time;
        if (stime==meet.start_time)
        {
            secondparticipantindex=j;
            break ;
        }
    }

    firstparticipant.dates_occuped.slice(firstparticipantindex,1)
    secondparticipant.dates_occuped.slice(secondparticipantindex,1)
    
    await Meeting.deleteOne({meetingid:meet.meetingid})
    res.redirect("/addmeeting")


})


mongoose.connect(process.env.DB_CONNECTION_STRING,(req,res)=>{
    console.log("Connected to the database")
})

app.listen(3000,()=>{
    console.log("Listening to 3000");
});