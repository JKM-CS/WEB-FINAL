// TODO: Replace the config properties below with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp() // Sets a reliable server timestamp
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
  // Safety guard check for unconfigured Firebase setups
  if (firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
    alert("Set your Firebase configurations in script.js before using the shared planner.");
    return;
  }

  renderTasks().catch(function (err) {
    console.error(err);
    alert("Could not load shared tasks from Firebase.");
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


  // UI Effect: Hover color overrides
  $(".day-card").mouseenter(function () {
    $(this).css("background-color", "#f8fafc");
  });

  $(".day-card").mouseleave(function () {
    $(this).css("background-color", "white");
  });

});
