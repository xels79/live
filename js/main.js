function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Ceil{
    constructor(startX, startY, startMap, microbe = null){
        if (microbe instanceof Microbe){
            microbe.ceil = this;
        }
        Object.defineProperties(this, {
            x:{
                get:()=>{return startX;}
            },
            y:{
                get:()=>{return startY;}
            },
            map:{
                get:()=>{return startMap;}
            },
            microbe:{
                get:()=>{return microbe;},
                set:(newMicrobe)=>{
                    microbe = newMicrobe;
                    if (newMicrobe instanceof Microbe){
                        newMicrobe.ceil = this;
                    }
                }
            },
            hasMicrobe:{
                get:()=>{return microbe instanceof Microbe;}
            }
            
        });
        this.hasClean = false;
        this.lastColor = '';
    }
    neighborsCount(){
        const _x=this.x,_y=this.y;
        let count=0;
        for (let x=_x-2;x<_x+2;x++){
            for (let y=_y-1;y<_y+1;y++){
                // console.log(x,y);
                if (x>=0 && y>=0 && x<this.map.length && y<this.map[x].length){
                    const ceil = this.map[x][y];
                    if ((ceil instanceof Ceil)&&ceil.hasMicrobe){
                        count++;
                    }
                }
            }
        }
        // console.log('cnt',count);
        return count;
    }
    render(context,width = 4, height = 4){
        if (!this.hasMicrobe){
            if (!this.hasClean){
                this.hasClean = true;
                this.lastColor = '';
                // context.beg
                context.clearRect(this.x*width, this.y*height, width, height);
            }
        }else{
            const nbc = this.neighborsCount();
            this.hasClean = false;
            if (nbc<2 || nbc>3 ){
                if (this.lastColor !== this.microbe.colors.danger){
                    this.lastColor = this.microbe.colors.danger;
                    context.fillRect(this.x*width, this.y*height, width, height);
                }
            }else if (this.lastColor !== this.microbe.color){
                this.lastColor = this.microbe.color;
                context.fillStyle = this.lastColor;
                context.fillRect(this.x*width, this.y*height, width, height);
            }
        }
    }
    addNewRandom(){
        const _x=this.x,_y=this.y;
        let empty=[];
        if (getRandomInRange(0,1000)>500){
            for (let x=_x+2;x>_x-2;x--){
                for (let y=_y+2;y>_y-2;y--){
                    if (x>=0 && y>=0 && x<this.map.length && y<this.map[x].length){
                        const ceil = this.map[x][y];
                        if ((ceil instanceof Ceil)&&!ceil.hasMicrobe){
                            empty.push({x:x,y:y});
                        }
                    }
                }
            }
        }else{
            for (let x=_x-2;x<_x+2;x++){
                for (let y=_y-2;y<_y+2;y++){
                    if (x>=0 && y>=0 && x<this.map.length && y<this.map[x].length){
                        const ceil = this.map[x][y];
                        if ((ceil instanceof Ceil)&&!ceil.hasMicrobe){
                            empty.push({x:x,y:y});
                        }
                    }
                }
            }
        }
        if (empty.length){
            const newPos = empty[Math.ceil(getRandomInRange(0, (empty.length - 1)*10000000000)/10000000000)];
            this.map[newPos.x][newPos.y].microbe = new Microbe(this.map[newPos.x][newPos.y]);
        }
    }
    evaluate(){
        if (this.hasMicrobe){
            if (!this.microbe.evaluate()){
                this.microbe = null;
            }
        }
    }
}
class Microbe{
    colors={
        warn:'#d1cc1c',
        danger:'#FF1111',
        normal:'#11FF11'
    };
    constructor(ceil, maxLiveCircle = 9){
        let liveCircle=0;
        this._maxLiveCircle = maxLiveCircle;
        let isFirstCircle = true;
        this.ceil = ceil;
        Object.defineProperties(this,{
            liveCircle:{get:()=>{return liveCircle;}},
            isFirstCircle:{get:()=>{return isFirstCircle}},
            increasLiveCircle:{
                value:function(){
                    isFirstCircle = false;
                    if (maxLiveCircle>0 && liveCircle<maxLiveCircle){
                        liveCircle++;
                    }
                }
            },
            timeUp:{
                get:()=>{
                    return !(maxLiveCircle<1 || liveCircle<maxLiveCircle);
                }
            }
        });
    }
    evaluate(){
        if (this.isFirstCircle){
            this.increasLiveCircle();
            return true;
        }else{
            this.increasLiveCircle();
            if (this.timeUp){
                return false;
            }else{
                const neighborsCount = this.ceil.neighborsCount();
                // console.log(neighborsCount);
                if (neighborsCount<2 || neighborsCount>3){
                    return false;
                }else if (neighborsCount == 3){
                    //  this.ceil.addNewRandom();
                    return true;
                }else{
                    this.ceil.addNewRandom();
                    return true;
                }
            }
        }
    }
    get color(){
        if (this.liveCircle<this._maxLiveCircle/3){
            return this.colors.warn;
        }else if (this.liveCircle>this._maxLiveCircle/3 && this.liveCircle<(this._maxLiveCircle/3)*2){
            return this.colors.normal;
        }else{
            return this.colors.danger;
        }
    }
}
class App{
    constructor(cubeW=4, cubeH=4){
        const canvas=document.getElementById('outPut');
        this.cubeW = cubeW;
        this.cubeH = cubeH;
        this.w = Math.ceil(canvas.width/cubeW);
        this.h = Math.ceil(canvas.height/cubeH);
        this.context2D = canvas.getContext("2d");
        this.map = [];
        for(let x = 0;x<this.w;x++){
            this.map.push([]);
            for(let y = 0;y<this.h;y++){
                let ceil;
                if (getRandomInRange(0,100000)>70000){
                    ceil = new Ceil(x,y,this.map,new Microbe(ceil));
                }else{
                    ceil = new Ceil(x,y,this.map);
                }
                this.map[x].push(ceil);
            }
        }
    }
    render(){
        let count = 0;
        this.map.forEach(xEl=>xEl.forEach(yEl=>{
            if (yEl.hasMicrobe){
                count++;
            }
            yEl.render(this.context2D, this.cubeW, this.cubeH);
        }));
        return count;
    }
    evaluate(){
        this.map.forEach(xEl=>xEl.forEach(yEl=>yEl.evaluate()));
    }
    some(){
        return this.map.some(yEl=>yEl.some(yEl=>yEl.hasMicrobe));
    }
}

const app = new App(10,10);
const countInformer = document.getElementById('count_informer');
let screenTimer = 0;
function step(){
    setTimeout(()=>{
        if (app.some()){
            app.evaluate();            
            step();
        }else{
            console.log('end');
        }
    },50);
    setTimeout(()=>{
        window.requestAnimationFrame(()=>{
            countInformer.innerText=app.render();
        });
    },150);

}

console.log(app);
step();