var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var azure = require('azure-storage');

var accountName = "frickimages";
var accountKey = "xmQhvZyBj5mswE0Pk5Bk2VjHli1R3FXWCWqA4ALvbheCAXtoVEu+l2RC3JLeCSREYX17N7SsUUJtkM8kSx4erg==";


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
var blobClient = azure.createBlobService(accountName,accountKey);
blobClient.createContainerIfNotExists('acontainer', function(error, result, response){
  if(!error){
    // Container exists and allows
    // anonymous read access to blob
    // content and metadata within this container
    //setPermissions();

  }
});
var containerName = 'acontainer';

//Routes
app.get('/', function (req, res) {
  res.render('index.ejs', { locals: {
    title: 'Welcome'
  }
  });
});

app.get('/Upload', function (req, res) {
  res.render('upload.ejs', { locals: {
    title: 'Upload File'
  }
  });
});



app.post('/uploadhandler', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var formValid = true;
    if (fields.itemName === '') {
 //     helpers.renderError(res);
      formValid = false;
    }

    if (formValid) {
      var extension = files.uploadedFile.name.split('.').pop();
      var newName = fields.itemName + '.' + extension;

      var options = {
        contentType: files.uploadedFile.type,
        metadata: { fileName: newName }
      };

      blobClient.createBlockBlobFromLocalFile(containerName, fields.itemName, files.uploadedFile.path, options, function (error) {
        if (error != null) {
            console.log("there was an error in createblockblobfromfile");
   //       helpers.renderError(res);
        } else {
   //       setSAS(containerName, fields.itemName);
          res.redirect('/');
        }
      });
    } else {
        console.log("error in createblockblobfromfile");
 //     helpers.renderError(res);
    }
  });
});

/*
function setSAS(containerName, blobName) {
    var sharedAccessPolicy = {
        AccessPolicy: {
            Expiry: azure.date.minutesFromNow(3)
        }
    };   
    
    var blobUrl = blobClient.getBlobUrl(containerName, blobName, sharedAccessPolicy);
    console.log("access the blob at ", blobUrl);
}

function setPermissions() {
  blobClient.setContainerAcl(containerName, azure.Constants.BlobConstants.BlobContainerPublicAccessType.BLOB, function (error) {
    if (error) {
      console.log(error);
    } else {
      app.listen(process.env.port || 1337);
      console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
    }
  });
}
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
