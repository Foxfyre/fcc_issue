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
      
        query.project = project;
      
        if (query._id) query._id = new ObjectId(query._id);
        if (query.open) query.open = String(query.open) == "true";
      
        
        MongoClient.connect(process.env.DATABASE, (err, db) => {
          const collection = db.collection("issues");
          
          collection.find(query).toArray((err, result) => {
            res.json(result); 
          })
          
        })
      
      
      })
            //app.route('/api/issues/:project')
      .post((req, res) => {
        const project = req.params.project;

        MongoClient.connect(process.env.DATABASE, (err, db) => {
          const collection = db.collection("issues");

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
          let modified = {};
          let noChange = true;

          const open = Boolean(req.body.open);

          for (let i in req.body) {
            if (req.body[i] !== "" && i !== "_id") {
              noChange = false;
              modified[i] = req.body[i]
            }
          }

          noChange ? res.send("no updates") : modified.updated_on = new Date();

          MongoClient.connect(process.env.DATABASE, (err, db) => {
            const collection = db.collection("issues");

            collection.updateOne({_id: ObjectId(req.body._id)}, {$set: modified}, (err, data) => {
              err ? res.send("Error: update failed") : res.send("Update Successful");
            })
          })
        })
        .delete(function (req, res){
          const project = req.params.project;
          console.log(project);
          MongoClient.connect(process.env.DATABASE, (err, db) => {
            const collection = db.collection("issues");

            if (!req.body._id || req.body._id.length !== 24) {
              res.send("_id error");
            } else {
              collection.findOneAndDelete({project: project, _id: ObjectId(req.body._id)}, (err, data) => {
                if (err) {
                  res.send("Delete failed"); 
                } else if (data.value !== null) {
                  res.send("Deleted"); 
                } else {
                  res.send(req.body._id + " not found");
                }
              });
            }
          });
        });

    };

  
