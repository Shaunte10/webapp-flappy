// the Game object used by the phaser.io library
var stateActions = {preload: preload, create: create, update: update};
// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);
var score;
score = 0;
var firstTime;
var labelScore;
var player;
var pipes = [];
var dollars = [];
var labelOpen;
var gameGravity;
var gameStarted = false;


jQuery("#greeting-form").on("submit", function (event_details) {
    var greeting = "Congratulations ";
    var name = jQuery("#fullName").val();
    console.log("name" + name);
    if (isEmpty(name)) {
        event_details.preventDefault();
        alert("Please type in your name.")
    } else {
        var email = jQuery("#email").val();
        var score = jQuery("#score").val();
        var greeting_message = greeting + name + ". Your score is " + score + ".";
        jQuery("#greeting-form").hide();
        jQuery("#greeting").append("<p>" + greeting_message + "</p>");
        $("#greeting").hide();
        alert(greeting_message + " It has been added to the Scoreboard! Are you in the top 3?");
    }
});
/*
 * Loads all resources for the game and gives them names.
 */

function preload() {
    game.load.image("backgroundImg", "../assets/nycback.jpg");
    game.load.audio("score", "../assets/noise.mp3");
    game.load.image("playerImg", "../assets/car.png");
    game.load.image("tower", "../assets/tower.png");
    game.load.image("dollars", "../assets/dollar.png");
    game.load.image("london", "../assets/london.png")

}
/*
 * Initialises the game. This function is only called once.
 */
function create() {
    var background = game.add.image(0, 0, "backgroundImg");
    background.width = 1000;
    background.height = 500;
    labelOpen = game.add.text(200, 40, "Press ENTER to start the game!", //add text
        {font: "25px Georgia", fill: "#FFFFFF"}); //change font colour

    game.input.keyboard
        .addKey(Phaser.Keyboard.ENTER)
        .onDown.add(start);

}

function start() {
    var background = game.add.image(0, 0, "backgroundImg");
    background.width = 1000;
    background.height = 500;
    game.add.text(200, 40, "Get ready for the NightLife New York!", //add text
        {font: "25px Georgia", fill: "#FFFFFF"}); //change font colour

    player = game.add.sprite(50, 150, "playerImg");
    player.width = 60;
    player.height = 30;
    game.input.keyboard.addKey(Phaser.Keyboard.UP)
        .onDown.add(moveUp);
    game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        .onDown.add(moveDown);

    labelScore = game.add.text(100, 40, "0",
        {font: "50px Georgia", fill: "#FFFFFF"});

    firstTime = 0;
    generatePipe();
    firstTime = 1;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable(player);

    player.body.velocity.x = 0;
    player.body.gravity.y = 600;

    var pipeInterval = 3.5;

    game.time.events
        .loop(pipeInterval * Phaser.Timer.SECOND,
        generate);

    game.input.keyboard
        .addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(playerJump);
    game.input
        .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(spaceHandler);

    gameStarted = true;
}

function generate() {
    var diceRoll = game.rnd.integerInRange(1, 2);
    if (diceRoll == 1) {
        generateDollars();
    } else {
        generatePipe();
    }
};

function spaceHandler() {
    game.sound.play("score")
}

function changeScore() {
    score = score + 1;
    labelScore.setText(score.toString());

    //if (score = 5)

}

function moveUp() {
    player.y -= 60
}
function moveDown() {
    player.y += 20
}

function generatePipe() {
    var gap = game.rnd.integerInRange(1, 5);
    for (var count = 0; count < 8; count = count + 1) {
        if (count != gap && count != gap + 1) {
            addPipeBlock(750, count * 50);
        }
    }
    if (firstTime > 0) {
        changeScore();
    }
}

function addPipeBlock(x, y) {
    var pipeBlock = game.add.sprite(x, y, "tower");
    pipes.push(pipeBlock);
    game.physics.arcade.enable(pipeBlock);
    pipeBlock.body.velocity.x = -200;
}

function playerJump() {
    player.body.velocity.y = -200;
}
/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
    if (gameStarted) {
        for (var index = 0; index < pipes.length; index += 1) {
            game.physics.arcade
                .overlap(player,
                pipes,
                gameOver);
        }

        if (player.y > 400) {
            gameOver();
        }


        for (var i = dollars.length - 1; i >= 0; i--) {
            game.physics.arcade.overlap(player, dollars[i], function () {
                changeGravity(-50);
                dollars[i].destroy();
                dollars.splice(i, 1);
            });
        }
    }
}

function checkBonus(bonusArray, bonusEffect){
    for(var i=bonusArray.length - 1; i>=0; i--){
        game.physics.arcade.overlap(player,bonusArray[i], function(){
            changeGravity(bonusEffect);
            bonusArray[i].destroy();
            bonusArray.splice(i,1);
        });
    }
}

function gameOver() {
    $("#score").val(score.toString());
    $("#greeting").show();
    game.destroy();
    gameGravity = 400

}

function gameStart() {
    game.input.Keyboard
        .addKey(Phaser.Keyboard.ENTER)
        .onDown.add(create);
}

jQuery.get("/score", function (scores) {
    scores.sort(function (scoreA, scoreB) {
        var difference = scoreB.score - scoreA.score;
        return difference;
    });
    for (var i = 0; i < 3; i++) {
        $("#scoreBoard").append(
            "<li>" +
            scores[i].name + ": " + scores[i].score +
            "</li>")
    }
});

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function changeGravity(g) {
    gameGravity += g;
    player.body.gravity.y = gameGravity;
}

function generateDollars() {
    var width = 800;
    var height = 400;

    var bonus = game.add.sprite(width, height, "dollars");
    bonus.width = 100;
    bonus.height = 70;
    dollars.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = -200;
    bonus.body.velocity.y = -game.rnd.integerInRange(60, 100)
}


/*function mode1() {
 var background = game.add.image(0, 0, "london");
 background.width = 1000;
 background.height = 500;
 game.add.text(200, 40, "Get ready for the NightLife London!", //add text
 {font: "25px Georgia", fill: "#FFFFFF"}); //change font colour

 player = game.add.sprite(50, 150, "playerImg");
 player.width = 60;
 player.height = 30;
 game.input.keyboard.addKey(Phaser.Keyboard.UP)
 .onDown.add(moveUp);
 game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
 .onDown.add(moveDown);

 labelScore = game.add.text(100, 40, "0",
 {font: "50px Georgia", fill: "#FFFFFF"});

 firstTime = 0;
 generatePipe();
 firstTime = 1;

 game.physics.startSystem(Phaser.Physics.ARCADE);
 game.physics.arcade.enable(player);

 player.body.velocity.x = 0;
 player.body.gravity.y = 600;

 var pipeInterval = 3.5;

 game.time.events
 .loop(pipeInterval * Phaser.Timer.SECOND,
 generate);

 game.input.keyboard
 .addKey(Phaser.Keyboard.SPACEBAR)
 .onDown.add(playerJump);
 game.input
 .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
 .onDown.add(spaceHandler);
 } */