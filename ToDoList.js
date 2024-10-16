document.addEventListener("DOMContentLoaded", function () {
    const categoryForm = document.getElementById("category-form");
    const categoryInput = document.getElementById("categoryInput");
    const categoryList = document.getElementById("categoryList");
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const dueDateInput = document.getElementById("due-date-input");
    const categorySelect = document.getElementById("Category-select");
    const taskList = document.getElementById("taskList");
    const categoryStats = document.getElementById("category-stats");
    const chartCanvas = document.getElementById("categoryCompletionChart");
    let categoryChart;

    // Load categories
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
                const confirmDelete = confirm(`Are you sure you want to delete the category: "${category}"?`);
                if (confirmDelete) {
                    categories.splice(index, 1);
                    localStorage.setItem("categories", JSON.stringify(categories));
                    loadCategories();
                    updateAnalytics();
                }
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

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        taskList.innerHTML = "";
        tasks.sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            return a.completed - b.completed;
        });

        tasks.forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.classList.add('task-item');

            // Add the 'completed-task' class if the task is completed
            if (task.completed) {
                taskItem.classList.add('completed-task');
            }

            taskItem.innerHTML = `
                <input type="checkbox" class="complete-task" data-index="${index}" ${task.completed ? 'checked' : ''}>
                <strong>Name: ${task.name} | Due: ${task.dueDate}</strong>
                <div>Category: ${task.categories.join(", ")}</div>
                <button class="delete-task" data-index="${index}">Delete</button>
            `;

            taskList.appendChild(taskItem);
        });

        const checkboxes = document.querySelectorAll(".complete-task");
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                const index = this.getAttribute("data-index");
                toggleTaskCompletion(index, this.checked);
            });
        });

        const deleteButtons = document.querySelectorAll(".delete-task");
        deleteButtons.forEach(button => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                const confirmDelete = confirm("Are you sure you want to delete this task?");
                if (confirmDelete) {
                    deleteTask(index);
                }
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
        loadTasks();
        updateAnalytics();
    }

    function toggleTaskCompletion(index, isCompleted) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks[index].completed = isCompleted;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadTasks();
        updateAnalytics();
    }

    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const newTask = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);

        if (newTask) {
            const task = {
                name: newTask,
                dueDate: dueDate,
                categories: selectedCategories,
                completed: false
            };

            saveTask(task);
            loadTasks();
            taskForm.reset();
            updateAnalytics();
        }
    });

    function updateAnalytics() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const categories = JSON.parse(localStorage.getItem("categories")) || [];
        const categoryCounts = categories.map(category => ({
            category,
            total: 0,
            completed: 0
        }));

        tasks.forEach(task => {
            task.categories.forEach(category => {
                const categoryData = categoryCounts.find(c => c.category === category);
                if (categoryData) {
                    categoryData.total += 1;
                    if (task.completed) {
                        categoryData.completed += 1;
                    }
                }
            });
        });

        const labels = categoryCounts.map(c => c.category);
        const completionRates = categoryCounts.map(c => (c.completed / (c.total || 1)) * 100);
        renderChart(labels, completionRates);
        displayCategoryStats(categoryCounts);
    }

    function renderChart(labels, completionRates) {
        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: completionRates,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Completion Rate: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    function displayCategoryStats(categoryCounts) {
        categoryStats.innerHTML = "";
        categoryCounts.forEach(c => {
            const completionRate = c.total > 0 ? (c.completed / c.total) * 100 : 0;
            const statItem = document.createElement("div");
            statItem.textContent = `${c.category}: ${completionRate.toFixed(2)}% completed (${c.completed}/${c.total})`;
            categoryStats.appendChild(statItem);
        });
    }

    // Initial load
    loadCategories();
    loadTasks();
    updateAnalytics();
});
