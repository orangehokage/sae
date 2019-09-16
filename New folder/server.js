var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var admin = require('firebase-admin');
var multer = require('multer');
var fs = require('fs');
var session = require('express-session')

var passwordHash = require('password-hash');

var hashedPassword = passwordHash.generate('admin');
const FirebaseStore = require('connect-session-firebase')(session);


var xssFilters = require('xss-filters');
var sanitizeHtml = require('sanitize-html');


var serviceaccount = require('./coding-club-eb1b5-firebase-adminsdk-k706b-8ea191d421.json')
var firebaseadmin = admin.initializeApp({
	credential: admin.credential.cert(serviceaccount),
	databaseURL: "https://coding-club-eb1b5.firebaseio.com"
})

//----------------------Twilio---------------


var database = firebaseadmin.database();

app.set('view engine', "ejs");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: false
}))

app.use(express.static('views'));
app.use(express.static('views/Admin'));

const SIX_HOURS = 1000 * 60 * 60 * 6;
const NAME = "sid";
const {
	SESS_NAME = NAME,
		SESS_LIFETIME = SIX_HOURS,
		NODE_ENV = 'development',
		SESS_SECRET = "adlnads/\{}askasn",
} = process.env

const IN_PROD = NODE_ENV === 'production'

var port = 5000;
app.listen(port, function () {
	console.log('App is running');
});

app.set('trust proxy', 1) // trust first proxy

app.use(session({
	store: new FirebaseStore({
		database: firebaseadmin.database()
	}),
	name: SESS_NAME,
	secret: SESS_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: SESS_LIFETIME,
		sameSite: true,
		secure: IN_PROD
	}
}))
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox3ce7ee2b8bec4ac6b3fed4a49d26b5bd.mailgun.org';
const mg = mailgun({
	apiKey: '6b9e62922903960a2834ec6c331a3f12-2ae2c6f3-7bf7d9c1',
	domain: DOMAIN
});


//-------------------------------------------------------Main Website-------------------------//

function redirectlogin(req, res, next) {
	if (req.session.nameid == "one") {
		next(); //If session exists, proceed to page
	} else {
		res.redirect('/Admin/login')
	}
}


var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './views/assets/images')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + file.originalname)

	}
})
var upload = multer({
	storage: storage
})

function formatDate(date) {
	var year = date.getFullYear().toString();
	var month = (date.getMonth() + 101).toString().substring(1);
	var day = (date.getDate() + 100).toString().substring(1);
	return year + "-" + month + "-" + day;
}


app.get('/', function (req, res) {
	database.ref().child("News").once('value', function (snapshot) {

		res.render('index/', {
			newsdata: snapshot.val()
		})
	})

})

app.get('/index', function (req, res) {
	database.ref().child("News").orderByChild('date').once('value', function (snapshot) {

		res.render('index/', {
			newsdata: snapshot.val()
		})
	})

})
app.get('/contact-us', function (req, res) {
	res.render('contact-us/')

})
app.get('/gallery', function (req, res) {
	database.ref().child("Gallery").orderByChild('date').once('value', function (snapshot) {

		res.render('gallery/', {
			gallerydata: snapshot.val()
		})
	})

})

app.get('/workshops', function (req, res) {

	database.ref().child("List of Workshops").orderByChild('date').once('value', function (snapshot) {

		res.render('workshops/', {
			workshopsdata: snapshot.val()
		})
	})
})

app.get('/team', function (req, res) {
	res.render('team/')

})

app.get('/Admin', function (req, res) {
	res.render('Admin/login/')

})
app.get('/Admin/signout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) {

			res.send(err.message + " Error signing out!")
		} else {
			res.redirect('/Admin/login')

		}
	});


})
app.get('/Admin/login', function (req, res) {
	res.render('Admin/login/')


})


app.get('/Admin/home', redirectlogin, function (req, res) {


	database.ref().child("List of Workshops").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/home/', {
				workshopsdata: snapshot.val()
			})
		} else {
			res.render('Admin/home/', {
				workshopsdata: "No Data"
			})
		}
	})


})


app.get('/Admin/workshopdetails', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})

app.get('/Admin/eventupdate', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})

app.get('/Admin/workshopimgup', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})
app.get('/Admin/removeworkshop', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})

app.get('/Admin/contacts', redirectlogin, function (req, res) {


	database.ref().child("List of Contacts").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/contacts/', {
				contactsformdata: snapshot.val()
			})
		} else {
			res.render('Admin/contacts/', {
				contactsformdata: "No Data"
			})
		}
	})


})

