//FileName:       controller.js
//Programmer:     Shahbaj Sohal, Brian Huante Lopez, Wil Bauer
//Date:           11/2/2022
//Purpose:        This file defines the code for our controller
//The "controller" runs the program and handles events.

let model;
let view; //the "view" is our Canvas
let timer; //used for Task 3 in the lab
let spinning;

function checkKey(event) {
    switch (event.keyCode) {
        //left arrow key was pressed (37 in ASCII)
        case 37: {
            updateOffsetX(-0.1); //defined in model.js
            moveYAxis = moveYAxis - .1;
            break;
        }

        //up arrow key was pressed (38 in ASCII)
        case 38: {
            updateOffsetZ(-0.1); //defined in model.js
            moveXAxis = moveXAxis + .1;
            break;
        }

        //right arrow key was pressed (39 in ASCII)
        case 39: {
            updateOffsetX(0.1); //defined in model.js
            moveYAxis = moveYAxis + .1;
            break;
        }

        //down arrow key was pressed (40 in ASCII)
        case 40: {
            updateOffsetZ(0.1); //defined in model.js
            moveXAxis = moveXAxis - .1;

            break;
        }

        // Space bar stops and resumes spinning of the propeller
        case 32: {
            if (spinning) {
            clearInterval(timer);
            spinning = false;
            }
            else {
            timer = setInterval(spin, 10);
            spinning = true;
            }
            break;
        }

        //ESC key was pressed
        case 27: {
            resetModel(); //defined in model.js
        }
    }
    //redraw the scene so that we can see changes
    drawModel(); //defined in model.js
}

function controller() {
    //set up the view and the model
    view = initView();  //initView is defined in view.js
    model = initModel(view); //initModel is defined in model.js

    if (model) //make sure everything got initialized before proceeding
    {
        drawModel(); // defined in model.js
        spinning = true;
        timer = setInterval(spin, 10);
        window.onkeydown = checkKey; //call checkKey whenever a key is pressed
    }
    else
    {
        alert('Could not initialize the view and model');
    }
}

function spin() {
    updateSpin(5);
    drawModel();
}