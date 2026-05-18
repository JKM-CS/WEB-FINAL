// Show current date using Date object
document.getElementById("todayText").innerHTML =
  "Today is: " + new Date().toDateString();


// jQuery document ready
$(document).ready(function () {

  // Add task button event
  $("#addBtn").click(function () {

    let taskText = $("#taskInput").val();
    let selectedDay = $("#daySelect").val();

    if (taskText === "") {
      window.alert("Please write a task first.");
      return;
    }

    let taskCode =
      "<div class='task'>" +
        "<span>" + taskText + "</span>" +
        "<div>" +
          "<button class='done-btn'>Done</button>" +
          "<button class='delete-btn'>Delete</button>" +
        "</div>" +
      "</div>";

    $("#" + selectedDay + " .tasks").append(taskCode);

    $("#taskInput").val("");

    $(".task").hide().fadeIn(500);
  });


  // When Done button is clicked, change task color
  $(document).on("click", ".done-btn", function () {
    $(this).closest(".task").toggleClass("done");
  });


  // Delete task
  $(document).on("click", ".delete-btn", function () {
    $(this).closest(".task").fadeOut(500, function () {
      $(this).remove();
    });
  });


  // When mouse enters a day card
  $(".day-card").mouseenter(function () {
    $(this).css("background-color", "#f8fafc");
  });


  // When mouse leaves a day card
  $(".day-card").mouseleave(function () {
    $(this).css("background-color", "white");
  });

});