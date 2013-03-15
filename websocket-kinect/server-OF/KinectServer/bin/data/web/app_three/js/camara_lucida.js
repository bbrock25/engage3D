/*!
 * Camara Lucida
 * www.camara-lucida.com.ar
 *
 * Copyright (C) 2012  Christian Parsons
 * www.chparsons.com.ar
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var cml = cml || {};

/*!
 * Camara Lucida www.camara-lucida.com.ar
 * Christian Parsons www.chparsons.com.ar
 *
 * kinect websocket client
 * to be used with the websocket server in openframeworks
 */

cml.KinectWS = function(opt)
{
	opt = opt || {};
	var def = {
		url: 'localhost',
		port: '9093',
		protocol: 'of-protocol',
		on_update: undefined,
		on_open: undefined,
		on_close: undefined
	};
	for (var k in def)
		if (opt[k] === undefined)
			opt[k] = def[k];

	var header = { 
		width: 640, height: 480, channels: 1, 
		size: 640 * 480
	};

	var _canvas = document.createElement('canvas'),
	    ctx = _canvas.getContext('2d'),
	    img_data;

	update_size();

	this.canvas = function() { return _canvas; }

	//TODO if Firefox: new MozWebSocket(url,protocol);
	console.log("$$Connecting to ws://"+opt.url+":"+opt.port+"/ ...");
	var socket = new WebSocket(
			'ws://'+opt.url+':'+opt.port+'/', 
			opt.protocol );
	socket.binaryType = 'arraybuffer';
	socket.onopen = on_open;
	socket.onmessage = on_message;
	socket.onclose = on_close;	

	function on_message( e )
	{

		if ( update_kinect_buff( e ) )
		{
			call( opt.on_update );
		}
		else
		{
			update_header( e );
		}
		update_size();
	}

	function update_kinect_buff( e )
	{
		console.log("updating kinect buffer");
		if ( ! (e.data instanceof ArrayBuffer) )
			return false;

		var data = img_data.data;

		var bytearray = new Uint8Array( e.data );

		var depth,
		    i, 
		    len = data.length, //i.e. (w * h * 4)
		    bai = 0;

		for (i = 0; i < len; i += 4)
		{
			depth = bytearray[bai++];
			data[i] = depth; 
			data[i + 1] = depth;
			data[i + 2] = depth;
			data[i + 3] = 255;
		}

		ctx.putImageData( img_data, 0, 0 );

		return true;
	}

	function update_header( e )
	{
		if (typeof e.data !== 'string') 
			return false;

		var _data = e.data.split(':');

		header.width = _data[0];
		header.height = _data[1];
		header.channels = _data[2];
		header.size = _data[3];

		return true;
	}

	function update_size()
	{
		var w = header.width,
		    h = header.height;

		if ( _canvas.width == w && _canvas.height == h )
			return;
		
		_canvas.width = w;
		_canvas.height = h;

		img_data = ctx.getImageData(0, 0, w, h);
	}

	function on_open()
	{
		console.log("Connection open");
		call( opt.on_open );
	}

	function on_close()
	{
		call( opt.on_close );
	}

	function call(fn)
	{
		if (typeof fn === 'function') fn();
	}
}

