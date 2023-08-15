'use strict';

const toDoForm = document.querySelector('#todo-form');
const taskInput = document.querySelector('#todo-input');
const toDoList = document.querySelector('#todo-list');
const completedTasks = document.querySelector('#completed-tasks');
const totalTasks = document.querySelector('#total-tasks');
const overlay = document.querySelector('#overlay');
const editMenu = document.querySelector('#edit-menu');

let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // get tasks from local storage or pass an empty array
let editingMode = false;
let editingTaskId = null;

toDoForm.addEventListener('submit', evt => {
  evt.preventDefault();
  taskInput.style.backgroundColor = 'var(--white)';
  taskInput.style.outline = 'none';

  if (taskInput.value.trim()) {
    if (editingMode && editingTaskId !== null) {
      // update task name and reset mode
      tasks[editingTaskId].name = taskInput.value;
      editingMode = false;
      editingTaskId = null;
    } else {
      const taskInfo = {
        name: taskInput.value,
        status: 'pending'
      }
      tasks.push(taskInfo);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    createTask();
    toDoForm.reset();
    taskInput.focus();
  } else {
    taskInput.style.outline = '1px solid var(--red)';
    taskInput.style.backgroundColor = 'var(--light-red)';
    taskInput.focus();
  }
});

const createTask = () => {
  let li = '';
  if (tasks) {
    tasks.forEach((task, id) => {
      const checked = task.status === 'completed' ? 'checked' : '';
      li += `
          <li class="${checked}">
              <label for="${id}">
                  <input type="checkbox" id="${id}" class="checkbox" ${checked}>
                  <p>${task.name}</p>
              </label>
              <img class="edit-btn" data-task-id="${id}" src="img/icon_edit-menu.svg" alt="edit menu">
          </li>
          `;
    });
  }
  toDoList.innerHTML = li;

  countTasks();
}

const updateStatus = (id) => {
  tasks[id].status = tasks[id].status === 'completed' ? 'pending' : 'completed';
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // update class of list element
  const liElement = document.querySelector(`li:nth-child(${id + 1})`);
  if (tasks[id].status === 'completed') {
    liElement.classList.add('checked');
  } else {
    liElement.classList.remove('checked');
  }

  countTasks();
}

// event delegation for checkboxes
toDoList.addEventListener('change', (evt) => {
  if (evt.target.matches('.checkbox')) {
    const taskId = parseInt(evt.target.id);
    updateStatus(taskId);
  }
});

toDoList.addEventListener('click', (evt) => {
  if (evt.target.matches('.edit-btn')) {
    const taskId = evt.target.getAttribute('data-task-id');
    showEditMenu(taskId);
  }
});

const showEditMenu = (taskId) => {
  editMenu.setAttribute('data-current-task-id', taskId); // save current task ID
  editMenu.classList.toggle('open'); // show menu
  overlay.classList.toggle('open');
}

editMenu.addEventListener('click', (evt) => {
  const taskId = editMenu.getAttribute('data-current-task-id');

  if (evt.target.closest('#edit')) {
    // set edit mode and save task ID
    editingMode = true;
    editingTaskId = parseInt(taskId);

    // show task name in input field
    taskInput.value = tasks[taskId].name;
    taskInput.style.outline = 'none';
    taskInput.style.backgroundColor = 'var(--light-green)';
    taskInput.focus();
    editMenu.classList.remove('open'); // close menu
    overlay.classList.remove('open');
  } else if (evt.target.closest('#delete')) {
    // delete-logic
    tasks.splice(taskId, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    createTask();
    editMenu.classList.remove('open'); // close menu
    overlay.classList.remove('open');
    // close menu when "Cancel" is clicked
  } else if (evt.target.closest('#cancel')) { 
    editMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
});

// close menu when clicked outside of it
document.addEventListener('click', (evt) => {
  if (!editMenu.contains(evt.target) && !evt.target.matches('.edit-btn')) {
    editMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
});

const countTasks = () => {
  const completedTasksArr = tasks.filter(task =>
    task.status === 'completed'
  );
  completedTasks.innerText = completedTasksArr.length;
  totalTasks.innerText = tasks.length;

  const progressPercent = (completedTasksArr.length / tasks.length) * 100;
  const progressBar = document.querySelector('.progress');
  progressBar.style.width = `${progressPercent}%`;
}

// display tasks when the page loads
createTask();
