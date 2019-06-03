// Function to check if the teacher button is checked or not
function teacherCheck() {
  if ($("#teacher-button").prop('checked') === true) {
    // Show all fields within the #teacher-fields div, and set to required
    $('#teacher-fields').children().show();
    // $('#teacher-fields').children('input').prop('required',true);
  } else {
    // Hide and set to not required
    $('#teacher-fields').children().hide();
    $('#teacher-fields').children('input').prop('required',false);
  }
}

// When the document loads
$(document).ready(function () {
  teacherCheck();
});

// When either the teacher or student button is clicked
$(".button").click(function () {
  teacherCheck();
});
