const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let deleteID
let projects = 'projects'

suite('Functional Tests', function() {
    suite('CREATING issues', () => { 
     test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .post('/api/issues/projects')
       .set('content-type', 'application/json')
       .send({
         issue_title: 'An Issue',
         issue_text: 'Functional Test',
         created_by: 'Nick',
         assigned_to: 'Kick',
         status_text: 'Not Done',
         open: true
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         deleteID = res.body._id
         assert.equal(res.body.issue_title, 'An Issue')
         assert.equal(res.body.issue_text, 'Functional Test')
         assert.equal(res.body.created_by, 'Nick')
         assert.equal(res.body.assigned_to, 'Kick')
         assert.equal(res.body.status_text, 'Not Done')
         assert.equal(res.body.project, 'projects')
         done();
       })
   })

   test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .post('/api/issues/projects')
       .set('content-type', 'application/json')
       .send({
         issue_title: 'An Issue',
         issue_text: 'Functional Test',
         created_by: 'Nick',
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.issue_title, 'An Issue')
         assert.equal(res.body.issue_text, 'Functional Test')
         assert.equal(res.body.created_by, 'Nick')
         assert.equal(res.body.assigned_to, '')
         assert.equal(res.body.status_text, '')
         assert.equal(res.body.project, 'projects')
         done();
       })
   })

   test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .post('/api/issues/projects')
       .set('content-type', 'application/json')
       .send({
         issue_title: '',
         issue_text: '',
         created_by: '',
         
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'required field(s) missing')
         done()
       })
   })

    })

suite ('VIEWING issues', () => {
   test ('View issues on a project: GET request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .get('/api/issues/projects')
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.isArray(res.body)
         assert.property(res.body[0], "issue_title")
         assert.property(res.body[0], "issue_text")
         assert.property(res.body[0], "created_on")
         assert.property(res.body[0], "updated_on")
         assert.property(res.body[0], "created_by")
         assert.property(res.body[0], "assigned_to")
         assert.property(res.body[0], "open")
         assert.property(res.body[0], "status_text")
         assert.property(res.body[0], "_id")
         done()
       })
   })

   test ('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .get('/api/issues/projects')
       .query({
         _id: deleteID
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         res.body.forEach(issueResult => {
            assert.equal(issueResult.created_by, 'Nick')
        });
         done()
       })
   })

   test ('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
     chai
       .request(server)
       .get('/api/issues/project_test')
       .query({
         open: true,
         issue_title: 'An Issue',
         created_by: 'Nick'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         res.body.forEach(issueResult => {
             assert.equal(issueResult.open, true)
             assert.equal(issueResult.created_by, 'Nick')
         });
         done()
       })
   })
 })

 suite('UPDATING issues', () => {
   test('Update one field on an issue: PUT request to /api/issues/{project}', done => {
     chai
       .request(server)
       .put('/api/issues/project_test')
       // .set('content-type', 'application/json')
       .send({
         _id: '603f5f08f4f09f308931a2ec',
         issue_title: 'two - updated'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.result, 'successfully updated')
         assert.equal(res.body._id, '603f5f08f4f09f308931a2ec')
         done()
       })
   })

   test('Update multiple fields on an issue: PUT request to /api/issues/{project}', done => {
     chai
       .request(server)
       .put('/api/issues/project_test')
       // .set('content-type', 'application/json')
       .send({
         _id: '603f5f08f4f09f308931a2ec',
         issue_title: 'two - updated again',
         issue_text: 'issue two updated again!',
         open: false
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.result, 'successfully updated')
         assert.equal(res.body._id, '603f5f08f4f09f308931a2ec')
         done()
       })
   })

   test('Update an issue with missing _id: PUT request to /api/issues/{project}', done => {
     chai
       .request(server)
       .put('/api/issues/project_test')
       // .set('content-type', 'application/json')
       .send({
         issue_title: 'two - updated once more'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'missing _id')
         done()
       })
   })

   test('Update an issue with no fields to update: PUT request to /api/issues/{project}', done => {
     chai
       .request(server)
       .put('/api/issues/project_test')
       // .set('content-type', 'application/json')
       .send({
         _id: '603f5f08f4f09f308931a2ec'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'no update field(s) sent')
         done()
       })
   })

   test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', done => {
     chai
       .request(server)
       .put('/api/issues/projects')
       // .set('content-type', 'application/json')
       .send({
         _id: '5ff4bc969c00ads4f09',
         issue_title: 'issue shouldn\'t be updated'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'could not update')
         done()
       })
   })
 })


suite ('DELETING issues', () => {
   test('Delete an issue: DELETE request to /api/issues/{project}', done => {
     chai
       .request(server)
       .delete('/api/issues/projects')
       // .set('content-type', 'application/json')
       .send({
         _id: deleteID
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.result, 'successfully deleted')
         done()
       })
   })

   test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', done => {
     chai
       .request(server)
       .delete('/api/issues/projects')
       // .set('content-type', 'application/json')
       .send({
         _id: '5ff4bc969c00ads4f09'
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'could not delete')
         done()
       })
   })

   test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', done => {
     chai
       .request(server)
       .delete('/api/issues/projects')
       // .set('content-type', 'application/json')
       .send({
         _id: ''
       })
       .end((err, res) => {
         assert.equal(res.status, 200)
         assert.equal(res.body.error, 'missing _id')
         done()
       })
   })
 })




});