app.get('/Admin/gallery', redirectlogin, function (req, res) {


	database.ref().child("Gallery").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/gallery/', {
				gallerydata: snapshot.val()
			})
		} else {
			res.render('Admin/gallery/', {
				gallerydata: "No Data"
			})
		}
	})


})
app.get('/Admin/gallery-details', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})
app.get('/Admin/galleryitemupdate', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})
app.get('/Admin/galleryitemimgup', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})

app.get('/Admin/removegalleryitem', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})


app.get('/Admin/news', redirectlogin, function (req, res) {


	database.ref().child("News").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/news/', {
				newsdata: snapshot.val()
			})
		} else {
			res.render('Admin/news/', {
				newsdata: "No Data"
			})
		}
	})


})
app.get('/Admin/news-details', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})
app.get('/Admin/newsitemupdate', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})
app.get('/Admin/newsitemimgup', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})

app.get('/Admin/removenewsitem', redirectlogin, function (req, res) {

	res.redirect('/Admin/gallery')


})


app.get('/Admin/resetpassword', redirectlogin, function (req, res) {

	res.redirect('/Admin/login')


})
app.get('/Admin/checkcode', function (req, res) {

	res.redirect('/Admin/login')


})


app.get('/Admin/forgotpassword', function (req, res) {

	database.ref().child("Admin").once('value', function (snapshot) {
		var valuep = snapshot.child("password").val();
		//-------------Mailgun-------------------

		const data = {
			from: 'codingclubsupport@iitjammu.ac.in',
			to: 'codingclub@iitjammu.ac.in',
			subject: 'Password Recovery Code',
			text: valuep
		};
		mg.messages().send(data, function (error, body) {
			if (error) {
				console.log(error);
			} else {
				console.log(body);
				res.render('Admin/forgotpassword/')
			}
		});
	})
})


//---------post-methods-////////


app.post('/Admin/checkcode', function (req, res) {


	var code = req.body.code.toString();

	database.ref().child("Admin").once('value', function (snapshot) {

		var valuep = snapshot.child("password").val();

		if (code == valuep) {

			req.session.nameid = "one";
			res.render('Admin/resetpassword/')

		} else {
			res.send("Wrong Code")
		}

	})


})


app.post('/Admin/resetpassword', redirectlogin, function (req, res) {


	var newpassword = req.body.newpassword.toString();
	var confirmpassword = req.body.confirmpassword.toString();

	if (newpassword == confirmpassword) {
		var newhashedPassword = passwordHash.generate(newpassword);

		database.ref().child("Admin").update({

			password: newhashedPassword,


		}).then(function () {

			res.redirect('/Admin/home')


		})
	} else {
		res.send("Please confirm passwords correctly")


	}


})


app.post('/Admin/checklogin', function (req, res) {


	var username = req.body.username.toString();
	var password = req.body.password.toString();
	database.ref().child("Admin").once('value', function (snapshot) {

		var valueU = snapshot.child("username").val();
		var valuep = snapshot.child("password").val();

		if (valueU == username) {
			if (passwordHash.verify(password, valuep)) {
				req.session.nameid = "one";

				res.redirect('/Admin/home')

			} else {

				res.send("Wrong Credentials")
			}
		} else {

			res.send("Wrong Credentials")

		}
	})


})

//date : formateDate(date)                  date: date.toDateString().substring(4),

app.post('/Admin/addworkshop', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("List of Workshops").push().set({
		name: req.body.namep.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		link: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/home')

	})


})

app.post('/Admin/workshopdetails', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("List of Workshops").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/workshop-details/', {
				workshopdetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/workshop-details/', {
				workshopdetails: "No Data",
				projectid: id
			})
		}
	})


})


app.post('/Admin/removeworkshop', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("List of Workshops").child(id).remove().then(function () {


		res.redirect('/Admin/home')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/workshopimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
	const file = req.file

	if (!file) {
		const error = new Error('Please upload a file')
		error.httpStatusCode = 400
		return next(error)
	}
	var id = req.body.Pid.toString().trim();

	var namefile = file.filename;

	var image = file.mimetype.startsWith('image/');
	if (image) {
		database.ref().child("List of Workshops").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("List of Workshops").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/workshop-details/', {
						workshopdetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/workshop-details/', {
						workshopdetails: "No Data",
						projectid: id
					})
				}
			})

		}).catch(function (error) {

			console.log("Failed: " + error.message)

		})
	} else {
		res.send("Please select Images only");
	}


})

app.post('/Admin/workshopupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("List of Workshops").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {
		database.ref().child("List of Workshops").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/workshop-details/', {
					workshopdetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/workshop-details/', {
					workshopdetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})


