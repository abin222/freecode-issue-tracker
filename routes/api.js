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

const bodyParser = (source,fields)=>{
  
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
          res.status(500).json(err)
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
      let {issue_title,issue_text,created_by,assigned_to,status_text} = req.body;
      if(!issue_title || !issue_text || !created_by){
        res.status(504).json({error: 'required field(s) missing'});
      }
      //We will find the project by name, and then add the new issue into this project

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
        if(err) return handleError(err);
      });

      projectFromDB.issues.push(issue);
      await projectFromDB.save();

      res.send(issue);
       
    })
    
    .put(async (req, res)=>{
      let project = req.params.project;
      let fields = ['_id','issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
      let fieldsToUpdate= queryParser(req.body,fields);
      if(Object.keys(fieldsToUpdate).length<2){
          res.json({error: 'no update field(s) sent', _id:fieldsToUpdate._id})
      }
      let issue=await Issue.findOne({_id:fieldsToUpdate._id},(err,issue)=>{
        if(err){
          res.status(500).json({error:'could not update', _id:fieldsToUpdate._id});
        }
       
      });

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
    
    .delete(function (req, res){
      let project = req.params.project;
      let {_id}=req.body;
      if(!_id){
        res.json({error:'missing_id'});
      }
      Issue.findByIdAndRemove(_id,(err,issue)=>{
        if(err){
          res.json({error: 'could not delete', _id:issue._id})
        }else{
          res.json({result:'successfully deleted',_id:issue._id})
        }
        
      })
      
      //You can send a DELETE request to /api/issues/{projectname}
      //with an _id to delete an issue.
      //If no _id is sent, the return value is { error: 'missing _id' }.
      // On success, the return value is { result: 'successfully deleted', '_id': _id }.
      // On failure, the return value is { error: 'could not delete', '_id': _id }.
    });
    
};
