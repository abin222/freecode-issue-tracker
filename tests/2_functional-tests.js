const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing Tests', function(){

      suite('POST /api/issues/{project} to create a new issue', function(){
          test('Create an issue with every field',()=>{
              //Post request with form data containing required fields
              //issue_title,issue_text,created_by, and optional fields
              //assigned_to and status_text


              //Post request will return the created object, and must include all of the submitted fields.
              //excluded optional fields will be returned as empty strings.

              //Additionally include created_on(date/time), updated_on(date/time), open(boolean,true for open -default value, false for closed)
              //,and _id

              //If you send a POST request to /api/issues/{projectname}
              //without the required fields,
              //returned will be the error { error: 'required field(s) missing' }

          })

          test('Create an issue with only required fields',()=>{

          })

          test('Create and issue with missing required fields',()=>{

          })
      })
  suite('GET /api/issues/{project} to observe issues on a project',()=>{
      test('view issues on a project',()=>{

      })

      test('view issues on a project with one filter',()=>{

      })

      test('view issue on a project with multiple filters',()=>{

      })
  })
  suite('PUT /api/issues/{project} to update fileds on a issue',()=>{
      test('update on field on an issue',()=>{

      })

      test('update an issue with missing _id',()=>{

      })

      test('update an issue with no fields to update',()=>{

      })

      test('update an issue with invalid _id',()=>{

      })
  })

  suite('DELETE /api/issues/{project} to delete an issue',()=>{
    suite('Delete an issue',()=>{

    })

    suite('Delete an issue with an invalid _id',()=>{

    })

    suite('Delete an issue with missing _id',()=>{

    })
  })
  })
});
