document.addEventListener("DOMContentLoaded", function () {
    const categoryForm = document.getElementById("category-form");
    const categoryInput = document.getElementById("categoryInput");
    const categoryList = document.getElementById("categoryList");
    const taskform = document.getElementById("task-form");
    const taskinput = document.getElementById("task-input");
    const dueDateInput = document.getElementById("due-date-input");
    const categorySelect = document.getElementById("Category-select");
    const taskList = document.getElementById("taskList");

    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem("categories")) || [];
        categoryList.innerHTML = "";
        categorySelect.innerHTML = "";

        categories.forEach((category, index) => {
            const categoryItem = document.createElement("div");
            categoryItem.classList.add("category-item");

            const categoryName = document.createElement("span");
            categoryName.textContent = category;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-category");

            deleteButton.addEventListener("click", function () {
                categories.splice(index, 1);
                localStorage.setItem("categories", JSON.stringify(categories));
                loadCategories();
            });

            categoryItem.appendChild(categoryName);
            categoryItem.appendChild(deleteButton);
            categoryList.appendChild(categoryItem);

            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    function saveCategory(category) {
        const categories = JSON.parse(localStorage.getItem("categories")) || [];
        categories.push(category);
        localStorage.setItem("categories", JSON.stringify(categories));
    }

    categoryForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const newCategory = categoryInput.value.trim();
        if (newCategory) {
            saveCategory(newCategory);
            categoryInput.value = "";
            loadCategories();
        }
    });

    function loadtask() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        taskList.innerHTML = "";
        //pang dort ng date para prioty nya yung malapit na duedate
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        tasks.forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.classList.add('task-item');
            taskItem.innerHTML = `
                <strong>Name: ${task.name} Due: ${task.dueDate}</strong>
                <div>Category: ${task.categories.join(", ")}</div>
                <button class="delete-task" data-index="${index}">Delete</button>
            `;
            taskList.appendChild(taskItem);
        });

        //nilagayan ko muna delete button kac sa pag testing para hindi mapuno ng task ang local storage dapat ito ay update/edit button
        const deleteButtons = document.querySelectorAll(".delete-task");
        deleteButtons.forEach(button => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                deleteTask(index);
            });
        });

    }

    
    function saveTask(task) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function deleteTask(index) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadtask();
    }

    taskform.addEventListener("submit", function (event) {
        event.preventDefault();
        const newTask = taskinput.value.trim();
        const dueDate = dueDateInput.value;
        const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);

        if (newTask && dueDate) {
            const task = {
                name: newTask,
                dueDate: dueDate,
                categories: selectedCategories,
                completed: false
            };

            saveTask(task);
            loadtask();
            taskform.reset();
        }
    });

    loadCategories();
    loadtask();
});
