import * as loader from "ts-loader/dist";
import { CityGame } from "./CityGame";



class QuizDiv {


    public gameCanvas;
    public cityToGuessText;
    public validateGuessBtn;
    public nextBtn;

    public scoreTxt;
    public roundTxt;
    public endDiv;
    public endTxt;

    public game : CityGame;


    constructor(game) {
        this.gameCanvas = document.createElement("div");

        this.gameCanvas.className = "gameCanvas"

        document.body.appendChild(this.gameCanvas)


        let title = document.createElement("h3");
        title.innerText = "Geo quiz - World Capitals";
        this.gameCanvas.appendChild(title);

        let content = document.createElement("div");
        content.className = "content";
        this.gameCanvas.appendChild(content);

        this.cityToGuessText = document.createElement("div");

        this.cityToGuessText.innerText = "Geo quiz - World Capitals";
        content.appendChild(this.cityToGuessText);




        let d = document.createElement("div");
        this.validateGuessBtn = document.createElement("button");
        this.validateGuessBtn.className = "validateBtn";
        this.validateGuessBtn.innerText = "Guess";


        d.appendChild(this.validateGuessBtn);

        // this.nextBtn = document.createElement("button");
        // this.nextBtn.className = "nextBtn";
        // this.nextBtn.innerText = "Next";


        // d.appendChild(this.nextBtn);
        content.appendChild(d);



        this.scoreTxt = document.createElement("div");
        this.scoreTxt.innerText = "Score : 0 pts";
        content.appendChild(this.scoreTxt);

        this.roundTxt = document.createElement("div");
        this.roundTxt.innerText = "Score : 0 pts";
        content.appendChild(this.roundTxt);





        this.endDiv = document.createElement("div");
        this.endDiv.className = "endDiv";
        this.endDiv.style.display = "none";
        
        this.endTxt = document.createElement("h2");
        this.endTxt.className = "endTxt";
        this.endTxt.innerText = "You've got XX pts !";

        this.endDiv.appendChild(this.endTxt);


        let endBtn = document.createElement("button");
        endBtn.className = "endBtn";
        endBtn.innerText = "Replay";

        this.endDiv.appendChild(endBtn);

        endBtn.addEventListener ("click",function(){
            game.Replay();
        });
        
        document.body.appendChild(this.endDiv);
        



        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = 'quiz.css';
        document.getElementsByTagName("head")[0].appendChild(css);

        // console.log(game.cityToGuess)

        // this.nextBtn.addEventListener ("click",function(){
        //     game.NextGuess();
        // });


        this.validateGuessBtn.addEventListener ("click",function(){
            game.ValidateGuess(game.cityToGuess,game.guessPoint);
        });

    }


    public UpdateCityToGuess(name, country) {
        this.cityToGuessText.innerText = `You have to guess where ${name} (${country}) is placed on the map`;
    }

    public UpdateRound(round,max_round){
        this.roundTxt.innerText = `Round : ${round+1} / ${max_round}`;
    }


    public UpdateScore(score) {
        this.scoreTxt.innerText = `Score : ${score} pts`;
        this.endTxt.innerText = `You've got : ${score} pts !`;
    }

    
    public ToggleEndDivVisibility(){
        console.log("🚀 ~ file: quizDiv.ts ~ line 137 ~ QuizDiv ~ ToggleEndDivVisibility ~ this.endDiv.style.display", this.endDiv.style.display)
        if(this.endDiv.style.display == "none"){

            this.endDiv.style.display = "flex";
        }
        else{
            this.endDiv.style.display = "none";
        }

    }

    




}


export { QuizDiv as QuizDiv };