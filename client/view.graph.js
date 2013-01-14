function renderGraph(s, o, v) {
    
    var ee = uuid();
    var r = $('<div style="width: 98%; height: 98%; overflow: hidden; background-image:url(/lib/chronozoom/Images/Blueprint_Paper.jpg);"/>').attr('id', ee);
    r.appendTo(v);
    
    var l1 = $('<div id="layer1"></div>');
    r.append(l1);
    var l2 = $('<div id="layer2"></div>');
    r.append(l2);
    
    initCZ(function() {
		
		//var path = '/demo/enformable/enformable-fukushima-timeline.json';
		//$.getJSON(path, function(data) {
			graphCZ(ee, function(root) {	
                var width = 1000;
                var height = 1000;
                
                var sys = arbor.ParticleSystem(1500, 762, 0.5);                
                sys.screenPadding(20);
                sys.screenSize(width, height);
                sys.parameters({"fps":10, "repulsion":3600,"friction":0.5,"stiffness":256,"gravity":false});
                
                
                sys.start();
                
                var nodeShapes = { };
                var edgeShapes = { };
                
                function addNode(id) {
                    var x = Math.random() * 400.0 - 200.0;  
                    var y = Math.random() * 400.0 - 200.0; 
                    
                    var shape = addRectangle(root, "layer1", id, x, y, 50, 50, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgba(140,140,140,0.5)' });
                    
                    //var circle = addCircle(shape, "layer2", id  + 'c', 0, 0, 23, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgb(20,240,40)' }, true);

                    var text = addText(shape, "layer1", id + '_t', -20, -20, y, 8, id, { fillStyle: 'white', fontName: 'Arial' }, undefined, true);
                    
                    nodeShapes[id] = shape;
                    sys.addNode(id);
                }
                function addEdge(edgeID, a, b) {
                    
                    var x = Math.random() * 400.0 - 200.0;  
                    var y = Math.random() * 400.0 - 200.0; 
                    
                    
                    var line = addRectangle(root, "layer1", edgeID, x, y, 100, 25, { fillStyle: 'rgba(240,240,240,0.8)', angle: 0});
                    line.from = a;
                    line.to = b;
                    
                    edgeShapes[edgeID] = line;
                    sys.addEdge(a, b, { id: edgeID });
                    
                }
                
                function moveShape(s, x, y, angle) {
                    s.x = x;
                    
                    if (s.baseline)
                        s.baseline = y;
                    
                    s.y = y;
                                     
                    if (angle) {
                        s.settings.angle = angle;    
                    }
                    
                    for (var c = 0; c < s.children.length; c++) {
                        moveShape(s.children[c], x, y, angle);
                    }
                }
                
                var offsetX = width/2.0;
                var offsetY = height/2.0;
                
                setInterval(function() {
                    sys.eachNode(function(x, pi) {
                       var s = nodeShapes[x.name];                       
                       if (s) {
                           moveShape(s, pi.x-offsetX, pi.y-offsetY);
                       }
                    });
                    
                    sys.eachEdge(function(edge, p1, p2) {
                        var e = edgeShapes[edge.data.id];
                        if (e) {
                            var cx = 0.5 * (p1.x + p2.x) - offsetX;
                            var cy = 0.5 * (p1.y + p2.y) - offsetY;
                            
                            var dy = p2.y - p1.y;                            
                            var dx = p2.x - p1.x;
                            
                            var angle = Math.atan2( dy, dx );
                            
                            var dist = Math.sqrt( dy*dy + dx*dx );
                            
                            e.width = dist;
                            
                            moveShape(e, cx, cy, angle);
                        }
                    });
                    root.vc.invalidate();
                }, 100);
     
                for (var i = 0; i < 15; i++) {
                    addNode('s' + i);
                }
                addEdge('0_1', 's0', 's1');
                addEdge('0_2', 's0', 's2');
                addEdge('1_3', 's1', 's3');
                
                /*var rect = addRectangle(root, "layer1", "r", -100, -50, 200, 100, { strokeStyle: 'rgb(240,240,240)', lineWidth: 2, fillStyle: 'rgb(140,140,140)' });
                rect.reactsOnMouse = true;
                rect.onmouseclick = function(e) {
                    console.log('clicked rect');
                };
                setInterval(function() {
                    rect.height = (Math.random() + 0.5) * 10.0;
                    rect.vc.invalidate();
                }, 50);*/
                
                //var circle = addCircle(rect, "layer1", "c", 0, 0, 49, { strokeStyle: 'white', lineWidth: 2, fillStyle: 'rgb(20,40,240)' });
                //image = addImage(circle, "layer2", "i", -25, -25, 50, 50, "Images/flower.png", function () { vc.virtualCanvas("invalidate"); });
                //text = addText(image, "layer2", "t", -20, -20, 0, 8, "Hello World", { fillStyle: 'green', fontName: 'Calibri' });

                return new VisibleRegion2d(-width/2.0, 0, 50.0 / 356.0);
                
				//return graphEnformableTimelineCZ(data.events, 512, root);                
                
			});								
		//});				
	});

}





var maxPermitedVerticalRange = { top: -10000000, bottom: 10000000 };


function initCZ(f) {
    $.getScript('/lib/lazyload.js', function() {
		
		var scripts = [ 
		               "/lib/chronozoom/Scripts/rx.js",
		               "/lib/chronozoom/Scripts/rx.jQuery.js",
		               
//		               "/lib/chronozoom/Scripts/axis.js",
		               "/lib/chronozoom/Scripts/common.js",
		               "/lib/chronozoom/Scripts/cz.settings.js",
		               "/lib/chronozoom/Scripts/vccontent.js",
		               "/lib/chronozoom/Scripts/viewport.js",
		               "/lib/chronozoom/Scripts/virtualCanvas.js",
		               "/lib/chronozoom/Scripts/mouseWheelPlugin.js",
		               "/lib/chronozoom/Scripts/gestures.js",
		               "/lib/chronozoom/Scripts/viewportAnimation.js",
		               "/lib/chronozoom/Scripts/viewportController.js",
                       
                       '/lib/arbor/arbor.js'
                       
		               
		];
		
		LazyLoad.js(scripts, f);
	});
    
    loadCSS('/lib/chronozoom/Styles/cz.css');
	
}

var vc;
function graphCZ(canvasElement, init) {
    /*
    pos = $("#pos");
    pos.css("position", "absolute");
    pos.css("top", (($(window).height() - pos.outerHeight()) / 2) + $(window).scrollTop() + "px");
    pos.css("left", (($(window).width() - pos.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    */

    vc = $("#" + canvasElement);
    vc.virtualCanvas();

    var root = vc.virtualCanvas("getLayerContent");
    root.beginEdit();

    var bounds = init(root);
    
    root.endEdit(true);

    var controller = new ViewportController(
                    function (visible) {
                        vc.virtualCanvas("setVisible", visible, controller.activeAnimation);
                    },
                    function () {
                        return vc.virtualCanvas("getViewport");
                    },
                    getGesturesStream(vc));

    vc.virtualCanvas("setVisible", bounds);
    updateLayout();
    
}

$(window).bind('resize', function () {
    updateLayout();
});

function updateLayout() {
    //vc.css('height', (window.innerHeight - 250) + "px");
    vc.virtualCanvas("updateViewport");
}
