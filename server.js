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


var serviceaccount = require('./saejammu.json')
var firebaseadmin = admin.initializeApp({
	credential: admin.credential.cert(serviceaccount),
	databaseURL: "https://saejammu.firebaseio.com"
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

const FIVE_HOURS = 1000 * 60 * 60 * 5;
const NAME = "sid";
const {
	SESS_NAME = NAME,
		SESS_LIFETIME = FIVE_HOURS,
		NODE_ENV = 'development',
		SESS_SECRET = "adlnads/\{}askasn",
} = process.env

const IN_PROD = NODE_ENV === 'production'

var port = 100;
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
const DOMAIN = 'sandbox01a29f4b49044b5c9320998d1b31d06b.mailgun.org';
const mg = mailgun({
	apiKey: '9ae15e0d3a1af1ce61a1954074eef341-c27bf672-b00bcf03',
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
	database.ref().child("List of Updates").once('value', function (snapshot) {

		res.render('index/', {
			indexdata: snapshot.val()
		})
	})

})

app.get('/index', function (req, res) {
	database.ref().child("List of Updates").orderByChild('date').once('value', function (snapshot) {

		res.render('index/', {
			indexdata: snapshot.val()
		})
	})

})
app.get('/contact', function (req, res) {
	res.render('contact/')

})
app.get('/events', function (req, res) {
	database.ref().child("Events").orderByChild('date').once('value', function (snapshot) {

		res.render('events/', {
			eventsdata: snapshot.val()
		})
	})

})

app.get('/achievments', function (req, res) {

	database.ref().child("Achievments").orderByChild('date').once('value', function (snapshot) {

		res.render('achievments/', {
			achievementdata: snapshot.val()
		})
	})
})

app.get('/team', function (req, res) {
	database.ref().child("Team").orderByChild('date').once('value', function (snapshot) {

		res.render('team/', {
			teamdata: snapshot.val()
		})
	})
})

app.get('/aboutus', function (req, res) {
	res.render('aboutus/')

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


	database.ref().child("List of Updates").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/home/', {
				updatesdata: snapshot.val()
			})
		} else {
			res.render('Admin/home/', {
				updatesdata: "No Data"
			})
		}
	})


})


app.get('/Admin/updatedetails', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})

app.get('/Admin/eventsupdate', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})

app.get('/Admin/updateimgup', redirectlogin, function (req, res) {

	res.redirect("/Admin/home")


})
app.get('/Admin/removeupdate', redirectlogin, function (req, res) {

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

app.get('/Admin/events', redirectlogin, function (req, res) {


	database.ref().child("Events").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/events/', {
				eventsdata: snapshot.val()
			})
		} else {
			res.render('Admin/events/', {
				eventsdata: "No Data"
			})
		}
	})



})
app.get('/Admin/events-details', redirectlogin, function (req, res) {

	res.redirect('/Admin/events')


})
app.get('/Admin/eventsitemupdate', redirectlogin, function (req, res) {

	res.redirect('/Admin/events')


})
app.get('/Admin/eventsitemimgup', redirectlogin, function (req, res) {

	res.redirect('/Admin/events')


})

app.get('/Admin/removeeventsitem', redirectlogin, function (req, res) {

	res.redirect('/Admin/events')


})


app.get('/Admin/team', redirectlogin, function (req, res) {


	database.ref().child("Team").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/team/', {
				teamdata: snapshot.val()
			})
		} else {
			res.render('Admin/team/', {
				teamdata: "No Data"
			})
		}
	})


})
app.get('/Admin/team-details', redirectlogin, function (req, res) {

	res.redirect('/Admin/team')


})
app.get('/Admin/teamitemupdate', redirectlogin, function (req, res) {

	res.redirect('/Admin/team')


})
app.get('/Admin/teamitemimgup', redirectlogin, function (req, res) {

	res.redirect('/Admin/team')


})

app.get('/Admin/removeteamitem', redirectlogin, function (req, res) {

	res.redirect('/Admin/team')


})
app.get('/Admin/Achievments', redirectlogin, function (req, res) {


	database.ref().child("Achievments").once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/Achievments/', {
				Achievmentsdata: snapshot.val()
			})
		} else {
			res.render('Admin/Achievments/', {
				Achievmentsdata: "No Data"
			})
		}
	})



})
app.get('/Admin/Achievments-details', redirectlogin, function (req, res) {

	res.redirect('/Admin/Achievments')


})
app.get('/Admin/Achievmentsitemupdate', redirectlogin, function (req, res) {

	res.redirect('/Admin/Achievments')


})
app.get('/Admin/Achievmentsitemimgup', redirectlogin, function (req, res) {

	res.redirect('/Admin/Achievments')


})

