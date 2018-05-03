var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    express = require("express"),
    app = express(),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose");

//APP Config
mongoose.connect("mongodb://localhost/BlogSite");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
})
var Blog = mongoose.model("Blog", blogSchema);

//Routes
app.get("/", function (req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { blogs: []});
        }
    });
});

app.get("/blogs/new", function (req, res) {
    res.render("new");
});

app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    var formData = req.body.blog;
    Blog.create(formData, function(err, newBlog) {
        if(err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            res.redirect("/");
        } else {
            res.render("show", { blog: blog });
        }
    });
});

app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("edit", { blog: blog });
        }
    });
});

app.put("/blogs/:id", function (req, res) {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, blog) {
        if (err) {
            console.log(err);
        } else {
            var showUrl = "/blogs" + blog._id;
            res.redirect(showUrl);
        }
    });
});

app.delete("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
        } else {
            blog.remove();
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, function () {
    console.log("Server init");
});