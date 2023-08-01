'use strict';

const toDoForm = document.querySelector('#todo-form');
const toDoInput = document.querySelector('#todo-input');
const notice = document.querySelector('#notice');
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

  if(toDoInput.value) {
    notice.innerText = null;
    toDoInput.style.backgroundColor = 'var(--white)';

    const task = {
      id: new Date().getTime(),
      name: toDoInput.value,
      isCompleted: false
    }

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    createTask(task);

    toDoForm.reset();
    toDoInput.focus();

  } else {
    toDoInput.style.outline = '1px solid var(--red)';
    toDoInput.style.backgroundColor = 'var(--light-red)'
    toDoInput.focus();
  }
})

toDoList.addEventListener('input', evt => {
  const taskId = evt.target.closest('li').id;

  updateTask(taskId, evt.target);
})

toDoList.addEventListener('click', evt => {
  if(evt.target.classList.contains('edit-btn')) {
    const taskId = evt.target.closest('li').id;

    editMenu.classList.toggle('open');
    overlay.classList.toggle('open');

    removeLink.addEventListener('click', () => {
      editMenu.classList.remove('open');
      overlay.classList.remove('open');
      removeTask(taskId)
    });
    cancelLink.addEventListener('click', () => {
      editMenu.classList.remove('open');
      overlay.classList.remove('open');
    })
  }
})

toDoList.addEventListener('keydown', evt => {
  if(evt.keyCode === 13) {
    evt.preventDefault();
    evt.target.blur();
  }
})

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
    <button title="Open edit-menu" class="edit-btn">x</button>
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