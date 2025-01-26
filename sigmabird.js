//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/ratio=408/228=17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipe
let pipeArray = [];
let pipeWidth = 64; // width/height ratio= 384/3072=1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX =-2; // pipe moving left
let velocityY = 0;
let gravity = 0.2;

let gameOver = false;
let score=0;
let record = localStorage.getItem("record")||0;

let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let bgm = new Audio("./sigma-boy.mp3");

bgm.loop=true;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // context.fillStyle = "green";
    // context.fillRect(bird.x,bird.y, bird.width, bird.height);

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src="./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src="./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes,1500); //every 1.5 second
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }
    context.clearRect(0,0, board.width, board.height);

    //bird
    velocityY+=gravity;
    bird.y+=velocityY;
    bird.y=Math.max(bird.y+velocityY,0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if(bird.y>board.height){
        gameOver=true;
    }

    //pipes
    for (let i = 0; i<pipeArray.length ; i++){
        let pipe = pipeArray[i];
        pipe.x+=velocityX;
        context.drawImage(pipe.img,pipe.x,pipe.y, pipe.width,pipe.height);
        
        if(!pipe.passed&&bird.x>pipe.x+pipe.width){
            score+=0.5;
            pipe.passed=true;
        }

        if(detectionCollision(bird,pipe)){
            // gameOver=true;
        }
    }

    //clear pipes
    while(pipeArray.length>0&&pipeArray[0].x<-pipeArray[0].width){
        pipeArray.shift();
    }


    //score
    context.fillStyle="white";
    context.font="45px sans-serif";
    context.fillText(score,5,45);

    if(gameOver){

        if(score>record){
            record=score;
            localStorage.setItem("record",record);
        }
        context.fillText("GAME OVER",5,90);
        context.fillText("Record: "+record,5,135);
        bgm.pause();
        bgm.currentTime=0;
    }
}

function placePipes() {
    if(gameOver){
        return ;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;


    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY+ pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe);
}

function moveBird(e){
    if(e.code=="Space"||e.code=="ArrowUp"){
        if(bgm.pause){
            bgm.play();
        }


        wingSound.play();

        //jump
        velocityY=-6;

        //reset game
        if(gameOver){
            bird.y=birdY;
            pipeArray=[];
            score=0;
            gameOver=false;
        }
    }


}

function detectionCollision(a,b){
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y+b.height &&
        a.y + a.height > b.y;

}

