(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(156,217,249,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(156,217,249,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
})();




<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>


// Array of all the questions and choices to populate the questions. This might be saved in some JSON file or a database and we would have to read the data in.
var all_questions = [{
    question_string: "What color is the sky?",
    choices: {
      correct: "Blue",
      wrong: ["Pink", "Orange", "Green"]
    }
  }, {
    question_string: "Which of the following elements aren’t introduced in HTML5?",
    choices: {
      correct: "<input>",
      wrong: ["<article>", "<footer>", "<hgroup>"]
    }
  }, {
    question_string: "How many wheels are there on a tricycle?",
    choices: {
      correct: "Three",
      wrong: ["One", "Two", "Four"]
    }
  }, {
    question_string: 'Who is the main character of Harry Potter?',
    choices: {
      correct: "Harry Potter",
      wrong: ["Hermione Granger", "Ron Weasley", "Voldemort"]
    }
  }];
  
  // An object for a Quiz, which will contain Question objects.
  var Quiz = function(quiz_name) {
    // Private fields for an instance of a Quiz object.
    this.quiz_name = quiz_name;
    
    // This one will contain an array of Question objects in the order that the questions will be presented.
    this.questions = [];
  }
  
  // A function that you can enact on an instance of a quiz object. This function is called add_question() and takes in a Question object which it will add to the questions field.
  Quiz.prototype.add_question = function(question) {
    // Randomly choose where to add question
    var index_to_add_question = Math.floor(Math.random() * this.questions.length);
    this.questions.splice(index_to_add_question, 0, question);
  }
  
  // A function that you can enact on an instance of a quiz object. This function is called render() and takes in a variable called the container, which is the <div> that I will render the quiz in.
  Quiz.prototype.render = function(container) {
    // For when we're out of scope
    var self = this;
    
    // Hide the quiz results modal
    $('#quiz-results').hide();
    
    // Write the name of the quiz
    $('#quiz-name').text(this.quiz_name);
    
    // Create a container for questions
    var question_container = $('<div>').attr('id', 'question').insertAfter('#quiz-name');
    
    // Helper function for changing the question and updating the buttons
    function change_question() {
      self.questions[current_question_index].render(question_container);
      $('#prev-question-button').prop('disabled', current_question_index === 0);
      $('#next-question-button').prop('disabled', current_question_index === self.questions.length - 1);
     
      
      // Determine if all questions have been answered
      var all_questions_answered = true;
      for (var i = 0; i < self.questions.length; i++) {
        if (self.questions[i].user_choice_index === null) {
          all_questions_answered = false;
          break;
        }
      }
      $('#submit-button').prop('disabled', !all_questions_answered);
    }
    
    // Render the first question
    var current_question_index = 0;
    change_question();
    
    // Add listener for the previous question button
    $('#prev-question-button').click(function() {
      if (current_question_index > 0) {
        current_question_index--;
        change_question();
      }
    });
    
    // Add listener for the next question button
    $('#next-question-button').click(function() {
      if (current_question_index < self.questions.length - 1) {
        current_question_index++;
        change_question();
      }
    });
   
    // Add listener for the submit answers button
    $('#submit-button').click(function() {
      // Determine how many questions the user got right
      var score = 0;
      for (var i = 0; i < self.questions.length; i++) {
        if (self.questions[i].user_choice_index === self.questions[i].correct_choice_index) {
          score++;
        }
        
     $('#quiz-retry-button').click(function(reset) {
        quiz.render(quiz_container);
     });
      
      }
      
     
      
      // Display the score with the appropriate message
      var percentage = score / self.questions.length;
      console.log(percentage);
      var message;
      if (percentage === 1) {
        message = 'Great job!'
      } else if (percentage >= .75) {
        message = 'You did alright.'
      } else if (percentage >= .5) {
        message = 'Better luck next time.'
      } else {
        message = 'Maybe you should try a little harder.'
      }
      $('#quiz-results-message').text(message);
      $('#quiz-results-score').html('You got <b>' + score + '/' + self.questions.length + '</b> questions correct.');
      $('#quiz-results').slideDown();
      $('#submit-button').slideUp();
      $('#next-question-button').slideUp();
      $('#prev-question-button').slideUp();
      $('#quiz-retry-button').sideDown();
      
    });
    
    // Add a listener on the questions container to listen for user select changes. This is for determining whether we can submit answers or not.
    question_container.bind('user-select-change', function() {
      var all_questions_answered = true;
      for (var i = 0; i < self.questions.length; i++) {
        if (self.questions[i].user_choice_index === null) {
          all_questions_answered = false;
          break;
        }
      }
      $('#submit-button').prop('disabled', !all_questions_answered);
    });
  }
  
  // An object for a Question, which contains the question, the correct choice, and wrong choices. This block is the constructor.
  var Question = function(question_string, correct_choice, wrong_choices) {
    // Private fields for an instance of a Question object.
    this.question_string = question_string;
    this.choices = [];
    this.user_choice_index = null; // Index of the user's choice selection
    
    // Random assign the correct choice an index
    this.correct_choice_index = Math.floor(Math.random(0, wrong_choices.length + 1));
    
    // Fill in this.choices with the choices
    var number_of_choices = wrong_choices.length + 1;
    for (var i = 0; i < number_of_choices; i++) {
      if (i === this.correct_choice_index) {
        this.choices[i] = correct_choice;
      } else {
        // Randomly pick a wrong choice to put in this index
        var wrong_choice_index = Math.floor(Math.random(0, wrong_choices.length));
        this.choices[i] = wrong_choices[wrong_choice_index];
        
        // Remove the wrong choice from the wrong choice array so that we don't pick it again
        wrong_choices.splice(wrong_choice_index, 1);
      }
    }
  }
  
  // A function that you can enact on an instance of a question object. This function is called render() and takes in a variable called the container, which is the <div> that I will render the question in. This question will "return" with the score when the question has been answered.
  Question.prototype.render = function(container) {
    // For when we're out of scope
    var self = this;
    
    // Fill out the question label
    var question_string_h2;
    if (container.children('h2').length === 0) {
      question_string_h2 = $('<h2>').appendTo(container);
    } else {
      question_string_h2 = container.children('h2').first();
    }
    question_string_h2.text(this.question_string);
    
    // Clear any radio buttons and create new ones
    if (container.children('input[type=radio]').length > 0) {
      container.children('input[type=radio]').each(function() {
        var radio_button_id = $(this).attr('id');
        $(this).remove();
        container.children('label[for=' + radio_button_id + ']').remove();
      });
    }
    for (var i = 0; i < this.choices.length; i++) {
      // Create the radio button
      var choice_radio_button = $('<input>')
        .attr('id', 'choices-' + i)
        .attr('type', 'radio')
        .attr('name', 'choices')
        .attr('value', 'choices-' + i)
        .attr('checked', i === this.user_choice_index)
        .appendTo(container);
      
      // Create the label
      var choice_label = $('<label>')
        .text(this.choices[i])
        .attr('for', 'choices-' + i)
        .appendTo(container);
    }
    
    // Add a listener for the radio button to change which one the user has clicked on
    $('input[name=choices]').change(function(index) {
      var selected_radio_button_value = $('input[name=choices]:checked').val();
      
      // Change the user choice index
      self.user_choice_index = parseInt(selected_radio_button_value.substr(selected_radio_button_value.length - 1, 1));
      
      // Trigger a user-select-change
      container.trigger('user-select-change');
    });
  }
  
  // "Main method" which will create all the objects and render the Quiz.
  $(document).ready(function() {
    // Create an instance of the Quiz object
    var quiz = new Quiz('My Quiz');
    
    // Create Question objects from all_questions and add them to the Quiz object
    for (var i = 0; i < all_questions.length; i++) {
      // Create a new Question object
      var question = new Question(all_questions[i].question_string, all_questions[i].choices.correct, all_questions[i].choices.wrong);
      
      // Add the question to the instance of the Quiz object that we created previously
      quiz.add_question(question);
    }
    
    // Render the quiz
    var quiz_container = $('#quiz');
    quiz.render(quiz_container);
  });