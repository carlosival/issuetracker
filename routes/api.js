'use strict';

let mongodb = require('mongodb');
let mongoose = require('mongoose');



module.exports = function (app) {

  const URI = process.env.MONGO_URI;
  mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });


const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true },
  created_on: {type: Date, required: true},
  updated_on: {type: Date, required: true},
  project: String
})

let Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filterObject = Object.assign(req.query)
      filterObject['project'] = project
      Issue.find(filterObject,(error, arrayOfResults) => {
         if(!error && arrayOfResults){
              return res.json(arrayOfResults);
         }
      })
   })
    
    .post(function (req, res){
      let project = req.params.project;
      // Validation of min necessary values
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by ){
       return res.json({error: 'required field(s) missing'})
      }
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text:  req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open:true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      });

      newIssue.save((error, savedIssue)=>{
          if(!error && savedIssue){
            console.log(savedIssue);
            return res.json(savedIssue);

          }
      });
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let updateObject = {}

      Object.keys(req.body).forEach((key)=>{
        if(req.body[key] != ''){
          updateObject[key] = req.body[key];
        }
      })

      if(!req.body._id){
        return res.json({ error: 'missing _id' })
       }

      if(Object.keys(updateObject).length < 2){
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }
      
      updateObject['updated_on'] = new Date().toUTCString();
      
      Issue.findByIdAndUpdate(
          req.body._id,
          updateObject,
          {new: true},
          (error, updatedIssue) => {
            if(!error && updatedIssue){
              console.log(updatedIssue);
              return res.json({  result: 'successfully updated', '_id': req.body._id })
            }else {
              return res.json({ error: 'could not update', '_id': req.body._id });
            }

          }
      );
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if(!req.body._id){
         return res.json({ error: 'missing _id' });
      }

      Issue.findByIdAndDelete(req.body._id, (error, deletedIssue)=>{
          if(!error &&  deletedIssue){
              res.json({ result: 'successfully deleted', '_id': req.body._id });
          }else if(!deletedIssue){
              res.json({ error: 'could not delete', '_id': req.body._id });
          }
      });
     
    });
    
};
