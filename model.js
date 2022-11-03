//FileName:       model.js
//Programmer:     Shahbaj Sohal, Brian Huante Lopez, Will Bauer
//Date:           10/28/2022
//Purpose:		This file defines the code for our WebGL 2 model
//The "model" is all of the WebGL2 code that draws our graphics scene

//These variables can be accessed in any function
let gl;
let program;
let VAO, vertexPB;
let offsetX, offsetZ;
let globalAmbientLightLoc, lightColorLoc, lightPosLoc, constantAttenLoc, linearAttenLoc, quadraticAttenLoc;
let modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
let moveXAxis = 0;
let moveYAxis = 0;

//Given a canvas element, return the WebGL2 context
//This function is defined in section "Architecture Updates" of the textbook
function getGLContext(canvas) {
    return canvas.getContext('webgl2') || console.error('WebGL2 is not available in your browser.');
}

//Given an id, extract the content's of a shader script from the DOM and return the compiled shader
//This function is defined in section "Time for Action: Rendering a Square" of the textbook
function getShader(id) {
    const script = document.getElementById(id);
    const shaderString = script.text.trim();
   
    // Assign shader depending on the type of shader  
    let shader;  
    if (script.type === 'shader.vert') 
    {    
        shader = gl.createShader(gl.VERTEX_SHADER);
    }  
    else if (script.type === 'shader.frag') 
    {    
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }  
    else 
    {    
        return null;  
    }  
    // Compile the shader using the supplied shader code  
    gl.shaderSource(shader, shaderString);
    gl.compileShader(shader);
    // Ensure the shader is valid  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

//Create a program with the appropriate vertex and fragment shaders
//This function is defined in section "Time for Action: Rendering a Square" of the textbook
function initProgram()
{
    const vertexShader = getShader('vertex-shader');
    const fragmentShader = getShader('fragment-shader');

    // Create a program  
    program = gl.createProgram();

    // Attach the shaders to this program  
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('Could not initialize shaders');
    }
    // Use this program instance  
    gl.useProgram(program);
}

//Set up the buffers and VAO we need for rendering the objects for our scene
function initBuffers()
{
    //Vertex position data for the triangle (first three vertex positions) and point (last vertex position)
    const positions = [
        0.0, 1.0, 0.0, 
        -1.0, -1.0, 0.0,  
        1.0, -1.0, 0.0,

        0.0, 1.0, 0.0, 
        -1.0, -1.0, 0.0,  
        0, -0.5, -5.0,

        1.0, -1.0, 0.0, 
        -1.0, -1.0, 0.0,  
        0, -0.5, -5.0,

        1.0, -1.0, 0.0, 
        0.0, 1.0, 0.0,  
        0, -0.5, -5.0,

        1.0, -1.0, 0.0, 
        0.0, 1.0, 0.0,  
        0, -0.5, -5.0,

        -3, 1.0, -2.0, 
        3, 1.0, 0.0,  
        -3, 1.0, 0.0,

        3, 1.0, 0.0, 
        3, 1.0, -2.0,  
        -3, 1.0, -2.0,

        -3, 0.0, -2.0, 
        3, 0.0, 0.0,  
        -3, 0.0, 0.0,

        3, 0.0, 0.0, 
        3, 0.0, -2.0,  
        -3, 0.0, -2.0,

        0.0, 1.0, 0.0, 
        -1.0, -1.0, 0.0,  
        0, -0.5, 1.0,

        1.0, -1.0, 0.0, 
        -1.0, -1.0, 0.0,  
        0, -0.5, 1.0,

        1.0, -1.0, 0.0, 
        0.0, 1.0, 0.0,  
        0, -0.5, 1.0
        ];
    
    //Set up Vertex Array Object
    VAO = gl.createVertexArray(); 
    gl.bindVertexArray(VAO);

    //Set up the VBO for the pyramid vertex positions 
    vertexPB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPB);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0); //vertex position will be passed to the vertex shader in location 0

    //Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

//initialize the lights 
function initLights()
{
    //find uniform variable locations for the light
    globalAmbientLightLoc = gl.getUniformLocation(program, "globalAmbientLight");
    lightColorLoc = gl.getUniformLocation(program, "light_color");
    lightPosLoc = gl.getUniformLocation(program, "light_position");
    constantAttenLoc = gl.getUniformLocation(program, "constantAttenuation");
    linearAttenLoc = gl.getUniformLocation(program, "linearAttenuation");
    quadraticAttenLoc = gl.getUniformLocation(program, "quadraticAttenuation");

    //set up the light for the scene
    gl.uniform3f(globalAmbientLightLoc, 0.2, 0.2, 0.2);  //minimum light level in the scene
    gl.uniform4f(lightColorLoc, 1.0, 1.0, 1.0, 1.0);  //color of the light (in this case it is white)
    gl.uniform4f(lightPosLoc, 0.0, 6.0, 1.0, 1.0);  //positional light since w = 1
    gl.uniform1f(constantAttenLoc, 1.0); //these settings specify no light attenuation
    gl.uniform1f(linearAttenLoc, 0.0);
    gl.uniform1f(quadraticAttenLoc, 0.0);   
}

