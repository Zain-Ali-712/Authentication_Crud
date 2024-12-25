const employeeForm = document.getElementById("employeeForm");
const employeeList = document.getElementById("employeeList");

const API_URL = "http://localhost:3000/employees";

// Fetch employees
async function fetchEmployees() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        renderEmployees(data);
    } catch (error) {
        console.error("Error fetching employees:", error);
        alert("Failed to fetch employee list.");
    }
}

// Render employees
function renderEmployees(employees) {
    employeeList.innerHTML = "";
    employees.forEach((employee) => {
        const employeeItem = document.createElement("li");
        employeeItem.classList.add("user-item");
        employeeItem.innerHTML = `
            <div class="user-details">
                <span>${employee.empName}</span>
                <span>ID: ${employee.employeeId}</span>
            </div>
            <div class="user-actions">
                <button onclick="editEmployee('${employee._id}')">Edit</button>
                <button onclick="deleteEmployee('${employee._id}')">Delete</button>
            </div>
        `;
        employeeList.appendChild(employeeItem);
    });
}

// Add employee
employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const empName = document.getElementById("empName").value;
    const employeeId = document.getElementById("employeeId").value;

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empName, employeeId }),
        });
        fetchEmployees();
        employeeForm.reset();
    } catch (error) {
        console.error("Error adding employee:", error);
    }
});

// Edit employee
async function editEmployee(id) {
    const empName = prompt("Enter new Employee Name:");
    const employeeId = prompt("Enter new Employee ID:");

    if (empName && employeeId) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empName, employeeId }),
            });
            fetchEmployees();
        } catch (error) {
            console.error("Error editing employee:", error);
        }
    }
}

// Delete employee
async function deleteEmployee(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchEmployees();
    } catch (error) {
        console.error("Error deleting employee:", error);
    }
}

// Fetch current employee from session
async function fetchCurrentEmployee() {
    const response = await fetch("http://localhost:3000/current-employee");
    const data = await response.json();
    console.log("Current employee from session:", data);
}

// Fetch employee name from cookie
async function fetchEmployeeCookie() {
    const response = await fetch("http://localhost:3000/read-cookie",{ 
        method: 'GET',
        credentials: 'include'});
    const data = await response.json();
    console.log("Employee name from cookie:", data);
}

fetchEmployees();
fetchCurrentEmployee();
fetchEmployeeCookie();
