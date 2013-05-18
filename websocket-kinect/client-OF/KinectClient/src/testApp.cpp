#include "testApp.h"
#include "unistd.h"
#include <stdlib.h>
#define DEPTH_MAX 10000
void testApp::setup()
{
	ofSetLogLevel(OF_LOG_VERBOSE);
	ofSetFrameRate(60);
  
	//TODO setup fron config.xml
	//near/far mm
	//kinect resize factor
	//port
	//document root
	
	out_resize_factor = 1.;
	init_out_pix();
  
	kinect.setRegistration(true);
	kinect.setDepthClipping(100, DEPTH_MAX); //mm (50cm - DEPTH_MAX)
	kinect.enableDepthNearValueWhite(true);
  
	// ir:false, rgb:true, texture:true
	//kinect.init(false, true, true);
  kinect.init();
	kinect.open();

  ofxLibwebsockets::ClientOptions options = ofxLibwebsockets::defaultClientOptions();
  options.host = "172.16.97.207";
  options.host = "localhost";
  options.port = 9000;
  options.protocol = "of-protocol";
  options.bUseSSL = false;
  
  bool connected = client.connect( options );

  client.addListener(this);
  ofSetFrameRate(60);

}

void testApp::update()
{
  kinect.update();
	if ( ! kinect.isFrameNew() )
		return;
  
//	uint16_t *raw_depth_pix = kinect.getRawDepthPixels();
//	ofPixels depth_pix = kinect.getDepthPixelsRef();
//	depth_pix.resizeTo( out_pix );
  
	int w = 632;
	int h = 480;
  int const KB_SIZE = 5 + w*h + 3*w*h;

  UInt8 * kinect_buffer = new UInt8[KB_SIZE];
  memset(kinect_buffer, 0, KB_SIZE);
  kinect_buffer[0] = 1;
  kinect_buffer[1] = kinect_buffer[2] = kinect_buffer[3] = kinect_buffer[4] = 250;
  
  int depth_idx = 5;
  int rgb_idx = 5 + w*h;
  int depthmin = DEPTH_MAX;
  int depthmax = 0;
  for(int y = 0; y < h; y ++)//loop over pixels in the y direction
  {
    for(int x = 0; x < w; x ++)//loop over pixels in the x direction
    {
      
      ofColor c = kinect.getColorAt(x,y);
      ofVec3f v = kinect.getWorldCoordinateAt(x, y);
      
      UInt8 depth = v[2]/DEPTH_MAX*255; //TODO: fix this scaling
      depth = (depth == 0 || depth > DEPTH_MAX) ? 255: depth;
      
      kinect_buffer[depth_idx] = depth;
      kinect_buffer[rgb_idx+0] = c[0];
      kinect_buffer[rgb_idx+1] = c[1];
      kinect_buffer[rgb_idx+2] = c[2];
      depth_idx++;
      rgb_idx += 3;
    }
  }
  client.sendBinary(kinect_buffer, KB_SIZE);

  delete [] kinect_buffer;
}



void testApp::draw()
{

  //  client.send("hello");
  
	ofBackground(0);
	ofSetColor(255);
	//kinect.drawDepth(0,0);
	//kinect.draw(400,400);
  
	//instructions
	stringstream str;
	str << "out_resize_factor: " << out_resize_factor
  << " / " << out_pix.getWidth() << " x " << out_pix.getHeight()
  << " / fps " << ofGetFrameRate() << "\n"
  //<< "WebSocket server setup at port " << ofToString( server.getPort() )
  << endl;
  
  ofDrawBitmapString(str.str(), 10, 10);

}

void testApp::exit()
{
	out_pix.clear();
	kinect.close();
}

void testApp::init_out_pix()
{
	out_pix.allocate( kinect.getWidth() * out_resize_factor,
                   kinect.getHeight() * out_resize_factor,
                   1);
	out_pix.set(0);
}

void testApp::onConnect( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### on connected");
  //frame_rate = 10;
}

void testApp::onOpen( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### on open /new connection open from "
        + args.conn.getClientIP() );
}

void testApp::onClose( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### on close");
}

void testApp::onIdle( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### on idle");
}

void testApp::onMessage( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### got message!");
  ofLog(OF_LOG_NOTICE, "new TEXT message: "
        + args.message
        //          + " from "
        //          + args.conn.getClientName()
        );
  //ofLog(OF_LOG_NOTICE, args.message);
	// trace out string messages or JSON messages!
	if ( args.json != NULL)
	{
    string df_str = args.json["depthfocus"].toStyledString();
    string fr_str = args.json["framerate"].toStyledString();
    df_str.erase(std::remove(df_str.begin(), df_str.end(), '\n'), df_str.end());
    fr_str.erase(std::remove(fr_str.begin(), fr_str.end(), '\n'), fr_str.end());
    frame_rate = std::atoi(fr_str.c_str());
    int depth_center = std::atoi(df_str.c_str());
    cout << "depth_center " << frame_rate << " depth_center " << depth_center << endl;

    ofSetFrameRate(frame_rate);
    cout <<" set frame rate to " << frame_rate << endl;
		ofLog(OF_LOG_NOTICE, "new JSON message: "
          + args.json.toStyledString()
//          + " from "
//          + args.conn.getClientName()
          );
    

	}
	else
	{
		ofLog(OF_LOG_NOTICE, "new TEXT message: "
          + args.message
//          + " from "
//          + args.conn.getClientName()
          );
	}
  
	// echo server = send message right back!
	//args.conn.send( args.message );
}

void testApp::onBroadcast( ofxLibwebsockets::Event& args )
{
	ofLog(OF_LOG_NOTICE, " ### got broadcast " + args.message);
}

void testApp::keyPressed(int key)
{
}

void testApp::keyReleased(int key)
{
	float delta = 0.1;
	switch (key)
	{
		case OF_KEY_UP:
			out_resize_factor += delta;
			out_resize_factor = CLAMP(out_resize_factor, 0., 1.);
			init_out_pix();
			break;
		case OF_KEY_DOWN:
			out_resize_factor -= delta;
			out_resize_factor = CLAMP(out_resize_factor, 0., 1.);
			init_out_pix();
			break;
	}
}

void testApp::mouseMoved(int x, int y )
{
}

void testApp::mouseDragged(int x, int y, int button)
{
}

void testApp::mousePressed(int x, int y, int button)
{
//	string url = "http";
//	if ( server.usingSSL() )
//	{
//		url += "s";
//	}
//	url += "://localhost:" + ofToString( server.getPort() );
//	ofLaunchBrowser(url);
}

void testApp::mouseReleased(int x, int y, int button){}
void testApp::windowResized(int w, int h){}
void testApp::gotMessage(ofMessage msg){}
void testApp::dragEvent(ofDragInfo dragInfo){}
