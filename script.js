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
// convert date string back to date object
tasks.forEach(task => {
  if (task.date && typeof task.date === 'string') {
      task.date = new Date(task.date);
  }
});
let editingTaskId = null;
let sortable = new Sortable(toDoList, {
  animation: 150,
  sort: false // not sortable by default
});

const updateDOM = () => {
  toDoList.innerHTML = '';
  tasks.forEach((task, id) => addOrUpdateTask(task, id));
}

const addOrUpdateTask = (task, id) => {
  const existingTask = toDoList.querySelector(`#task-${id}`);
  const checked = task.status === 'completed' ? 'checked' : '';
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
    existingTask.outerHTML = li;
  } else {
    toDoList.insertAdjacentHTML('beforeend', li);
  }
}

const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  countTasks();
  localStorage.setItem('tasks', JSON.stringify(tasks));
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

  if (editingTaskId !== null) {
      const task = tasks.find(t => t.id == editingTaskId);
      if (task) {
          task.name = taskInput.value;
          editingTaskId = null; // reset to ensure that a new task is added next time
      }
  } else {
    tasks.push({
      id: new Date().getTime(),
      name: taskInput.value,
      date: new Date().toISOString(), // convert date to string to be able to save it in local storage
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

  const task = tasks.find(t => t.id == taskId); // search task object by ID

  if (!task) return;

  if (evt.target.matches('.edit-btn')) {
    editMenu.setAttribute('data-current-task-id', taskId);
    editMenu.classList.toggle('open'); // show edit menu
    overlay.classList.toggle('open');
  } else if (evt.target.matches('.checkbox')) {
    task.status = task.status === 'completed' ? 'pending' : 'completed'; // update status of found task object
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

checkMenu.addEventListener('click', evt => {
  if (evt.target.closest('#check-all')) {
    tasks.forEach(task => {
      task.status = 'completed'; // set all tasks to completed
    });
    updateDOM();
  } else if (evt.target.closest('#uncheck-all')) {
    tasks.forEach(task => {
      task.status = 'pending'; // set all tasks to pending
    });
    updateDOM(); 
  } else if (evt.target.closest('#delete-checked')) {
    tasks = tasks.filter(task => task.status !== 'completed'); // remove all completed tasks
    updateDOM();
  } else if (evt.target.closest('#delete-unchecked')) {
    tasks = tasks.filter(task => task.status !== 'pending'); // remove all pending tasks
    updateDOM();
  }

  saveTasks();
  countTasks();
  
  checkMenu.classList.remove('open'); // close sort menu
  overlay.classList.remove('open');
});

sortMenu.addEventListener('click', evt => {
  if (evt.target.closest('#sort-manually')) {
    sortable.option("sort", true);
  } else if (evt.target.closest('#sort-alphabetically')) {
      tasks.sort((a, b) => {
          if (a.name < b.name) {
              return -1;
          }
          if (a.name > b.name) {
              return 1;
          }
          return 0;
      });
    } else if (evt.target.closest('#date-ascending')) {
      tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else if (evt.target.closest('#date-descending')) {
      tasks.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    updateDOM();
    saveTasks();
    sortMenu.classList.remove('open');
    overlay.classList.remove('open');
});


editMenu.addEventListener('click', evt => {
  const taskId = parseInt(editMenu.getAttribute('data-current-task-id'));

  if (evt.target.closest('#edit')) {
    editingTaskId = taskId;
    const task = tasks.find(t => t.id == taskId); // search task object by ID

    if (task) {
      taskInput.value = task.name;
      taskInput.classList.add('editing');
      editMenu.classList.remove('open'); // close edit menu
      overlay.classList.remove('open');
      taskInput.focus();
    }
  } else if (evt.target.closest('#delete')) {
    tasks = tasks.filter(t => t.id != taskId); // remove task based on ID
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

document.addEventListener('mousedown', function(evt) {
  if (!toDoList.contains(evt.target) && sortable.option("sort")) {
    sortable.option("sort", false);
  }
});

window.onload = () => {
  updateDOM();
  countTasks();
}
