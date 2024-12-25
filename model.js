const mongoose = require("mongoose");
const cors = require('cors');

const employeeSchema = new mongoose.Schema ({
    empName: {
        type: String    },
    employeeId: {
        type: Number
    }
});

const EmployeeModel = mongoose.model("Employees", employeeSchema);

module.exports = EmployeeModel;



