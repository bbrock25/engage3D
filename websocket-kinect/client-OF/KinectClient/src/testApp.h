#pragma once

#include "ofMain.h"
#include "ofxKinect.h"
#include "ofxLibwebsockets.h"
#include <ctime>

class testApp : public ofBaseApp
{
  
public:
	void setup();
	void update();
	void draw();
	void exit();
  
	void keyPressed  (int key);
	void keyReleased(int key);
	void mouseMoved(int x, int y );
	void mouseDragged(int x, int y, int button);
	void mousePressed(int x, int y, int button);
	void mouseReleased(int x, int y, int button);
	void windowResized(int w, int h);
	void dragEvent(ofDragInfo dragInfo);
	void gotMessage(ofMessage msg);
  
	ofxKinect kinect;
  ofxLibwebsockets::Server server;
  ofxLibwebsockets::Client client;
	ofPixels out_pix;
	float out_resize_factor;
  int frame_rate;
  
	void init_out_pix();
  
  // websocket methods
  void onConnect( ofxLibwebsockets::Event& args );
  void onOpen( ofxLibwebsockets::Event& args );
  void onClose( ofxLibwebsockets::Event& args );
  void onIdle( ofxLibwebsockets::Event& args );
  void onMessage( ofxLibwebsockets::Event& args );
  void onBroadcast( ofxLibwebsockets::Event& args );
};
