'use strict';

const toDoForm = document.querySelector('#todo-form');
const taskInput = document.querySelector('#todo-input');
const toDoList = document.querySelector('#todo-list');
const completedTasks = document.querySelector('#completed-tasks');
const totalTasks = document.querySelector('#total-tasks');
const overlay = document.querySelector('#overlay');
const editMenu = document.querySelector('#edit-menu');
const removeLink = document.querySelector('#remove');
const cancelLink = document.querySelector('#cancel');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

toDoForm.addEventListener('submit', evt => {
  evt.preventDefault();

  if(taskInput.value) {
    taskInput.style.backgroundColor = 'var(--white)';
    taskInput.style.outline = 'none';

    const task = {
      id: new Date().getTime(),
      name: taskInput.value,
      isCompleted: false
    }

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    createTask(task);

    toDoForm.reset();
    taskInput.focus();

  } else {
    taskInput.style.outline = '1px solid var(--red)';
    taskInput.style.backgroundColor = 'var(--light-red)'
    taskInput.focus();
  }
})

toDoList.addEventListener('input', evt => {
  const taskId = evt.target.closest('li').id;

  updateTask(taskId, evt.target);
})

toDoList.addEventListener('keydown', evt => {
  if(evt.keyCode === 13) {
    evt.preventDefault();
    evt.target.blur();
  }
})

toDoList.addEventListener('click', evt => {
if(evt.target.classList.contains('edit-btn')) {
  const taskId = evt.target.closest('li').id;

  removeLink.dataset.taskId = taskId;
  cancelLink.dataset.taskId = taskId;

  editMenu.classList.toggle('open');
  overlay.classList.toggle('open');
}
});

editMenu.addEventListener('click', evt => {
  const taskId = evt.target.dataset.taskId;
  if (evt.target === removeLink) {
      editMenu.classList.remove('open');
      overlay.classList.remove('open');
      removeTask(taskId);
  } else if (evt.target === cancelLink) {
      editMenu.classList.remove('open');
      overlay.classList.remove('open');
  }
});

const createTask = task => {
  const listItem = document.createElement('li');
  listItem.setAttribute('id', task.id);

  if(task.isCompleted) {
    listItem.classList.add('completed');
  }

  const listItemMarkup = `
    <div>
      <input type="checkbox" id="${task.id}" class="checkbox" ${task.isCompleted ? 'checked' : ''}>
        <label ${!task.isCompleted ? 'contenteditable' : ''}>${task.name}</label>
    </div>
    <img class="edit-btn" src="img/icon_edit-menu.svg" alt="edit menu">
  `;
  listItem.innerHTML = listItemMarkup;
  toDoList.appendChild(listItem);

  countTasks();
}

const updateTask = (taskId, el) => {
  const task = tasks.find(task =>
    task.id === parseInt(taskId)
  );

  if(el.hasAttribute('contenteditable')) {
    task.name = el.innerText;
  } else {
    const span = el.nextElementSibling;
    const parent = el.closest('li');

    task.isCompleted = !task.isCompleted;

    if(task.isCompleted) {
      span.removeAttribute('contenteditable');
      parent.classList.add('completed');
    } else {
      span.setAttribute('contenteditable', 'true');
      parent.classList.remove('completed');
    }
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));

  countTasks();
}

const removeTask = taskId => {
  tasks = tasks.filter(task =>
    task.id !== parseInt(taskId)
  );

  localStorage.setItem('tasks', JSON.stringify(tasks));

  if(taskId !== null) {
    document.getElementById(taskId).remove();
    countTasks();
  }
}

const countTasks = () => {
  const completedTasksArr = tasks.filter(task => 
    task.isCompleted === true
  );
    completedTasks.innerText = completedTasksArr.length;
    totalTasks.innerText = tasks.length;

    const progressPercent = (completedTasksArr.length / tasks.length) * 100;
    const progressBar = document.querySelector('.progress');
    progressBar.style.width = `${progressPercent}%`;
}

if(localStorage.getItem('tasks')) {
  tasks.map(task => {
    createTask(task);
  })
}