app.get('/Admin/removeAchievmentsitem', redirectlogin, function (req, res) {

	res.redirect('/Admin/Achievments')


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
			from: 'sae@iitjammu.ac.in',
			to: 'treasurer.sae@iitjammu.ac.in',
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

app.post('/Admin/addupdate', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("List of Updates").push().set({
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

app.post('/Admin/updatedetails', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("List of Updates").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/update-details/', {
				updatedetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/update-details/', {
				updatedetails: "No Data",
				projectid: id
			})
		}
	})


})


app.post('/Admin/removeupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("List of Updates").child(id).remove().then(function () {


		res.redirect('/Admin/home')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/updateimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
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
		database.ref().child("List of Updates").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("List of Updates").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/update-details/', {
						updatedetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/update-details/', {
						updatedetails: "No Data",
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

app.post('/Admin/updateupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("List of Updates").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {
		database.ref().child("List of Updates").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/update-details/', {
					updatedetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/update-details/', {
					updatedetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})


app.post('/Admin/addevents', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("Events").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/events')

	})
});

app.post('/Admin/addteam', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("Team").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/Team')

	})


})
app.post('/Admin/addAchievments', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("Achievments").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/Achievments')

	})


})
app.post('/Admin/Achievments-details', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("Achievments").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/Achievments-details/', {
				Achievmentsdetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/Achievments-details/', {
				Achievmentsdetails: "No Data",
				projectid: id
			})
		}
	})


})




app.post('/Admin/events-details', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("Events").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/events-details/', {
				eventsdetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/events-details/', {
				eventsdetails: "No Data",
				projectid: id
			})
		}
	})


})

app.post('/Admin/removeeventsitem', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Events").child(id).remove().then(function () {


		res.redirect('/Admin/events')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/eventsitemimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
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
		database.ref().child("Events").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("Events").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/events-details/', {
						eventsdetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/events-details/', {
						eventsdetails: "No Data",
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

    app.post('/Admin/removeAchievmentsitem', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Achievments").child(id).remove().then(function () {


		res.redirect('/Admin/Achievments')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/Achievmentsitemimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
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
		database.ref().child("Achievments").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("Achievments").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/Achievments-details/', {
						Achievmentsdetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/Achievments-details/', {
						Achievmentsdetails: "No Data",
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
    app.post('/Admin/Achievmentsitemupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Achievments").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {

		database.ref().child("Achievments").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/Achievments-details/', {
					Achievmentsdetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/Achievments-details/', {
					Achievmentsdetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})
app.post('/Admin/eventsitemupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Events").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {

		database.ref().child("Events").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/events-details/', {
					eventsdetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/events-details/', {
					eventsdetails: "No Data",
					projectid: id
				})
			}
		})

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})



app.post('/Admin/addteam', redirectlogin, function (req, res) {
	var date = new Date()
	database.ref().child("Team").push().set({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		date: formatDate(date),
		imgurl: "",
		description: "",
		publish: "yes",

	}).then(function () {

		res.redirect('/Admin/team')

	})


})

app.post('/Admin/team-details', redirectlogin, function (req, res) {

	var id = req.body.Pid.toString().trim();

	database.ref().child("Team").child(id).once('value', function (snapshot) {
		if (snapshot.val() != null) {
			res.render('Admin/team-details/', {
				teamdetails: snapshot.val(),
				projectid: id
			})
		} else {
			res.render('Admin/team-details/', {
				teamdetails: "No Data",
				projectid: id
			})
		}
	})


})

app.post('/Admin/removeteamitem', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Team").child(id).remove().then(function () {


		res.redirect('/Admin/team')

	}).catch(function (error) {

		console.log("Failed: " + error.message)

	})


})

app.post('/Admin/teamitemimgup', redirectlogin, upload.single('imgurlp'), (req, res, next) => {
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
		database.ref().child("Team").child(id).update({
			imgurl: namefile,

		}).then(function () {

			database.ref().child("Team").child(id).once('value', function (snapshot) {
				if (snapshot.val() != null) {
					res.render('Admin/team-details/', {
						teamdetails: snapshot.val(),
						projectid: id
					})
				} else {
					res.render('Admin/team-details/', {
						teamdetails: "No Data",
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

app.post('/Admin/teamitemupdate', redirectlogin, function (req, res) {
	var date = new Date()
	var id = req.body.Pid.toString().trim();
	database.ref().child("Team").child(id).update({
		name: req.body.namep.toString(),
		link: req.body.linkp.toString(),
		publish: req.body.publishp.toString(),
		description: req.body.descriptionp.toString(),

	}).then(function () {

		database.ref().child("Team").child(id).once('value', function (snapshot) {
			if (snapshot.val() != null) {
				res.render('Admin/team-details/', {
					teamdetails: snapshot.val(),
					projectid: id
				})
			} else {
				res.render('Admin/team-details/', {
					Achievmentsdetails: "No Data",
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
			to: 'treasurer.sae@iitjammu.ac.in',
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