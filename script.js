'use strict';

const toDoForm = document.querySelector('#todo-form');
const taskInput = document.querySelector('#todo-input');
const toDoList = document.querySelector('#todo-list');
const toDoStatus = document.querySelector('#todo-status');
const completedTasks = document.querySelector('#completed-tasks');
const totalTasks = document.querySelector('#total-tasks');
const overlay = document.querySelector('#overlay');
const editMenu = document.querySelector('#edit-menu');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingMode = false;
let editingTaskId = null;
let saveTimeout;

toDoForm.addEventListener('submit', evt => {
  evt.preventDefault();
  if (taskInput.value.trim()) {
    if (editingMode && editingTaskId !== null) {
      tasks[editingTaskId].name = taskInput.value; // update task name
      addOrUpdateTask(tasks[editingTaskId], editingTaskId); // update task in DOM
      editingMode = false; // reset editing mode
      editingTaskId = null; // reset editingTaskId
      taskInput.classList.remove('editing');
  
    } else {
      const taskInfo = {
        name: taskInput.value,
        status: 'pending'
      }
      tasks.push(taskInfo);
      addOrUpdateTask(taskInfo, tasks.length - 1);
    }

    saveTasks();
    toDoForm.reset();
    taskInput.focus();
  } else {
    taskInput.classList.add('invalid-input');
    taskInput.focus();
  }
});

toDoForm.addEventListener('input', () => {
  if (!editingMode) {
    taskInput.classList.remove('invalid-input');
  }
});

const addOrUpdateTask = (task, id) => {
  console.log("addOrUpdateTask called for task:", task);
  const existingTask = toDoList.querySelector(`#task-${id}`);

  const checked = task.status === 'completed' ? 'checked' : '';
  const li = `
    <li id="task-${id}" data-task-id="${id}" class="${checked}">
        <label for="${id}">
            <input type="checkbox" id="${id}" class="checkbox" ${checked}>
            <p>${task.name}</p>
        </label>
        <img class="edit-btn" data-task-id="${id}" src="img/icon_edit-menu.svg" alt="edit menu">
    </li>
    `;

  if (existingTask) {
    existingTask.outerHTML = li;
  } else {
    toDoList.insertAdjacentHTML('beforeend', li);
  }
}

const saveTasks = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      countTasks();
  }, 500);
}

const countTasks = () => {
  console.log("countTasks called");
  const completedTasksArr = tasks.filter(task =>
    task.status === 'completed'
  );

  if (tasks.length === 0) {
    toDoStatus.style.display = 'none';
  } else {
    toDoStatus.style.display = 'block';
    completedTasks.innerText = completedTasksArr.length;
    totalTasks.innerText = tasks.length;
  }

  const progressPercent = (completedTasksArr.length / tasks.length) * 100;
  const progress = document.querySelector('.progress');
  progress.style.width = `${progressPercent}%`;
  console.log(tasks.length);
}

toDoList.addEventListener('click', evt => {
  const taskId = evt.target.closest('li')?.getAttribute('data-task-id');

  if (!taskId) return;

  if (evt.target.matches('.edit-btn')) {
    showEditMenu(taskId);
  } else if (evt.target.matches('.checkbox')) {
    updateStatus(taskId);
  }
});

const showEditMenu = taskId => {
  editMenu.setAttribute('data-current-task-id', taskId);
  editMenu.classList.toggle('open'); // show menu
  overlay.classList.toggle('open');
}

const updateStatus = id => {
  tasks[id].status = tasks[id].status === 'completed' ? 'pending' : 'completed';
  const taskElement = document.querySelector(`#task-${id}`);
  if (tasks[id].status === 'completed') {
    taskElement.classList.add('checked');
  } else {
    taskElement.classList.remove('checked');
  }

  countTasks();
  saveTasks();
}

editMenu.addEventListener('click', evt => {
  const taskId = editMenu.getAttribute('data-current-task-id'); // save current task ID

  if (evt.target.closest('#edit')) {
     // set edit mode and save task ID
    editingMode = true;
    editingTaskId = parseInt(taskId);
    // show task name in input field
    taskInput.value = tasks[taskId].name;
    taskInput.classList.add('editing');
    //taskInput.focus();
    editMenu.classList.remove('open'); // close menu
    overlay.classList.remove('open');
  } else if (evt.target.closest('#delete')) {
      tasks.splice(parseInt(taskId), 1); // Lösche den Task aus dem tasks Array
  
      const taskElement = document.querySelector(`#task-${taskId}`);
      taskElement.remove(); // Entferne nur den spezifischen Task aus dem DOM
  
      saveTasks();
      editMenu.classList.remove('open');
      overlay.classList.remove('open');
  }
  countTasks();
});

// close menu when clicked outside of it
document.addEventListener('click', evt => {
  if (!editMenu.contains(evt.target) && !evt.target.matches('.edit-btn')) {
    editMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
});

// reset form and show all tasks on page load
window.onload = () => {
  toDoForm.reset();
  console.log("window.onload triggered");
  if (tasks.length === 0) {
    countTasks();
  } else {
    tasks.forEach((task, id) => {
      addOrUpdateTask(task, id);
    });
  }
}
