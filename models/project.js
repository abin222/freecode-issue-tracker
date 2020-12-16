const mongoose = require('mongoose');
const Schema=mongoose.Schema;


const issueSchema = new Schema(
  {
    project:{
      type: Schema.Types.ObjectId,
      ref:'Project'
    },
    issue_title: {
      type: String,
      required: true,
    },
    issue_text: {
      type: String,
      required: true,
    },
    created_by:{
      type: String,
      required: true
    },
    assigned_to:{
        //optional
      type: String
    },
    status_text:{
        //optional
        type:String
    },
    created_on: {
      type: Date,
    },
    updated_on:{
        type:Date
    },
    open:{
        //must be true by default
        type: Boolean
    }
  }
);





const projectSchema = new mongoose.Schema(
    {
      _id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      projectname: {
        type: String,
        required: true,
      },
      created_on: {
        type: Date,
      },
      issues: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Issue'
        }
      ],
    }
  );
  
  
const Issue = mongoose.model('Issue',issueSchema) 
const Project = mongoose.model('Project', projectSchema);


const initialProject = new Project({
    _id:new mongoose.Types.ObjectId(),
    projectname: 'apitest',
    created_on: Date.now()
});

initialProject.save(function(err){
    if(err) return handleError(err);

});



  
module.exports = {Project,Issue};
  