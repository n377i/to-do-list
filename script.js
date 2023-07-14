'use strict';

const toDoForm = document.querySelector('#todo-form');
const toDoInput = document.querySelector('#todo-form input');
const btnAddTask = document.querySelector('#add-btn');
const btnRemoveTask = document.querySelector('#remove-btn');
const notice = document.querySelector('#notice');
const toDoList = document.querySelector('#todo-list');
const completedTasks = document.querySelector('#completed-tasks');
const totalTasks = document.querySelector('#total-tasks');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

toDoForm.addEventListener('submit', evt => {
  evt.preventDefault();

  if(toDoInput.value) {
    notice.innerText = null;
    toDoInput.style.backgroundColor = 'var(--grey)';

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
    toDoInput.style.backgroundColor = 'var(--light-red)';
    notice.innerText = 'Please enter task first.';
    toDoInput.focus();
  }
})

toDoList.addEventListener('input', evt => {
  const taskId = evt.target.closest('li').id;

  updateTask(taskId, evt.target);
})

toDoList.addEventListener('click', evt => {
  if(evt.target.classList.contains('remove-btn')) {
    const taskId = evt.target.closest('li').id;

    removeTask(taskId);
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
    <button title="Remove task" class="remove-btn">x</button>
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

  document.getElementById(taskId).remove();
  countTasks();
}

const countTasks = () => {
  const completedTasksArr = tasks.filter(task => 
    task.isCompleted === true
  );
    completedTasks.innerText = completedTasksArr.length;
    totalTasks.innerText = tasks.length;
}

if(localStorage.getItem('tasks')) {
  tasks.map(task => {
    createTask(task);
  })
}