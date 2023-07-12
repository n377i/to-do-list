"use strict";

const inputAddTask = document.querySelector("#input-field");
const btnAddTask = document.querySelector("#add-btn");
const notice = document.querySelector("#notice");
const toDoList = document.querySelector("#list");

btnAddTask.addEventListener("click", () => {
  if(inputAddTask.value) {
    notice.innerText = null;
    inputAddTask.style.backgroundColor = "var(--grey)";
    console.log(inputAddTask.value);
  } else {
    inputAddTask.style.backgroundColor = "var(--light-red)";
    notice.innerText = "Please enter task first.";
  }
})