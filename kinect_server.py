import freenect
import zmq
import numpy as np
import json
import time
#import cv

def get_depth():
  return freenect.sync_get_depth()[0]
def get_rgb():
  return freenect.sync_get_video()[0]

def ping_kinect():
  cv.NamedWindow('Depth')
  cv.NamedWindow('RGB')
  keep_running = True


  def display_depth(dev, data, timestamp):
    global keep_running
    cv.ShowImage('Depth', frame_convert.pretty_depth_cv(data))
    if cv.WaitKey(10) == 27:
      keep_running = False


  def display_rgb(dev, data, timestamp):
    global keep_running
    cv.ShowImage('RGB', frame_convert.video_cv(data))
    if cv.WaitKey(10) == 27:
      keep_running = False


  def body(*args):
    if not keep_running:
      raise freenect.Kill


  print('Press ESC in window to stop')
  freenect.runloop(depth=display_depth,
                   video=display_rgb,
                   body=body)

def print_kinect():
  
  depth = pretty_depth(get_depth())
  video = get_rgb()
  data = {}
  data['depth'] = depth.tolist()
  data['color'] = video.tolist()
  json_to_send = json.dumps(data)

  print 'video shape', video.shape
  print 'depth shape', depth.shape
  print 'min ' , np.amin(depth)
  print 'max ' , np.amax(depth)

  obj = open('justoneframe.txt', 'wb')
  obj.write(str(json_to_send))
  obj.close

def push_kinect():
  
  context = zmq.Context()
  socket = context.socket(zmq.PUB)
  socket.bind("tcp://*:80")
  
  print 'beginning send loop, i hope this goes somewhere'
  i = 0

  while 1:
    i = i + 1

    depth = get_depth()
    video = get_rgb()

    data = {}
    data['depth'] = depth.tolist()
    data['color'] = video.tolist()
    json_to_send = json.dumps(data)

    print 'sending package', i, str(data).__len__()
    socket.send(json_to_send)
    time.sleep(1)
  
def main():
  push_kinect()

if __name__ == '__main__':
  main()