//We call drawModel to render to our canvas
function drawModel() 
{  
    //Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //Declare all of the matrices we will need for our transformations
    var mat4 = glMatrix.mat4;
    var projection_matrix = mat4.create();
    var view_matrix = mat4.create();
    var model_matrix = mat4.create();
    var scale_matrix = mat4.create();
    var translate_matrix = mat4.create();
    var rotate_x_matrix = mat4.create();
    var rotate_y_matrix = mat4.create();


    //bind the VAO for the triangle and point
    gl.bindVertexArray(VAO);

    //set shininess for the Phong Reflection Model
    gl.vertexAttrib1f(3, 1.0); //use a static vertex attribute (location == 3) to set shininess for all polygons to 1.0

    //all triangles and points will have the same normal vector, so we will set it once with a static vertex attribute
    gl.vertexAttrib3f(2, 0, 0, 1); //use a static vertex attribute (location == 2) to set the normal vector

    //THE FIRST EXAMPLE STARTS HERE
    //Set up the projection transformation matrix
    //projection_matrix = mat4.ortho(projection_matrix, -2.0, 2.0, -2.0, 2.0, 0.1, 20.0);
    //TODO 2: Comment out the line of code above and add the line of below to observe the effects of a perspective projection
    projection_matrix = mat4.frustum(projection_matrix, -0.1, 0.1, -0.1, 0.1, 0.1, 20.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projection_matrix); //send the projection matrix to the shaders

    //Set up the view orientation transformation matrix
    // var eye = [0.0, 0.0, offsetZ];
    // var aim = [0.0, 0.0, offsetZ - 0.1]; //set the aim a little down the negative z-axis in front of the eye
    var eye = [-6.0, 2.0, 7];
    var aim = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0];
    view_matrix = mat4.lookAt(view_matrix, eye, aim, up);  //calculate the view orientation matrix
    gl.uniformMatrix4fv(viewMatrixLoc, false, view_matrix); //send view matrix to the shaders

    //TODO 3: modify the size, orientation, and positions of the triangles using scale, rotate, and translate to build 
    //an appropriate model_matrix for each triangle. The matrix is sent to the shaders using gl.uniformMatrix4fv.
    //1) Position and draw the red triangle
    // var scale_amount = [0.1, 0.1, 0.1];
    // scale_matrix = mat4.scale(scale_matrix, mat4.identity(scale_matrix), scale_amount);
    // model_matrix = mat4.copy(model_matrix, scale_matrix);
    // gl.uniformMatrix4fv(modelMatrixLoc, false, model_matrix); //send scale matrix to the shaders
    // gl.vertexAttrib3f(1, 1, 0, 0); //use a static vertex attribute (location == 1) to set the color to red
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // //2) Position and draw the cyan triangle
    // var translate_vec = [offsetX + 1, 0.0, -2.5];
    // var scale_amount = [0.41, 0.41, 0.41];
    // scale_matrix = mat4.scale(scale_matrix, mat4.identity(scale_matrix), scale_amount);
    // translate_matrix = mat4.translate(translate_matrix, mat4.identity(translate_matrix), translate_vec);
    // model_matrix = mat4.multiply(model_matrix, translate_matrix, scale_matrix);
    // gl.uniformMatrix4fv(modelMatrixLoc, false, model_matrix); //send model matrix to the shaders
    // gl.vertexAttrib3f(1, 0, 1, 1); //use a static vertex attribute (location == 1) to set the color to cyan
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    //3) Position and draw the yellow triangle
    translate_vec = [0, 0.0, 0.0];
    translate_matrix = mat4.translate(translate_matrix, mat4.identity(translate_matrix), translate_vec);
    var rotate_x_axis = [1,0,0];
    rotate_x_matrix = mat4.rotate(rotate_x_matrix, translate_matrix, moveXAxis, rotate_x_axis); //NOTE: angle in radians
    var rotate_y_matrix = [0,1,0];
    rotate_y_matrix = mat4.rotate(rotate_y_matrix, translate_matrix, moveYAxis, rotate_y_matrix);

    //model_matrix = mat4.multiply(model_matrix, rotate_matrix, scale_matrix);
    model_matrix = mat4.multiply(model_matrix, rotate_x_matrix, rotate_y_matrix);
    //model_matrix = rotate_x_matrix;

    //model_matrix = rotate_y_matrix;
    //model_matrix = rotate_x_matrix;

    gl.uniformMatrix4fv(modelMatrixLoc, false, model_matrix); //send model matrix to the shaders
    gl.vertexAttrib3f(1, 1, 0, 0); //use a static vertex attribute (location == 1) to set the color to yellow
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 3, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 9);
    gl.drawArrays(gl.TRIANGLES, 9, 12);
    gl.drawArrays(gl.TRIANGLES, 12, 15);
    gl.drawArrays(gl.TRIANGLES, 15, 18);
    gl.drawArrays(gl.TRIANGLES, 18, 21);
    gl.drawArrays(gl.TRIANGLES, 21, 24);
    gl.drawArrays(gl.TRIANGLES, 24, 27);
    gl.drawArrays(gl.TRIANGLES, 27, 30);
    gl.drawArrays(gl.TRIANGLES, 30, 33);
}

//return the WebGL context to the caller
function initModel(view) {
    gl = getGLContext(view); 
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0.0, 0.0, view.width, view.height);
        //TODO 1: remove the comment from the line below to enable the depth test
        gl.enable(gl.DEPTH_TEST); //turn on the depth test

        initProgram(); //load the shaders

        //Find the locations of the matrices in the shaders
        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

        initBuffers();
        initLights();

        offsetX = 0.1;
        offsetZ = 0.5;

        return gl;
    }
    return null;
}

function updateOffsetX(offset) {
    offsetX = offsetX + offset;
}

function updateOffsetZ(offset) {
    offsetZ = offsetZ + offset;
}

function resetModel() {
    offsetX = 0.1;
    offsetZ = 0.5;
}