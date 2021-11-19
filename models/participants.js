var mongoose = require('mongoose');
var participantSchema= mongoose.Schema({
    id:{
        type:Number,
        required:true
    },
	name:{
		type: String,
        required:true
	    	
	},
	email:{
		type: String,
        required:true,
	
	},
    dates_occuped:{
      type:  [
            {
              start_time: Date,
              end_time: Date,
            },
         ],
         default: []
        }	

});
var participants=module.exports=mongoose.model('participants',participantSchema);
module.exports.getParticipants = function(callback){
	return participants.find(callback);
} 
