import app from "./index.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";

const db = getFirestore(app);

const taskform = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDesc = document.getElementById("task-description");
const taskCard = document.getElementById("task-card");

let editStatus = false;
let id = " ";

const saveTask = (title, description) =>
  addDoc(collection(db, "tasks"), {
    title,
    description
  });

taskform.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = taskTitle.value;
  const description = taskDesc.value;
  console.log(title, description);

  if (!editStatus) {
    await saveTask(title, description);
  } else {
    await updateTask(id, {
      title: title,
      description: description
    });

    editStatus = false;
    id = " ";
    taskform["btn-task-form"].innerText = "Save";
  }

  await getTasks();

  taskform.reset();
  taskTitle.focus();
});

const getTasks = () => getDocs(collection(db, "tasks"));
const onGetTasks = (callback) => onSnapshot(collection(db, "tasks"), callback);
const deleteTask = (id) => deleteDoc(doc(db, "tasks", id));
const getTask = (id) => getDoc(doc(db, "tasks", id));
const updateTask = (id, updateTask) =>
  updateDoc(doc(db, "tasks", id), updateTask);

window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTasks((querySnapshot) => {
    taskCard.innerHTML = " ";
    querySnapshot.forEach((doc) => {
      console.log(doc.data());

      const task = doc.data();
      task.id = doc.id;

      taskCard.innerHTML += `<div class="card card-body mt-2 border-primary">
    <h3 class="h5">${task.title}</h3>
    <p>${task.description}</p>
    <div>
      <button class="btn btn-primary btn-delete" data-id="${task.id}"> Delete
      </button>
      <button class="btn btn-secondary btn-edit" data-id="${task.id}"> Edit
      </button>
    </div>
  </div>`;
    });

    const btnsDelete = taskCard.querySelectorAll(".btn-delete");
    btnsDelete.forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        console.log(e.target.dataset.id);
        try {
          await deleteTask(e.target.dataset.id);
        } catch (error) {
          console.log(error);
        }
      })
    );

    const btnsEdit = taskCard.querySelectorAll(".btn-edit");
    btnsEdit.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        try {
          const doc = await getTask(e.target.dataset.id);
          const task = doc.data();
          taskform["task-title"].value = task.title;
          taskform["task-description"].value = task.description;

          editStatus = true;
          id = doc.id;
          taskform["btn-task-form"].innerText = "Update";
        } catch (error) {
          console.log(error);
        }
      });
    });
  });
});
