"use strict";

const toDoForm = document.querySelector("#todo-form");
const taskInput = document.querySelector("#todo-input");
const submitButtons = document.querySelectorAll(".submit");
const toDoList = document.querySelector("#todo-list");
const toDoStatus = document.querySelector("#todo-status");
const completedTasks = document.querySelector("#completed-tasks");
const totalTasks = document.querySelector("#total-tasks");
const overlay = document.querySelector("#overlay");
const editMenu = document.querySelector("#edit-menu");
const mainMenu = document.querySelector("#main-menu");
const checkMenu = document.querySelector("#check-menu");
const sortMenu = document.querySelector("#sort-menu");

// Load tasks from localStorage or set to an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Convert string dates to Date objects
tasks.forEach((task) => {
  if (task.date && typeof task.date === "string") {
    task.date = new Date(task.date);
  }
});

let editingTaskId = null;

// Initialize Sortable.js for drag-and-drop functionality
let sortable = new Sortable(toDoList, {
  animation: 150, // Animation speed during sorting
  sort: false, // Disable sorting by default
  onEnd: function () {
    const updatedTasks = [];
    toDoList.querySelectorAll("li").forEach((li) => {
      const taskId = li.getAttribute("data-task-id");
      const task = tasks.find((t) => t.id == taskId);
      if (task) {
        updatedTasks.push(task);
      }
    });
    tasks = updatedTasks; // Update tasks order
    saveTasks();
  },
});

// Update DOM with current tasks
const updateDOM = () => {
  toDoList.innerHTML = "";
  tasks.forEach((task, id) => addOrUpdateTask(task, id));
};

// Add new task or update existing one in DOM
const addOrUpdateTask = (task, id) => {
  const existingTask = toDoList.querySelector(`#task-${id}`);
  const checked = task.status === "completed" ? "checked" : "";
  const li = `
      <li id="task-${task.id}" data-task-id="${task.id}" class="${checked}">
          <label for="task-checkbox-${task.id}">
            <input type="checkbox" id="task-checkbox-${task.id}" class="checkbox" ${checked}>
            <p>${task.name}</p>
          </label>

          <img class="edit-btn" data-task-id="${id}" src="img/icon_edit-menu.svg" alt="edit menu">
      </li>
      `;

  if (existingTask) {
    existingTask.outerHTML = li; // Update task in DOM
  } else {
    toDoList.insertAdjacentHTML("beforeend", li); // Add new task to DOM
  }
};

// Save tasks to localStorage and update task counters
const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  countTasks();
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Count total and completed tasks and update progress bar
const countTasks = () => {
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  toDoStatus.style.display = tasks.length === 0 ? "none" : "block"; // Show or hide task status
  completedTasks.innerText = completedCount; // Update completed tasks count
  totalTasks.innerText = tasks.length; // Update total tasks count

  const progressPercent = tasks.length
    ? (completedCount / tasks.length) * 100
    : 0;
  document.querySelector(".progress").style.width = `${progressPercent}%`; // Update progress bar
};

// Handle form submission for adding or editing tasks
submitButtons.forEach((button) => {
  button.addEventListener("click", (evt) => {
    evt.preventDefault();

    if (taskInput.value) {
      if (editingTaskId !== null) {
        const task = tasks.find((t) => t.id == editingTaskId);
        if (task) {
          task.name = taskInput.value; // Update task name
          editingTaskId = null; // Reset editing mode
        }
      } else {
        tasks.push({
          id: new Date().getTime(), // Generate unique task ID
          name: taskInput.value,
          date: new Date().toISOString(),
          status: "pending",
        });
      }
    } else {
      taskInput.classList.add("invalid-input"); // Highlight input field if empty
      taskInput.focus();
      return;
    }

    saveTasks();
    updateDOM();

    // Reset
    editingTaskId = null;
    taskInput.classList.remove("invalid-input");
    taskInput.classList.remove("editing");
    toDoForm.reset();
  });
});

// Handle input changes in form
toDoForm.addEventListener("input", () => {
  if (editingTaskId === null) {
    taskInput.classList.remove("invalid-input"); // Remove highlighting of input field
  }
});

