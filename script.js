const firebaseConfig = {
  apiKey: "AIzaSyABGvy_eSXl-u7X23mW2U37AZKoG7pbyrw",
  authDomain: "webfinal-e8559.firebaseapp.com",
  projectId: "webfinal-e8559",
  storageBucket: "webfinal-e8559.firebasestorage.app",
  messagingSenderId: "898397761587",
  appId: "1:898397761587:web:93eb482c0ab7297280f346"
};

// Initialize Firebase using the Compat SDK
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Load tasks from Firestore collection ordered by creation timestamp
async function loadTasks() {
  try {
    const snapshot = await db.collection("tasks").orderBy("createdAt", "asc").get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return tasks;
  } catch (error) {
    throw error;
  }
}

// Add a new task document to the Firestore collection
async function addTask(taskText, selectedDay) {
  try {
    await db.collection("tasks").add({
      text: taskText,
      day: selectedDay,
      done: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
}

// Toggle 'done' status for a task in Firestore
async function toggleTaskDone(taskId, doneStatus) {
  try {
    await db.collection("tasks").doc(taskId).update({
      done: doneStatus
    });
  } catch (error) {
    throw error;
  }
}

// Delete a task document from Firestore
async function deleteTask(taskId) {
  try {
    await db.collection("tasks").doc(taskId).delete();
  } catch (error) {
    throw error;
  }
}

// Clear UI containers and render tasks into their respective days
async function renderTasks() {
  $(".tasks").empty();

  const tasks = await loadTasks();

  tasks.forEach(function (task) {
    const taskElement = $("<div>", {
      class: task.done ? "task done" : "task",
      "data-id": task.id,
    });

    $("<span>").text(task.text).appendTo(taskElement);

    const buttonGroup = $("<div>");

    $("<button>", {
      class: "done-btn",
      text: "Done",
    }).appendTo(buttonGroup);

    $("<button>", {
      class: "delete-btn",
      text: "Delete",
    }).appendTo(buttonGroup);

    buttonGroup.appendTo(taskElement);
    $("#" + task.day + " .tasks").append(taskElement);
  });
}

// Show current date using Date object
document.getElementById("todayText").innerHTML =
  "Today is: " + new Date().toDateString();


// jQuery initialization logic
$(document).ready(function () {
  
  // --- Dark Mode Logic ---
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    $("body").addClass("dark-mode");
    $("#darkModeToggle").text("☀️ Light Mode");
  }

  $("#darkModeToggle").click(function () {
    $("body").toggleClass("dark-mode");
    
    if ($("body").hasClass("dark-mode")) {
      localStorage.setItem("theme", "dark");
      $(this).text("☀️ Light Mode");
    } else {
      localStorage.setItem("theme", "light");
      $(this).text("🌙 Dark Mode");
    }
  });

  // Initial Fetch Call
  renderTasks().catch(function (err) {
    console.error(err);
    alert("Could not load shared tasks from Firebase. Check your database setup/rules!");
  });

  // Add task button click listener
  $("#addBtn").click(function () {
    let taskText = $("#taskInput").val();
    let selectedDay = $("#daySelect").val();

    if (taskText === "") {
      window.alert("Please write a task first.");
      return;
    }

    addTask(taskText, selectedDay)
      .then(renderTasks)
      .catch(function (err) {
        console.error(err);
        window.alert("Could not save the task to Firebase.");
      });

    $("#taskInput").val("");
  });

  // Complete/Done button event delegation
  $(document).on("click", ".done-btn", function () {
    const taskElement = $(this).closest(".task");
    const taskId = taskElement.data("id");
    const isDone = taskElement.hasClass("done");

    toggleTaskDone(taskId, !isDone)
      .then(renderTasks)
      .catch(function (err) {
        console.error(err);
        window.alert("Could not update the task in Firebase.");
      });
  });

  // Delete button event delegation
  $(document).on("click", ".delete-btn", function () {
    const taskId = $(this).closest(".task").data("id");

    deleteTask(taskId)
      .then(renderTasks)
      .catch(function (err) {
        console.error(err);
        window.alert("Could not delete the task from Firebase.");
      });
  });

});
