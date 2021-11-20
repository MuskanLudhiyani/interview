var mongoose = require('mongoose');
var meetingSchema= mongoose.Schema({
    meetingid:{
        type:Number,
        required:true,
        unique:true
    },
    id1:{
        type:Number,
        required:true
    },
	id2:{
		type:Number,
        required:true
	    	
	},
    start_time:{
        type:Date,
    } ,
    end_time:{
        type:Date,
    } 
    
});
var meetings=module.exports=mongoose.model('meetings',meetingSchema);
module.exports.getmeetings = function(callback){
	return meetings.find(callback);
	
} 
