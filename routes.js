const express = require("express");
const mongoose = require("mongoose");
const Employee = require("./model");
const User = require("./user");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://127.0.0.1:5500" })); // Update origin for frontend
app.use(cookieParser());
app.use(
    session({
        secret: "secret-key", // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60, // 1 hour
            httpOnly: true, // Secure cookie
            secure: false,   // Set to true if you're using HTTPS
            sameSite: "strict",
        },
    })
);

// MongoDB Connection
mongoose
    .connect("mongodb://localhost:27017/authDemo", {
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// userAuthRoutes

app.use(express.urlencoded({ extended:true }));

app.get('/',(req,res) =>{
    res.send('THIS IS THE START!');
});

app.get('/register',(req,res) =>{
    res.render('register');
});

app.get('/login', (req,res) =>{
    res.render("login");
})

app.post('/register', async (req,res) =>{
    const {password , username} = req.body;
    const hash = await bcrypt.hash(password,12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
});

app.post('/login', async (req,res) =>{
    const {username, password} = req.body;
    const user = await User.findOne({username});
    const validPass = await bcrypt.compare(password, user.password);
    if(validPass){
        req.session.user_id = user._id;
        res.redirect("/secret");
    } else {
        res.redirect('/login');
    }
})

app.post("/logout", (req, res) =>{
    req.session.user_id = null;
    res.redirect('/login');
});

app.get('/secret', (req,res) =>{
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    res.render('secret');
});





// Routes
app.get('/set-session-cookie', (req, res) => {
    req.session.user = { name: 'Zain Ali', role: 'Student' };
    res.cookie('testCookie', 'cookieValue', { maxAge: 1000 * 60 * 60, httpOnly: true });
    res.send('Session and cookie set.');
});

app.get('/get-session-cookie', (req, res) => {
    const sessionUser = req.session.user || 'No session data';
    const testCookie = req.cookies.testCookie || 'No cookie';
    res.json({ session: sessionUser, cookie: testCookie });
});

app.get('/destroy-session-cookie', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Error destroying session');
        res.clearCookie('testCookie');
        res.send('Session and cookie destroyed.');
    });
});

// Fetch all employees
app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add a new employee and save in session and cookie
app.post("/employees", async (req, res) => {
    const { empName, employeeId } = req.body;

    try {
        const newEmployee = new Employee({ empName, employeeId });
        await newEmployee.save();

        // Save employee ID in session
        req.session.employeeId = newEmployee._id;

        // Save employee name in a cookie
        res.cookie("employeeName", empName, {
            maxAge: 1000 * 60 * 60, // 1 hour
            httpOnly: true, // Prevent access via JS
        });

        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ error: "Failed to add Employee" });
    }
});

// Get current employee from session
app.get("/current-employee", async (req, res) => {
    const employeeId = req.session.employeeId;

    if (!employeeId) {
        return res.status(404).json({ error: "No employee in session" });
    }

    try {
        const employee = await Employee.findById(employeeId);
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch employee from session" });
    }
});

// Read employee name from cookie
app.get("/read-cookie", (req, res) => {
    const employeeName = req.cookies.employeeName;

    if (!employeeName) {
        return res.status(404).json({ error: "No cookie found" });
    }

    res.json({ employeeName });
});

// Update an employee
app.put("/employees/:id", async (req, res) => {
    const { id } = req.params;
    const { empName, employeeId } = req.body;

    try {
        const updateEmp = await Employee.findByIdAndUpdate(
            id,
            { empName, employeeId },
            { new: true }
        );
        res.status(201).json(updateEmp);
    } catch (error) {
        res.status(400).json({ error: "Failed to update Employee" });
    }
});

// Delete an employee
app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await Employee.findByIdAndDelete(id);
        res.status(201).json("Employee Deleted Successfully!");
    } catch (error) {
        res.status(400).json({ error: "Failed to delete Employee" });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
