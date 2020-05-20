const canvas= document.getElementById("canvas")
var ctx = canvas.getContext("2d")

const x = a => Math.ceil(a * canvas.width/cols)
const y = a => Math.ceil(a * canvas.height/rows)

function mod(a,b){
	if(a>=0)return a%b
	else return b+a%b
}

function equalxy(a,b){
	if(a.x == b.x && a.y == b.y)return 1
	else return 0
}

var rows = 21
var cols = 21
var running=false
var auto=false
var state
var score
var level

const appleimg = new Image()
appleimg.src = "images/apple.png"
appleimg.width = x(1)
appleimg.height = y(1)

const audio_eat = new Audio()
const audio_dead = new Audio()
const audio_up = new Audio()
const audio_down = new Audio()
const audio_left = new Audio()
const audio_right = new Audio()
const audio_win = new Audio()
const audio_click = new Audio()
const background_music = new Audio()

audio_eat.src = "audio/eat.mp3"
audio_dead.src = "audio/dead.mp3"
audio_left.src = "audio/left.mp3"
audio_right.src = "audio/right.mp3"
audio_up.src = "audio/up.mp3"
audio_down.src = "audio/down.mp3"
audio_win.src = "audio/win.wav"
audio_click.src = "audio/click.wav"
background_music.src = "audio/Snack_Time(trim).mp3"
background_music.loop = true
background_music.volume = .4

const up = {x:0,y:-1}
const down = {x:0,y:1}
const left = {x:-1,y:0}
const right = {x:1,y:0}

function createMaze(arr,x,y,length,dir){
	for(let i=0;i<length;i++){
		let newmaze={x:x,y:y}
		x+=dir.x
		y+=dir.y
		arr.push(newmaze)
	}
}

const maze=[[],[],[],[],[],[]]
//level 1
createMaze(maze[1],6,10,10,right)

//level 2
createMaze(maze[2],0,0,5,right)
createMaze(maze[2],0,20,5,right)
createMaze(maze[2],20,0,5,left)
createMaze(maze[2],20,20,5,left)
createMaze(maze[2],0,1,4,down)
createMaze(maze[2],20,1,4,down)
createMaze(maze[2],0,19,4,up)
createMaze(maze[2],20,19,4,up)

//level 3
createMaze(maze[3],0,0,20,right)
createMaze(maze[3],20,0,20,down)
createMaze(maze[3],20,20,20,left)
createMaze(maze[3],0,20,20,up)
createMaze(maze[3],6,6,1,up)
createMaze(maze[3],6,15,1,up)
createMaze(maze[3],15,15,1,up)
createMaze(maze[3],15,6,1,up)

//level 4
createMaze(maze[4],6,5,9,right)
createMaze(maze[4],6,10,9,right)
createMaze(maze[4],6,15,9,right)
createMaze(maze[4],10,6,10,down)

//level 5
createMaze(maze[5],5,5,11,{x:1,y:1})
createMaze(maze[5],5,15,11,{x:1,y:-1})
createMaze(maze[5],5,4,2,{x:-1,y:1})
createMaze(maze[5],16,15,2,{x:-1,y:1})
createMaze(maze[5],15,4,2,{x:1,y:1})
createMaze(maze[5],4,15,2,{x:1,y:1})
createMaze(maze[5],10,9,2,{x:1,y:1})
createMaze(maze[5],9,10,2,{x:1,y:1})

function initialState(){
	state={
		snake: [],
		apple: {},
		moves: [],
		pause: false
	}
	newSnake()
	newApple()
}

function newSnake(){
	state.snake = [{
		x: Math.floor(Math.random()*cols),
		y: Math.floor(Math.random()*rows)
	}]

	if(didCollide())
		newSnake()
}

function newApple(){
	state.apple = {
		x: Math.floor(Math.random()*cols),
		y: Math.floor(Math.random()*rows)
	}
	
	//check snake pos
	for(let i=0;i<state.snake.length;i++){
		if(equalxy(state.apple,state.snake[i])){
			newApple()
			break
		}
	}

	//check maze pos
	for(let i=0;i<maze[level].length;i++){
		if(equalxy(state.apple,maze[level][i])){
			newApple()
			break
		}
	}
}

