/* P2P Netention network */

exports.plugin = function ($N) {
    //https://github.com/marcelklehr/smokesignal

    return {
        name: 'P2P Network',
        description: '',
        version: '1.0',
        author: 'http://netention.org',


        start: function (options) {
            var node = $N.node = new (require('telepathine')
						.Telepathine)(
							options.port,
							options.seeds,
							{
								address: options.address,
								addressMap: options.addressMap,
								network: options.network								
							}
						);

			var peers =  { };
			var local = new $N.nobject('^' + $N.server.id);
			local.author = local.id;
			
			function updatePeer(peer, active) {
				var p = peers[peer];
				
				if (!p) {
					//create placeholder object
					p = new $N.nobject('^' + peer);			
					p.author = p.id;
					p.setName(peer);
					p.addTag('Network');
					
					peers[peer] = p;					
				}
				
				//TODO set active state level and republish
				/*
				if ($N.pub)
					$N.pub(p);
				*/
			}
			
			function setPeer(peer, value) {
				peers[peer] = value;
				$N.objTouch(value);				
				if ($N.pub)
					$N.pub(value);
			}
			
			function updateLocal() {
				local.setName($N.server.name);				
				
				var os = require('os');
								
				var d = "";
				d += "Hostname: " + os.hostname() + "<br/>";
				d += "Uptime: " + os.uptime() + "<br/>";
				d += "Total Memory: " + os.totalmem() + "<br/>";
				d += "Free Memory: " + os.freemem() + "<br/>";
				d += "CPUs: " + JSON.stringify(os.cpus()) + "<br/>";
				
				local.setDescription(d);
				local.addTag('Network');

				node.set('_', local);
				
				if ($N.pub)
					$N.pub(local);
			}
			
			
			node.on('peer:new', function(peerdata) {
				//console.log('new peer', peerdata.address, peerdata.port);
				//console.log('new peer', peerdata);
			});
			
			node.on('peer:start', function(peername) {
				//console.log('live peer', peername);
				updatePeer(peername, true);
			});
			
			node.on('peer:stop', function(peername) {
				//console.log('dead peer', peername);
				updatePeer(peername, false);
			});
						
			updateLocal();
			
			node.start();
												
			console.log(node.peer_name + ' p2p started');
				
			//var peers = { };
			/*
			function updatePeer(c) {
								
				if (!c.id) return;
				
				if (c.id!=c.nodeID) {
					
					node.get(c.id);
					node.on('set:' + c.id, function(v) {
						//node.debug();
						$N.broadcastRoster();
					});
				}				
			}
			*/
			

			/*
            node.on('update', function (peer, k, v) {
                var peerID = node.peerValue(peer, "id");
                var peerName = node.peerValue(peer, "name") || peerID;
                if (options.debug)
                    console.log(peerName + ": " + k + "=" + JSON.stringify(v)); // peer 127.0.0.1:9999 set somekey to somevalue
                
                if (k[0] === 's') {
                    var msgNum = parseInt(k.substring(1));
                    if (msgNum!==NaN) {
                        $N.channelAdd('main', v, true, false);
                    }
                }
            });
			*/


			node.know('_', function(peer, v) {
				//console.log('peer update', peer, v);
				setPeer(peer, v);
			});
			
			/*node.know('*', function (peer, v) {
				console.log(this.peer_name + " knows " + peer + " set " + this.event + "=" + v);
				//console.log(node.livePeers());
    		});*/
			
			node.hear('*', function (data, fromPeer) {
				console.log('a received ', this.event, '=', data, 'from', fromPeer);
			});
			
            $N.on('main/set', function (key, v, expiresAt) {				
                if (v === null) {
                    node.set(key, null, Date.now()); //expire now
				}
                else {
                    node.set(key, v, expiresAt);
				}				
            });
            
            $N.on('main/say', function (v, skipBroadcast) {
                if (!skipBroadcast) {
					node.say(v);
                }
            });
			
                        
        },

        __start: function (options) {
            var pnode = require('pnode');

            options.id = $N.server.id;

            var node = pnode.peer({
                id: options.id,
                debug: false
                //learn:true
            });

            node.expose({
                event: function (e) {
                    $N.emit("main/in", e);
                }
            });
            node.bindOn('tcp://0.0.0.0:' + options.port, function () {
                console.log('pnode started on port ' + options.port);
            });

            if (options.seeds)
                options.seeds.forEach(function (s) {
                    node.bindTo('tcp://' + s.address + ':' + s.port);
                });

            $N.p2p = function (whenConnected, whenDisconnected) {
                //if (!that.connected)
                //doWhenConnected.push(whenConnected);
                //else
                whenConnected(node);
            };

            node.on("peer", function (peer) {
                if (options.debug)
                    console.log(options.id + " peer connected: " + peer.id);
            });

            var store = node.store({
                id: 'main',
                subscribe: true,
                publish: true,
                publishInterval: 100, //"nextTick"
                debug: false,
                filter: null
            });

            /*var LRU = require("lru-cache");
            store.obj = LRU({ max: 8
                          //, length: function (n) { return n * 2 }
                          , dispose: function (key, n) { n.close() }
                          , maxAge: 1000  * 60 * 60 });*/


            store.on('*', function (u, v, w) {
                if (u === 'set') {}
                if (u === 'add') {}
                if (u === 'remove') {}
                if (u === 'update') {}

                if (options.debug) {
                    console.log(options.id + ' store ' + u + ': ', v, w, ', length: ' + _.keys(store.object()).length);
                    console.log(store.object());
                    //console.log(store.obj);
                }
            });

            /*store.set('foo', 24);
            store.set(['ping','pong'], 0);
            store.set('bazz', { zip: { zap: "!" } });
            store.set(["x",0,"y"], { a:"b" });
            store.set(["x",1], { c:"d" });*/

            /*setTimeout(function() {
              console.log('peer has:',store.object());
            }, 1000); */

            $N.on('main/out', function (p) {
                node.publish(p);

                node.all(function (remotes) {
                    remotes.forEach(function (remote) {
                        console.log(options.id, 'sending to remote', remote._pnode.id);
                        remote.event(p);
                    });
                });
            });

            $N.on('main/set', function (k, v) {
                var key = options.id + '/' + k;
                if (v === null)
                    store.del(key);
                else
                    store.set(key, v);
            });
        },

        _start: function (options) {

            //var AppendOnly = require("append-only");
            //var Bucket = require('scuttlebucket')

            var ExpiryModel = require("expiry-model");
            //var Model = require('scuttlebutt/model');

            var maxAge = 1000 * 60 * 60 * 2;
            var maxItems = 64;

            var mainChannel = new ExpiryModel({
                maxAge: maxAge,
                max: maxItems
            });


            var p2p = require('./index');
            options.address = options.address; // p2p.localIp(options.address);
            options.id = $N.server.id;

            var node = p2p.createNode(options);
            this.node = node;


            var that = this;
            that.connected = false;
            var doWhenConnected = [];
            node.on('connect', function () {
                // Hey, now we have at least one peer!

                if (options.debug)
                    console.log('connected');

                if (!that.connected) {
                    that.connected = true;
                    doWhenConnected.forEach(function (d) {
                        d(node);
                    });
                    doWhenConnected = [];
                }
            });



            $N.p2p = function (whenConnected, whenDisconnected) {
                if (!that.connected)
                    doWhenConnected.push(whenConnected);
                else
                    whenConnected(node);
            };

            node.on('disconnect', function () {
                //console.log('disconnected');
                that.connected = false;
                if (options.debug) {
                    console.log('disconnect');
                }
            });

            node.peers.on('add', function (p) {
                if (options.debug) {
                    console.log('add peer', p.id);
                }
            });
            node.peers.on('remove', function (p) {
                if (options.debug) {
                    console.log('remove peer', p.id);
                }
            });

            //process.stdin.pipe(node.broadcast).pipe(process.stdout)  // Broadcast is a stream

            node.start();

            // listen on network events...
            console.log('P2P: Started on ' + node.options.address + ':' + options.port + ', id=' + node.id)

            var b = node.broadcast;

            if (options.debug) {
                //b.pipe(process.stdout);
            }


            $N.on('main/out', function (p) {
                mainChannel.set(node.id, p);
            });

            $N.on('main/set', function (k, v) {
                mainChannel.set(node.id + '/' + k, v);
            });

            mainChannel.on('update', function (k, v) {
                if (k.indexOf('/') === -1) {
                    $N.emit("main/in", v, k);
                }

                $N.emit('main/get', mainChannel.toJSON(), k, v);
            });

            var ls = mainChannel.createStream();
            ls.pipe(node.broadcast).pipe(ls);

        },


        stop: function () {
            //console.log('stopping');
            this.node.stop();
        }
    };
};