// Handle clicks on task list (edit or toggle task status)
toDoList.addEventListener("click", (evt) => {
  const taskId = evt.target.closest("li")?.getAttribute("data-task-id");

  if (!taskId) return;

  const task = tasks.find((t) => t.id == taskId);

  if (!task) return;

  if (evt.target.matches(".edit-btn")) {
    editMenu.setAttribute("data-current-task-id", taskId); // Set task ID in edit menu
    editMenu.classList.toggle("open"); // Toggle edit menu visibility
    overlay.classList.toggle("open"); // Toggle overlay visibility
  } else if (evt.target.matches(".checkbox")) {
    task.status = task.status === "completed" ? "pending" : "completed"; // Toggle task status
    saveTasks();
    updateDOM();
  }
});

// Handle clicks on main menu (toggle check and sort menus)
mainMenu.addEventListener("click", (evt) => {
  overlay.classList.toggle("open"); // Toggle overlay visibility

  if (evt.target.matches(".check-btn")) {
    checkMenu.classList.toggle("open"); // Toggle check menu visibility
    overlay.classList.toggle("open");
  } else if (evt.target.matches(".sort-btn")) {
    sortMenu.classList.toggle("open"); // Toggle sort menu visibility
    overlay.classList.toggle("open");
  }
});

// Handle actions in check menu (check/uncheck/delete tasks)
checkMenu.addEventListener("click", (evt) => {
  if (evt.target.closest("#check-all")) {
    tasks.forEach((task) => {
      task.status = "completed"; // Mark all tasks as completed
    });
    updateDOM();
  } else if (evt.target.closest("#uncheck-all")) {
    tasks.forEach((task) => {
      task.status = "pending"; // Mark all tasks as pending
    });
    updateDOM();
  } else if (evt.target.closest("#delete-checked")) {
    tasks = tasks.filter((task) => task.status !== "completed"); // Delete all completed tasks
    updateDOM();
  } else if (evt.target.closest("#delete-unchecked")) {
    tasks = tasks.filter((task) => task.status !== "pending"); // Delete all pending tasks
    updateDOM();
  }

  saveTasks();
  countTasks();

  checkMenu.classList.remove("open"); // Close check menu
  overlay.classList.remove("open");
});

// Handle actions in sort menu (sort tasks)
sortMenu.addEventListener("click", (evt) => {
  if (evt.target.closest("#sort-manually")) {
    sortable.option("sort", true); // Enable manual sorting
  } else if (evt.target.closest("#sort-alphabetically")) {
    tasks.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }); // Sort tasks alphabetically
  } else if (evt.target.closest("#date-ascending")) {
    tasks.sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort tasks by date (ascending)
  } else if (evt.target.closest("#date-descending")) {
    tasks.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort tasks by date (descending)
  }

  saveTasks();
  updateDOM();

  sortMenu.classList.remove("open"); // Close sort menu
  overlay.classList.remove("open");
});

// Handle actions in edit menu (edit or delete specific task)
editMenu.addEventListener("click", (evt) => {
  const taskId = parseInt(editMenu.getAttribute("data-current-task-id"));

  if (evt.target.closest("#edit")) {
    editingTaskId = taskId; // Set task ID for editing
    const task = tasks.find((t) => t.id == taskId);

    if (task) {
      taskInput.value = task.name; // Load task name into input field
      taskInput.classList.add("editing"); // Change input field background color
      editMenu.classList.remove("open");
      overlay.classList.remove("open");
      taskInput.focus();
    }
  } else if (evt.target.closest("#delete")) {
    tasks = tasks.filter((t) => t.id != taskId); // Delete task
    saveTasks();
    updateDOM();
    editMenu.classList.remove("open");
    overlay.classList.remove("open");
  } else if (evt.target.closest("#cancel")) {
    editingTaskId = null; // Cancel editing
    editMenu.classList.remove("open");
    overlay.classList.remove("open");
  }

  saveTasks();
  countTasks();
});

// Handle clicks outside menus (close menus)
document.addEventListener("click", (evt) => {
  if (!mainMenu.contains(evt.target)) {
    checkMenu.classList.remove("open");
    sortMenu.classList.remove("open");
    overlay.classList.remove("open");
  }
  if (!editMenu.contains(evt.target) && !evt.target.matches(".edit-btn")) {
    editMenu.classList.remove("open");
    overlay.classList.remove("open");
  }
});

// Disable sorting if clicking outside task list
document.addEventListener("mousedown", function (evt) {
  if (!toDoList.contains(evt.target) && sortable.option("sort")) {
    sortable.option("sort", false);
  }
});

// Initialize app by updating DOM and counting tasks
window.onload = () => {
  updateDOM();
  countTasks();
};