function moveSnake(){
	let head={
		x: state.snake[0].x,
		y: state.snake[0].y
	}

	if(state.moves.length>1)state.moves.shift()

	head.x = mod(head.x+state.moves[0].x,cols)
	head.y = mod(head.y+state.moves[0].y,rows)
	state.snake.unshift(head)

	//check eat
	if(equalxy(head,state.apple)){
		newApple()
		score+=speed
		audio_eat.play()
	}
	else{
		removedtail=state.snake.pop()
	}
}

var removedtail

function unmoveSnake(){
	let head={
		x: state.snake[0].x,
		y: state.snake[0].y
	}

	state.snake.shift()
	state.snake.push(removedtail)

	if(state.snake.length>1){
		if(state.snake[0].x-state.snake[1].x==1)state.moves[0]=right
		else if(state.snake[0].x-state.snake[1].x==-1)state.moves[0]=left
		else if(state.snake[0].y-state.snake[1].y==-1)state.moves[0]=up
		else if(state.snake[0].y-state.snake[1].y==1)state.moves[0]=down
	}
}

function didCollide(){
	for(let i=1;i<state.snake.length;i++){
		if(equalxy(state.snake[0],state.snake[i]))return true
	}
	for(let i=0;i<maze[level].length;i++){
		if(equalxy(state.snake[0],maze[level][i]))return true
	}
	return false
}

function gameover(){
	running=false

	reqid=window.requestAnimationFrame(popup("Game Over!",0,.1,9))
	
	canvas.addEventListener('click',function func(){
		initialState()
		window.cancelAnimationFrame(reqid)
		ctx.clearRect(0,0,x(cols),y(rows))
		document.getElementsByClassName("modeselect")[0].style.display='flex'
		canvas.removeEventListener('click',func)
	})
}

var reqid

function popup(str,initial,change,repeat){
	return function(){
		if(repeat==0){
			return
		}

		ctx.clearRect(0,0,x(cols),y(rows))
		ctx.fillStyle = "rgba(256,200,200,"+initial+")"
		ctx.fillRect(0,0,x(cols),y(rows))

		ctx.fillStyle = "rgba(0,0,0,"+initial+")"
		ctx.font = "800px digital"
		ctx.fillText(str,600,2000,3000)
		ctx.font = "200px monospace"
		ctx.fillText("Click Anywhere To Continue...",700,2400,2800)

		reqid=window.requestAnimationFrame(popup(str,initial+change,change,repeat--))
	}
}

function run(){

	//draw background
	ctx.fillStyle = "#333"
	ctx.fillRect(0,0,x(cols),y(rows))
	ctx.strokeStyle = "#ddd"
	ctx.strokeRect(0,0,x(cols),y(rows))
	
	//draw maze
	for(let i=0;i<maze[level].length;i++){	
		ctx.fillStyle="orangered"
		ctx.fillRect(x(maze[level][i].x),y(maze[level][i].y),x(1),y(1))
	}

	//draw apple
	ctx.drawImage(appleimg, x(state.apple.x),y(state.apple.y),x(1),y(1))

	//draw snake
	for(let i=0;i<state.snake.length;i++){	
		ctx.fillStyle=i==0?"#00bb00":i%2?"#00ff00":"#00ee00"
		ctx.fillRect(x(state.snake[i].x),y(state.snake[i].y),x(1),y(1))
	}

	document.getElementById('score').innerText=parseInt(score,10)

	if(level>0){
		if(state.snake.length>10){
			running=false
			background_music.pause()
			background_music.currentTime=0
			audio_win.play()
			reqid=window.requestAnimationFrame(popup(level<5?"Level completed":"!!You Win!!",0,.1,9))
	
			canvas.addEventListener('click',function func(){
				if(level<5){
					level++
					running=true
					background_music.play()
				}
				else{
					document.getElementsByClassName("modeselect")[0].style.display='flex'
				}
				initialState()
				window.cancelAnimationFrame(reqid)
				ctx.clearRect(0,0,x(cols),y(rows))
				canvas.removeEventListener('click',func)
			})
		}
	}

	if(state.moves.length!=0)moveSnake()

	if(auto)autonomous(state.moves[0])

	if(didCollide()){
		setTimeout(gameover,20)
		audio_dead.play()
		background_music.pause()
		background_music.currentTime=0
	}
}

