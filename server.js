const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const app = express();

const server = app.listen(300);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost/mongoosedashboarddb', {useNewUrlParser: true});

const RoachSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 5},
    description: {type: String, required: true, minlength: 5},
    age: {type: Number, required: true},
})

const Roach = mongoose.model('Roach', RoachSchema);

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({exteded: true}));
app.use(session({
    secret: 'keyboardkitten',
    resave: false,
    saveUnitialized: true,
    cookei: { MaxAge: 60000 }
}));
app.use(flash());

app.get('/', (req, res) => {

    Roach.find()
        .then(data => {
            console.log(data);
            res.render('index', {all_roaches: data})
        })
        .catch(err => res.json(err));
});

app.get('/roach/:id'), (req, res) => {
    console.log(req.params.id);

    Roach.find({_id: req.params.id})
        .then(data => res.render('displayOne', {roach: data}))
        .catch(err => res.json(err));
}

app.get('/roach/new', (req, res) => {
    res.render('new');
})

app.post('/process_roach', (req, res) => {
    const roach = new Roach();
    roach.name = req.body.name;
    roach.description = req.body.description;
    roach.age = req.body.age;
    roach.save()
        .then(newRoachData => {
            console.log('Roach Created', newRoachData)
            res.redirect('/')
        })
        .catch(err => {
            console.log("We have an error!")
            for (var key in err.errors) {
                req.flash('creating_animal', err.errors[key].message);
            }
            res.redirect('/roach/new');
        })
});

app.get('/roach/edit/:id', (req, res) => {
    console.log(req.params.id);
    Roach.findOne({_id: req.params.id})
        .then(RoachData => {
            res.render('edit', {roach: RoachData})
        })
        .catch(err => res.json(err));
});

app.post('/process_edit/:id', (req, res) => {
    Roach.findOne({_id: req.params.id})
        .then(UpdateRoach => {
            UpdateRoach.name = req.body.name;
            UpdateRoach.description = req.body.description;
            UpdateRoach.age = req.body.age;
            UpdateRoach.save()
            res.redirect('/')
        })
        .catch(err => {
            console.log('Error!')
            for (var key in err.errors) {
                req.flash('updating_animal', err.errors[key].message);
            }
            res.redirect(`/roach/edit/:${req.params.id}`)
        })
});

app.get('/roach/destroy/:id', (req, res) => {
    Roach.remove({_id: req.params.id})
        .then(deletedRoach => {
            console.log("Roach removed")
            res.redirect('/')
        })
        .catch(err => res.json(err));
});