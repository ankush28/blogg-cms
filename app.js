var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
var session = require("express-session");
const http = require("http").createServer(app);
var io = require("socket.io")(http);
app.use(session({
  key: "admin",
  secret: "any random string"
}));


app.use("/static", express.static(__dirname + "/static"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
mongoose.connect("mongodb+srv://ankush28:ankushrajat2@cluster0.gqw9i.mongodb.net/cmsdb", {useNewUrlParser: true});

const articlesSchema = {
  title: String,
  content: String,
  image: String,
  date: Date
};
const adminSchema = {
  email: String,
  password: String
};
const contactSchema = {
  name: String,
  email :  String,
  message: String
}
const Admin = mongoose.model("Admin", adminSchema);
const Article = mongoose.model("Article", articlesSchema);
const Contact = mongoose.model("Contact", contactSchema);

app.get("/", function(req, res){
  Article.find({}, function(err, foundArticles){
    foundArticles = foundArticles.reverse();
    res.render("user/home", {newLists : foundArticles});
  })
});


app.get("/posts/:id", function(req, res){
  Article.findOne({"_id": ObjectId(req.params.id)}, function(error, articledata){
    res.render("user/post", {newLists: articledata});
  })
})

app.get("/contact", function(req, res){
  res.render("user/contact");
})

app.get("/about", function(req, res){
  res.render("user/about");
})

app.get("/dashboard", function(req, res){
  if(req.session.admin){
    Article.find({}, function(err, foundArticles){
      foundArticles = foundArticles.reverse();
      res.render("admin/dashboard", {newLists : foundArticles});
    });
  }else{
    res.redirect("/admin");
  }
})

app.get("/admin/contact", function(req, res){
  Contact.find({}, function(err, foundcontacts){
    foundcontacts = foundcontacts.reverse();
    res.render("admin/contact", {newcontact : foundcontacts});
  })
})

app.get("/admin/posts", function(req, res){
  if(req.session.admin){
    res.render("admin/posts");
  }else{
    res.redirect("/admin");
  }
});

app.get("/admin", function(req, res){
  res.render("admin/login");
})


app.get("/admin", function(req, res){
  res.render("admin/login");
})


app.post("/admin/posts", function(req, res){
  const titleName = req.body.title;
  const contentBody = req.body.content;
  const imageurl = req.body.image;

  const article = new Article({
    title: titleName,
    content: contentBody,
    image: imageurl
  });
  article.save();
  res.redirect("/admin/posts");
});
app.post("/contact", function(req, res){
  const contactname = req.body.name;
  const contactemail = req.body.email;
  const contactmessage = req.body.message;

  const contact = new Contact({
    name: contactname,
    email: contactemail,
    message: contactmessage
  });
  contact.save();

})

app.get("/do-logout", function(req, res){
  req.session.destroy();
  res.redirect("/admin");
})

app.get("/posts/edit/:id", function(req, res){
  if(req.session.admin){
    Article.findOne({
      "_id": ObjectId(req.params.id)
    }, function(error, article){
      res.render("admin/edit_post", {"article": article});
    });
  }else{
    res.redirect("/admin");
  }
});

app.post("/posts/edit/:id", function(req, res){
  if(req.session.admin){
    Article.updateOne({
      "_id" : ObjectId(req.params.id)
    },{
      $set : {
        "title": req.body.title,
        "image" : req.body.image,
        "content" : req.body.content
      }
    }, function(error, article){
      res.redirect("/dashboard");
    });
  }else{
    res.redirect("/admin");
  }
});

app.post("/posts/:id", function(req, res){
  Article.findOneAndRemove({
    "_id": ObjectId(req.params.id)
  }, function(error, article){
    res.redirect("/dashboard");
  });
})

app.post("/do-admin-login", function(req, res){
  Admin.findOne({"email": req.body.email, "password" : req.body.password}, function(error , admin){
    if(admin != ""){
      req.session.admin = admin;
    }
    res.send(admin);
  })
})

http.listen(3000, function(){
  console.log("connected");
});
