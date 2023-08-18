'use strict';

const toDoForm = document.querySelector('#todo-form');
const taskInput = document.querySelector('#todo-input');
const toDoList = document.querySelector('#todo-list');
const toDoStatus = document.querySelector('#todo-status');
const completedTasks = document.querySelector('#completed-tasks');
const totalTasks = document.querySelector('#total-tasks');
const overlay = document.querySelector('#overlay');
const editMenu = document.querySelector('#edit-menu');
const mainMenu = document.querySelector('#main-menu');
const checkMenu = document.querySelector('#check-menu');
const sortMenu = document.querySelector('#sort-menu');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskId = null;

const updateDOM = () => {
  toDoList.innerHTML = '';
  tasks.forEach((task, id) => addOrUpdateTask(task, id));
}

const addOrUpdateTask = (task, id) => {
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
  localStorage.setItem('tasks', JSON.stringify(tasks));
  countTasks();
}

const countTasks = () => {
  const completedCount = tasks.filter(task => task.status === 'completed').length;

  toDoStatus.style.display = (tasks.length === 0) ? 'none' : 'block';
  completedTasks.innerText = completedCount;
  totalTasks.innerText = tasks.length;

  const progressPercent = tasks.length ? (completedCount / tasks.length) * 100 : 0;
  document.querySelector('.progress').style.width = `${progressPercent}%`;
}

toDoForm.addEventListener('submit', evt => {
  evt.preventDefault();
  if (!taskInput.value.trim()) {
    taskInput.classList.add('invalid-input');
    return;
  }

  if (editingTaskId !== null) {
    tasks[editingTaskId].name = taskInput.value; // update task name
  } else {
    tasks.push({
      name: taskInput.value,
      status: 'pending'
    });
  }

  saveTasks();
  updateDOM();

  // reset all
  editingTaskId = null;
  taskInput.classList.remove('invalid-input');
  taskInput.classList.remove('editing');
  toDoForm.reset();
});

toDoForm.addEventListener('input', () => {
  if (editingTaskId === null) {
    taskInput.classList.remove('invalid-input');
  }
});

toDoList.addEventListener('click', evt => {
  const taskId = evt.target.closest('li')?.getAttribute('data-task-id');
  if (!taskId) return;

  if (evt.target.matches('.edit-btn')) {
    editMenu.setAttribute('data-current-task-id', taskId);
    editMenu.classList.toggle('open'); // show edit menu
    overlay.classList.toggle('open');
  } else if (evt.target.matches('.checkbox')) {
    tasks[taskId].status = tasks[taskId].status === 'completed' ? 'pending' : 'completed';
    saveTasks();
    updateDOM();
  }
});

mainMenu.addEventListener('click', evt => {
  overlay.classList.toggle('open');

  if (evt.target.matches('.check-btn')) {
    checkMenu.classList.toggle('open'); // show check menu
    overlay.classList.toggle('open');
  } else if (evt.target.matches('.sort-btn')) {
    sortMenu.classList.toggle('open'); // show sort menu
    overlay.classList.toggle('open');
  }
});

editMenu.addEventListener('click', evt => {
  const taskId = parseInt(editMenu.getAttribute('data-current-task-id')); // save current task ID

  if (evt.target.closest('#edit')) {
    // set edit mode and save task ID
    editingTaskId = taskId;
    taskInput.value = tasks[taskId].name;
    taskInput.classList.add('editing');
    editMenu.classList.remove('open'); // close edit menu
    overlay.classList.remove('open');
    taskInput.focus();
  } else if (evt.target.closest('#delete')) {
    tasks.splice(taskId, 1); // remove task from task array
    saveTasks();
    updateDOM();
    editMenu.classList.remove('open'); // close edit menu
    overlay.classList.remove('open');
  }
});

// close edit menu when clicked outside of it
document.addEventListener('click', evt => {
  if (!mainMenu.contains(evt.target)) {
    checkMenu.classList.remove('open');
    sortMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
  if (!editMenu.contains(evt.target) && !evt.target.matches('.edit-btn')) {
    editMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
});

window.onload = () => {
  updateDOM();
  countTasks();
}
