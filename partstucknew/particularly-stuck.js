//(function(){


var world_width = 400,
	world_height = 400,
	controlbox_width = 400,
	controlbox_height = 400,

	slider_margin = {top:30,bottom:0,left:10,right:10},
	slider_width = 400,
	slider_height = 230,

	button_margin = {top:0,bottom:0,left:10+25,right:10+25},
	button_width = 230,
	button_x = 0,
	button_y = 230+30+25+10,

	toggle_x = 400 - 30,
	toggle_y = 230+30+25+10;

;

// fixed parameters

var N = 300, // # of agents
	L = 64 , // world size
	agentsize = 1,
	dt = 1,
	dt2 = Math.sqrt(dt),
	agentcolor = "rgb(150,150,150)",
	hiddenagentcolor = "rgb(230,230,230)",
	structurecolor = "darkred",
	agents = [];

// this are the default values for the slider variables

var def_speed = 0.8,
	def_noise = 0.8,
	def_attraction = 0.0,
	def_twist = 0.05,
	def_twistmix = 0.0;

// parameter objects for the sliders

var v = {id:"speed", name: "speed", range: [0,1.4], value: def_speed};
var sigmax = {id:"wigglex", name: "wiggle-X", range: [0,agentsize*2], value: def_noise};
var sigmay = {id:"wiggley", name: "wiggle-Y", range: [0,agentsize*2], value: def_noise};
var gamma = {id:"attraction", name: "storm", range: [-2,2], value: def_attraction};

// action parameters for the buttons

var playpause = { id:"b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"b2", name:"", actions: ["back"], value: 0};
var reload = { id:"b3", name:"", actions: ["reload"], value: 0};

var hide = {id:"t1", name: "hide particles",  value: false};

// widget.block helps distributing widgets in neat arrays

var sbl = new widget.block([2,1,2],slider_height-slider_margin.top-slider_margin.bottom,0,"[]");
var bbl = new widget.block([2,1],button_width-button_margin.left-button_margin.right,20,"[]");

// slider objects

var sliders = [
	new widget.slider(v).width(slider_width-slider_margin.left-slider_margin.right),
	new widget.slider(sigmax).width(slider_width-slider_margin.left-slider_margin.right),
	new widget.slider(sigmay).width(slider_width-slider_margin.left-slider_margin.right),
	new widget.slider(gamma).width(slider_width-slider_margin.left-slider_margin.right),
]

// button objects

var buttons = [
	new widget.button(playpause).update(runpause),
	new widget.button(back).update(setup),
	new widget.button(reload).update(resetparameters)
]

var toggles = [
	new widget.toggle(hide).update(redraw).label("left")
]


// position scales
var X = d3.scaleLinear().domain([0,2*L]).range([0,world_width]);
var Y = d3.scaleLinear().domain([0,2*L]).range([world_height,0]);
var R = d3.scaleLinear().domain([0,2*L]).range([0,world_width]);

// this is the box for the simulation


var world = d3.selectAll("#cxpbox_particularly-stuck_display").append("canvas")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")


var context = world.node().getContext("2d");

// this is the svg for the widgets

var controls = d3.selectAll("#cxpbox_particularly-stuck_controls").append("svg")
	.attr("width",controlbox_width)
	.attr("height",controlbox_height)
	.attr("class","explorable_widgets")

controls.append("g")
	.attr("transform","translate("+ (button_x + button_margin.left) +","+ (button_margin.top + button_y) +")")

// sliders, buttons and cartoon elements

controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
	.attr("transform",function(d,i){return "translate("+slider_margin.left+","+(slider_margin.top+sbl.x(i))+")"});

controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+((button_x + button_margin.left)+bbl.x(i))+","+(button_margin.top + button_y)+")"});

controls.selectAll(".toggle").data(toggles).enter().append(widget.toggleElement)
	.attr("transform",function(d,i){return "translate("+toggle_x+","+toggle_y+")"});

/////////////////////////////////////////

// add agents to the scene

setup();

// timer variable for the simulation

var t;

// functions for the action buttons

function runpause(d){ d.value() == 1 ? t = d3.timer(runsim,0) : t.stop(); }

function setup(){
	d3.select("#button_b1").transition().style("opacity",1)
	agents = d3.range(N).map(function(d,i){
		var theta = Math.random() * 2 * Math.PI;
		return {
				x: Math.random() * 2 * L,
				y: Math.random() *2*L,
				state: 1,
				polarity: Math.random()
		}
	})
	for(let f = 0; f < 2*L; f++){
		agents.push({x: f, y: 0 ,state: 0, polarity: Math.random()});
	}
console.log(agents)

agents.push({x: 0, y: 0, state: 1, polarity: Math.random()})

	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)
	agents.forEach(function(d){
				//	context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y),R(agentsize) / 2,0,Math.PI * 2);
					context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})
}

function redraw(){
	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)
	agents.forEach(function(d){
				//	context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y), R(agentsize) / 2, 0, Math.PI * 2);
					context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})
}

function resetparameters(){
	sliders[0].click(def_speed);
	sliders[1].click(def_noise);
	sliders[2].click(def_attraction);
	sliders[3].click(def_twist);
	sliders[4].click(def_twistmix);
}

function finished(){
	buttons[0].click();
}


function runsim(){

// `v =` speed
// gamma = attraction
// delta = twist
// sigma = wiggle

	// make a step
	var fin = 1;
	agents.forEach(function(d){
		if (d.state == 1) {
			//var P = d.polarity < twistmix.value ? 1 : -1;
			var r = Math.sqrt(d.x * d.x + d.y * d.y);
			//var dx = v.value * dt * ( (- gamma.value * d.x + P * delta.value * d.y) / r ) + sigma.value * (Math.random()-0.5) * dt2 * Math.sqrt(v.value);
			//var dy = v.value * dt * ( (- 0.1 - P * delta.value * d.x) ) + sigma.value * (Math.random()-0.5) ** dt2 * Math.sqrt(v.value);
			var dx = gamma.value + (sigmax.value * (Math.random() - 0.5));
			var dy = v.value + (sigmay.value * (Math.random() - 0.5));

			var x_new = (d.x + dx);
			var y_new = (d.y + dy);

			d.x = (d.x + dx)
			d.y = (d.y - dy)

			if(d.x < 0 || d.x > L*2){
				agents.splice(agents.indexOf(d),1)
				addagent();
			}

			statics = agents.filter(function(d){return d.state == 0});
			var i = 0;

			while(d.state == 1 && i<statics.length && fin == 1){
				var a = statics[i];
					if (( d.x - a.x ) * ( d.x - a.x ) + ( d.y - a.y ) * ( d.y - a.y ) < agentsize *  agentsize ) {
					d.state = 0;
					addagent();
					/*
					if ((d.x * d.x + d.y * d.y) > (L-2)*(L-2) ) {
						finished();
						fin = 0;
					}
					*/
				}
				i++
			}
		}
	})




	// update stuff on screen
	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)
	agents.forEach(function(d){
					//context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y),R(agentsize) / 2,0, Math.PI * 2);
										context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})

}

function addagent(){
	var theta = Math.random() * 2 * Math.PI;
	agents.push({
			x:  Math.random() * L * 2,
			y:  Math.random() * L*2,
			state: 1,
			polarity: Math.random()
	})
}



//})()