function turn(dir){
	if(state.moves[state.moves.length-1]!=left&&state.moves[state.moves.length-1]!=right){
		if(dir==right){
			state.moves.push(right)
			audio_right.play()
		}
		else if(dir==left){
			state.moves.push(left)
			audio_left.play()
		}
	}
	if(state.moves[state.moves.length-1]!=down&&state.moves[state.moves.length-1]!=up){
		if(dir==up){
			state.moves.push(up)
			audio_up.play()
		}
		else if(dir==down){
			state.moves.push(down)
			audio_down.play()
		}
	}
}

document.addEventListener('keydown',keypress)
function keypress(e){
	if(e.code=='KeyW' || e.code=='ArrowUp')turn(up)
	else if(e.code=='KeyA' || e.code=='ArrowLeft')turn(left)
	else if(e.code=='KeyS' || e.code=='ArrowDown')turn(down)
	else if(e.code=='KeyD' || e.code=='ArrowRight')turn(right)
	else if(e.code=='Space')pause()
}

canvas.addEventListener('touchstart',lock)
let swipe={x:null,y:null}
let locked=false
function lock(e){
	locked=true
	swipe.x=e.changedTouches[0].clientX
	swipe.y=e.changedTouches[0].clientY

	canvas.addEventListener('touchmove',moveTouch)
	canvas.addEventListener('touchend',endTouch)
}
function moveTouch(e){
	e.preventDefault()
}
function endTouch(e){
	if(!locked)return
	let dx = e.changedTouches[0].clientX - swipe.x
	let dy = e.changedTouches[0].clientY - swipe.y

	if(Math.abs(dx)>=Math.abs(dy)){
		if(dx<0)turn(left)
		else if(dx>0)turn(right)
	}
	else{
		if(dy<0)turn(up)
		else if(dy>0)turn(down)
	}

	locked=false
	canvas.removeEventListener('touchmove',moveTouch)
	canvas.removeEventListener('touchend',endTouch)
}

var speed=100

const step = t1 => t2 => {
	if(t2 - t1 > 15000/speed){
		if(running&&!state.pause)run()
		window.requestAnimationFrame(step(t2))
	}
	else{
		window.requestAnimationFrame(step(t1))
	}
}

document.getElementById("speedup").addEventListener("click",function(){
	if(speed<500)speed += 25
	audio_click.play()
})
document.getElementById("speeddown").addEventListener("click",function(){
	if(speed>25)speed -= 25
	audio_click.play()
})
document.getElementById("pause").addEventListener("click",pause)
function pause(){
	if(running){
		state.pause=!state.pause
		document.getElementById("pausebtn").className = `fa ${state.pause?"fa-play":"fa-pause"}`
		audio_click.play()
		state.pause?background_music.pause():background_music.play()
	}
}

document.getElementById("autonomous").addEventListener("click",function(){
	auto=!auto
	let btn=document.getElementById("autonomous")
	audio_click.play()
	btn.children[0].innerHTML = auto ? "ON&nbsp;" : "OFF"
})


document.getElementById('endless').addEventListener('click',function(){
	level=0
	start()
	background_music.play()
	audio_click.play()
})

document.getElementById('classic').addEventListener('click',function(){
	level=1
	start()
	background_music.play()
	audio_click.play()
})

const start = () => {
	running=true
	score=0
	initialState()
	document.getElementsByClassName("modeselect")[0].style.display='none'
}

var triedtoeatY,triedtoeatX
function autonomous(triedmove){
	if(state.moves.length==0)state.moves.push(right)
	if(didCollide()){
		unmoveSnake()
		let move=state.moves[0]

		if(move.x==0){
			state.moves.push(triedmove==right?left:right)
			moveSnake()
			if(triedmove==left)return
			if(didCollide()){
				state.moves[0]=move
				autonomous(triedmove==right?left:right)
			}
		}
		else{
			state.moves[0]=triedmove==up?down:up
			moveSnake()
			if(triedmove==down)return
			if(didCollide()){
				state.moves[0]=move
				autonomous(triedmove==up?down:up)
			}
		}
	}
	else{
		if(state.snake[0].x==state.apple.x&&state.moves[state.moves.length-1].y==0)state.moves.push(triedtoeatY=triedtoeatY==up?down:up)
		else if(state.snake[0].y==state.apple.y&&state.moves[state.moves.length-1].x==0)state.moves.push(triedtoeatX=triedtoeatX==right?left:right)
	}
}

window.requestAnimationFrame(step(0))