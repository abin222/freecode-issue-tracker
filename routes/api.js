'use strict';
const {Project} = require('../models/project');
const {Issue} = require('../models/project');
const {inspect} = require('util');
const mongoose = require('mongoose');

//gets req.query as first argument, then possible queries as second argument.
//looks if req.query has all the possible fields then returns an object with each params
//destructured
const queryParser = (source,fields,obj={})=>{
  fields.forEach(field=>{
    if(source[field]){
      obj[field]=source[field]
    }
  })
  return obj;
}

//compares all the string elements inside requiredFields to each element in issue object,
//if it finds a match pushes it to the errors array

function requiredFieldChecker(issue, requiredFields) {
  let errors = []
  
  
  requiredFields.forEach(field => {
    if (!issue[field]) { errors.push(field) }
  })
  
  if (errors.length) {
    return {error:'required field(s) missing'}
  }
  // return false
}

module.exports = function (app) {

  //project name will be apitest for testing
  app.route('/api/issues/:project')
  
    .get(async (req, res)=>{
      let fields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open', 'created_on', 'updated_on'];
      let query = queryParser(req.query,fields);
      let project = req.params.project;
      //You can send a GET request to /api/issues/{projectname}
      //for an array of all issues for that specific projectname,
      // with all the fields present for each issue.
      let projectFromDB = await Project.findOne({projectname:project});
      let projectId = projectFromDB._id;
      query.project=projectId;
      
      await Issue.find(query,(err,issues)=>{
        if(err){
          res.status(400).send(err)
        }
        res.json(issues)
      })
      
      //You can send a GET request to /api/issues/{projectname} 
      //and filter the request by also passing along
      // any field and value as a URL query (ie. /api/issues/{project}?open=false).
      // You can pass one or more field/value pairs at once
    })
    
    .post(async (req, res)=>{
      let project = req.params.project;
      req.body.project = project;
      let errors = requiredFieldChecker(req.body,['issue_title','issue_text','created_by'])
      console.log(errors);
      if(errors){
        res.status(400).send(errors);
        return
      }else{
          let {issue_title,issue_text,created_by,assigned_to,status_text} = req.body;

          let projectFromDB = await Project.findOne({projectname:project}).exec();

          const issue = new Issue({
            project: projectFromDB._id,
            issue_title: issue_title,
            issue_text: issue_text,
            created_by: created_by,
            assigned_to: assigned_to,
            status_text: status_text,
            created_on: Date(),
            updated_on: Date(),
            open: true
          })
      
          await issue.save(function (err){
            if(err) return console.log(err);
          });

          projectFromDB.issues.push(issue);
          await projectFromDB.save();

          res.status(200).send(issue);
      }
      
       
    })
    
    .put(async (req, res)=>{
      let project = req.params.project;
      let fields = ['_id','issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
      let fieldsToUpdate= queryParser(req.body,fields);

      if(Object.keys(fieldsToUpdate).length<2){
          if(!req.body._id){
            return res.json({error:'missing_id'})
          }
          return res.json({error: 'no update field(s) sent', _id:fieldsToUpdate._id})
      }

      let issue=await Issue.findOne({_id:fieldsToUpdate._id}).exec();

      if(!issue){
        return res.status(500).json({error:'could not update', _id:fieldsToUpdate._id});
      }

      delete fieldsToUpdate._id;
      Object.keys(fieldsToUpdate).forEach(key=>{
       issue[key]=fieldsToUpdate[key];
       issue.markModified('key');
      })
      issue.updated_on=Date();

      issue.save(function (err){
        if(err) return handleError(err);
      });

      res.json({result: 'successfully updated', _id:issue._id})
    })
    
    .delete(async (req, res)=>{
      let project = req.params.project;
      let _id=req.body._id;
      if(!_id){
        return res.status(404).json({error:'missing_id'});
      }
      let issue = await Issue.findOne({_id:_id}).exec();
      console.log(issue);
      if(!issue){
        return res.status(405).json({error: 'could not delete', _id:_id})
      }else{
           Issue.findByIdAndRemove({_id});
      res.status(400).json({result:'successfully deleted',_id:issue._id})
      }
   
      
      //You can send a DELETE request to /api/issues/{projectname}
      //with an _id to delete an issue.
      //If no _id is sent, the return value is { error: 'missing _id' }.
      // On success, the return value is { result: 'successfully deleted', '_id': _id }.
      // On failure, the return value is { error: 'could not delete', '_id': _id }.
    });
    
};