app.post('/Admin/addgallery', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("Gallery").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/gallery')

	})


})

app.post('/Admin/gallery-details', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("Gallery").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/gallery-details/', {
				gallerydetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/gallery-details/', {
				gallerydetails: "No Data",
				projectid: id
			})
		}
	})


})

app.post('/Admin/removegalleryitem', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Gallery").child(id).remove().then(function () {


		res.redirect('/Admin/gallery')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/galleryitemimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
	const file = req.file

	if (!file) {
		const error = new Error('Please upload a file')
		error.httpStatusCode = 400
		return next(error)
	}
	var id = req.body.Pid.toString().trim();

	var namefile = file.filename;

	var image = file.mimetype.startsWith('image/');
	if (image) {
		database.ref().child("Gallery").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("Gallery").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/gallery-details/', {
						gallerydetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/gallery-details/', {
						gallerydetails: "No Data",
						projectid: id
					})
				}
			})

		}).catch(function (error) {

			console.log("Failed: " + error.message)

		})
	} else {
		res.send("Please select Images only");
	}


})

app.post('/Admin/galleryitemupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Gallery").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {

		database.ref().child("Gallery").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/gallery-details/', {
					gallerydetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/gallery-details/', {
					gallerydetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})


app.post('/Admin/addnews', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("News").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/news')

	})


})

app.post('/Admin/news-details', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("News").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/news-details/', {
				newsdetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/news-details/', {
				newsdetails: "No Data",
				projectid: id
			})
		}
	})


})

app.post('/Admin/removenewsitem', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("News").child(id).remove().then(function () {


		res.redirect('/Admin/news')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/newsitemimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
	const file = req.file

	if (!file) {
		const error = new Error('Please upload a file')
		error.httpStatusCode = 400
		return next(error)
	}
	var id = req.body.Pid.toString().trim();

	var namefile = file.filename;

	var image = file.mimetype.startsWith('image/');
	if (image) {
		database.ref().child("News").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("News").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/news-details/', {
						newsdetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/news-details/', {
						newsdetails: "No Data",
						projectid: id
					})
				}
			})

		}).catch(function (error) {

			console.log("Failed: " + error.message)

		})
	} else {
		res.send("Please select Images only");
	}


})

app.post('/Admin/newsitemupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("News").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {

		database.ref().child("News").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/news-details/', {
					newsdetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/news-details/', {
					newsdetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})


app.post('/Admin/changepassword', redirectlogin, function (req, res) {


	var currentpassword = req.body.currentpassword.toString();

	var newpassword = req.body.newpassword.toString();
	var newhashedPassword = passwordHash.generate(newpassword);

	/*  
	  var currentpassword = req.body.currentpassword.toString();
	  var newpassword = req.body.newpassword.toString();
	 */
	database.ref().child("Admin").once('value', function (snapshot) {

		var valuep = snapshot.child("password").val();
		if (passwordHash.verify(currentpassword, valuep)) {

			database.ref().child("Admin").update({
				password: newhashedPassword,


			}).then(function () {

				res.send("Password has updated !!")


			})

		} else {
			res.send("Wrong Credentials")
		}

	})


})


app.post('/Admin/contactdetails', redirectlogin, function (req, res) {
	var id = req.body.Pid.toString().trim();

	database.ref().child("List of Contacts").child(id).once('value', function (snapshot) {
		var name = snapshot.child('name').val();
		var email = snapshot.child('email').val();
		var date = snapshot.child('date').val();
		var message = snapshot.child('message').val();
		res.render('Admin/contact-details/', {
			name: name,
			email: email,
			date: date,
			message: message,
			id: id
		})

	})


})

app.post('/contactus', function (req, res) {
	var date = new Date()

	var clean = sanitizeHtml(req.body.name.toString());
	var clean2 = sanitizeHtml(req.body.email.toString());
	var clean3 = sanitizeHtml(req.body.message.toString());

	var name = xssFilters.inHTMLData(clean);
	var email = xssFilters.inHTMLData(clean2);
	var message = xssFilters.inHTMLData(clean3);
	var body = "\nName : " + name + "\n" + message;
	database.ref().child("List of Contacts").push().set({
		name: name,
		email: email,
		date: date.toDateString(),
		message: message,


	}).then(function () {


		const data = {
			from: email,
			to: 'codingclub@iitjammu.ac.in',
			subject: 'Contact Form Message',
			text: body,
		};
		mg.messages().send(data, function (error, body) {
			if (error) {
				console.log(error);
			} else {
				console.log(body);
				res.render('thnxpopup.ejs')
			}
		});

	})


})