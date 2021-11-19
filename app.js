const express = require("express")
const app = express();
const mongoose = require("mongoose")
const Participant = require("./models/participants")
const Meeting = require("./models/meeting")
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
            res.send({message:error})
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
            res.redirect("/addmeeting")
            
        }
        if( req.body.start_time==="")
        {
            res.send({message:"Start time cannot be empty."})
           
        }
        else if (req.body.end_time==="")
        {
            res.send({message:"End time cannot be empty."})
            
        }
        else if(req.body.start_time>=req.body.end_time)
        {
            res.send({message:"start time cannot be after end time"})
            
        }
        else if (starttime<now)
        {
            res.send({message:"please add date of future"})
        }
        else{
            flag=1;
            firstparticipant=Participant.findOne({id:firstid});
            secondparticipant=Participant.findOne({id:secondid});
            console.log(flag)
            size1=firstparticipant.dates_occuped==null?0:firstparticipant.dates_occuped.length
            size2=secondparticipant.dates_occuped==null?0:secondparticipant.dates_occuped.length
            for (let j=0;j<size1;j++)
            {
                console.log("loop1")
                stime=firstparticipant.dates_occuped[j].start_time;
                etime=firstparticipant.dates_occuped[j].end_time;
                if (!(stime>=endtime || starttime>=etime))
                {
                    flag=0;
                    res.send({message:"Times are overlapping with first member"});
                    break ;
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
                    break;
                }
            }
            console.log(flag)
            if (flag===1)
            {
                var meeting=new Meeting(req.body);
                meeting.save();
                
                 Participant.findOneAndUpdate({id:firstid},{$push:{dates_occuped:{start_time:starttime,end_time:endtime}}}).exec();
                 Participant.findOneAndUpdate({id:secondid},{$push:{dates_occuped:{start_time:starttime,end_time:endtime}}}).exec();
  
                res.send(meeting);
            }
            next();
            
        }
    }
    catch(error)
    {
        res.send({message:error})
    }
})
// get the list of scheduled meetings
app.get("/scheduledmeetings",(req,res)=>{
    try{
            
        Meeting.getmeetings(function(err,meeting){
            if (err)
            {
                throw err;
            }
    
            res.json(meeting);
    })}
    catch(error){
        res.send({message:error})
    }
})

mongoose.connect(process.env.DB_CONNECTION_STRING,(req,res)=>{
    console.log("Connected to the database")
})

app.listen(3000,()=>{
    console.log("Listening to 3000");
});