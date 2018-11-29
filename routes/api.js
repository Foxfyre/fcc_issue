/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect      = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId    = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE;

MongoClient.connect(CONNECTION_STRING, (err, db) => {
  if (err) console.log("Database error: " + err);
  else console.log("Successful database connection");
});

  module.exports = function (app) {
    
    
    app.route('/api/issues/:project')
      .get(function (req, res){
        const project = req.params.project;
        const query = req.query;
        //console.log(query);
      
        if (query._id) { query._id = new ObjectId(query._id) };
        if (query.open) { query.open = String(query.open) == "true" };
      
        MongoClient.connect(process.env.DATABASE, (err, db) => {
          const collection = db.collection(project);
          
          collection.find(query._id).toArray((err, result) => {
            res.json(result);
          })
        })
      })
            //app.route('/api/issues/:project')
      .post((req, res) => {
        const project = req.params.project;

        MongoClient.connect(process.env.DATABASE, (err, db) => {
          const collection = db.collection(project);

          let assigned_to = "";
          let status_text = "";
          let created_on = new Date();

          if (req.body.assigned_to) assigned_to = req.body.assigned_to;
          if (req.body.status_text) status_text = req.body.status_text;

          if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) res.send("missing inputs");
          else {
            collection.insert({
              project: project,
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              assigned_to: assigned_to,
              status_text: status_text,
              created_on: created_on,
              updated_on: created_on,
              open: true
            }, (err, result) => {
              res.json(result.ops[0]);
            })
          }           
          })
        })
        .put(function (req, res){
          const project = req.params.project;
          let issue = req.body._id;
          delete req.body._id;
          let modified = req.body;

          for (let i in modified) { if (!modified[i]) { delete modified[i] } }
          if (req.body.open) { req.body.open = String(req.body.open) == "true" }; 
          if (Object.keys(modified).length === 0) {
            res.send("no updated field sent");
          } else {
            modified.updated_on = new Date();
            MongoClient.connect(process.env.DATABASE, (err, db) => {
              const collection = db.collection(project);
              collection.updateOne({_id: new ObjectId(issue)}, {$set: modified},{new: true}, (err, data) => {
                (!err) ? res.send("successfully updated") : res.send("could not update " + issue + " " + err);
              })
            })
          }
        })
        .delete(function (req, res){
          const project = req.params.project;
          let issue = req.body._id;
          if (!issue) {
            res.send("_id error"); 
          } else {
          MongoClient.connect(process.env.DATABASE, (err, db) => {
            const collection = db.collection(project);
              collection.findOneAndDelete({project: project, _id: new ObjectId(req.body._id)}, (err, data) => {
                (!err) ? res.send("deleted " + req.body._id) : res.send("could not delete " + req.body._id + " " + err); 
              })
              });
            }
          });
    };

  
