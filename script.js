"use strict";

const inputAddTask = document.querySelector("#input-field");
const btnAddTask = document.querySelector("#add-btn");
const toDoList = document.querySelector("#list");

btnAddTask.addEventListener("click", () => {
  if(inputAddTask.value) {
    console.log(inputAddTask.value);
  }
})