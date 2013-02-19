#!/usr/bin/env python
# usage: python websocket-kinect.py server ws://localhost:9000 1

import sys, signal, numpy, pylzma, time#, freenect
from twisted.internet import reactor, threads, ssl
from twisted.web.client import WebClientContextFactory
from autobahn.websocket import WebSocketServerFactory, WebSocketServerProtocol, listenWS, WebSocketClientFactory, WebSocketClientProtocol, connectWS

class SendClientProtocol(WebSocketClientProtocol):

  def onOpen(self):
    print 'connection opened'
    self.factory.register(self)
    
  def connectionLost(self, reason):
    print 'connection lost'
    WebSocketClientProtocol.connectionLost(self, reason)
    self.factory.unregister(self)
    reactor.callLater(2, self.factory.connect)
    
class SendClientFactory(WebSocketClientFactory):
  
  protocol = SendClientProtocol

  def __init__(self, url):
    WebSocketClientFactory.__init__(self, url)
    
    self.protocolInstance = None
    self.tickGap = 5
    self.tickSetup()
    
    self.connect()
  
  def connect(self):
    contextFactory = ssl.ClientContextFactory()  # necessary for SSL; harmless otherwise
    connectWS(self, contextFactory)
    
  def tickSetup(self):
    self.dataSent = 0
    reactor.callLater(self.tickGap, self.tick)

  def tick(self):
    print 'sending: %d KB/sec' % (self.dataSent / self.tickGap / 1024)
    self.tickSetup()

  def register(self, protocolInstance):
    self.protocolInstance = protocolInstance
    
  def unregister(self, protocolInstance):
    self.protocolInstance = None
  
  def broadcast(self, msg, binary):
    self.dataSent += len(msg)
    if self.protocolInstance == None:
      return
    self.protocolInstance.sendMessage(msg, binary)

class BroadcastServerProtocol(WebSocketServerProtocol):
  
  def onOpen(self):
    self.factory.register(self)
  
  def connectionLost(self, reason):
    WebSocketServerProtocol.connectionLost(self, reason)
    self.factory.unregister(self)

class BroadcastServerFactory(WebSocketServerFactory):
  
  protocol = BroadcastServerProtocol
  
  def __init__(self, url):
    WebSocketServerFactory.__init__(self, url)
    self.clients = []
    self.tickGap = 5
    self.tickSetup()
    
    listenWS(self)
    
  def tickSetup(self):
    self.dataSent = 0
    reactor.callLater(self.tickGap, self.tick)
  
  def tick(self):
    print 'broadcasting: %d KB/sec' % (self.dataSent / self.tickGap / 1024)
    self.tickSetup()
  
  def register(self, client):
    if not client in self.clients:
      print "registered client: " + client.peerstr
      self.clients.append(client)
  
  def unregister(self, client):
    if client in self.clients:
      print "unregistered client: " + client.peerstr
      self.clients.remove(client)
  
  def broadcast(self, msg, binary = False):
    self.dataSent += len(msg)
    for c in self.clients:
      c.sendMessage(msg, binary)
 
class Kinect:
  
  def __init__(self, wsFactory):
    self.wsFactory = wsFactory
    
    self.useEvery = 1
    self.h = 480 / self.useEvery
    self.w = 632 / self.useEvery
    
    self.useCols, self.useRows = numpy.indices((self.h, self.w))
    self.useCols *= self.useEvery
    self.useRows *= self.useEvery
    
    self.pixelDiffs = False
    
    self.medianOf = 3  # must be odd, or we'll get artefacts; 3 or 5 are the sweet spot
    zeros = numpy.zeros((self.h, self.w))
    self.depths = []
    for i in range(self.medianOf - 1):
      self.depths.append(zeros)
    
    self.currentFrame = 0
    self.keyFrameEvery = 60
    self.videoReady = False
    self.depthReady = False
    self.depthData = []
    self.videoData = []

  def GetPointCloud(self):

    depth, timestamp = freenect.sync_get_depth()
    video, timestamp = freenect.sync_get_video()

    depth = depth[self.useCols, self.useRows]
    video = video[self.useCols, self.useRows]
    # # median of this + previous frames: reduces noise, and greatly improves compression on similar frames
    # if self.medianOf > 1:
    #   self.depths.insert(0, depth0)
    #   depth = numpy.median(numpy.dstack(self.depths), axis = 2).astype(numpy.int16)
    #   self.depths.pop()
    # else:
    #   depth = depth0
    
    # rescale depths
    numpy.clip(depth, 0, 2 ** 10 - 1, depth)
    depth >>= 2
    
    # calculate quadrant averages (used to pan camera; could otherwise be done in JS)
    h, w = self.h, self.w
    halfH, halfW = h / 2, w / 2
    qtl = numpy.mean(depth[0:halfH, 0:halfW])
    qtr = numpy.mean(depth[0:halfH, halfW:w])
    qbl = numpy.mean(depth[halfH:h, 0:halfW])
    qbr = numpy.mean(depth[halfH:h, halfW:w])
    
    depth = depth.ravel()  # 1-D version
    video = video.ravel()

    # calculate diff from last frame (unless it's a keyframe)
    keyFrame = self.currentFrame == 0
    keyFrame = True
    diffDepth = depth if keyFrame else depth - self.lastDepth
    
    # optionally produce pixel diffs (oddly, pixel diffing seems to *increase* compressed data size)
    if self.pixelDiffs:
      diffDepth = numpy.concatenate(([diffDepth[0]], numpy.diff(diffDepth)))
   
    # smush data together
    depthData = numpy.concatenate(([keyFrame, qtl, qtr, qbl, qbr], diffDepth % 256))

    # setup for next frame
    self.lastDepth = depth
    self.lastVideo = depth
    self.currentFrame += 1
    self.currentFrame %= self.keyFrameEvery

    data = numpy.concatenate((depthData, video), axis=0)

    return data

# # recording loop
#   def runloop(self):
#     for i in range(1,100):
#     #while self.kinecting:
#       pc_data = self.GetPointCloud()
#       pc_data = pc_data.astype(numpy.uint8)
#       numpy.save("file"+format(i), pc_data)
#       #pc_data = numpy.load("file"+format(i)+".npy")
#       #i = i%9+1
      
#       print "runloop", len(pc_data)
#       time.sleep(0.025)
#       #time.sleep(.5)
#       reactor.callFromThread(self.wsFactory.broadcast, pc_data.tostring(), True)

#playback loop
  def runloop(self):
    i = 1;
    while self.kinecting:
      # pc_data = self.GetPointCloud()
      # pc_data = pc_data.astype(numpy.uint8)
      # numpy.save("file"+format(i), pc_data)
      pc_data = numpy.load("data/file"+format(i)+".npy")
      i = i%99+1
      
      print "runloop", len(pc_data)
      #time.sleep(0.025)
      time.sleep(1)
      reactor.callFromThread(self.wsFactory.broadcast, pc_data.tostring(), True)




  def runPCInOtherThread(self):
    self.kinecting = True
    #reactor.callInThread(freenect.runloop, depth = self.depthCallback, video = self.videoCallback, body = self.bodyCallback)
    reactor.callInThread(self.runloop)

  def depthCallback(self, dev, depth, timestamp):
    # resize grid
    depth0 = depth[self.useCols, self.useRows]
    
    # median of this + previous frames: reduces noise, and greatly improves compression on similar frames
    if self.medianOf > 1:
      self.depths.insert(0, depth0)
      depth = numpy.median(numpy.dstack(self.depths), axis = 2).astype(numpy.int16)
      self.depths.pop()
    else:
      depth = depth0
    
    # rescale depths
    numpy.clip(depth, 0, 2 ** 10 - 1, depth)
    depth >>= 2
    
    # calculate quadrant averages (used to pan camera; could otherwise be done in JS)
    h, w = self.h, self.w
    halfH, halfW = h / 2, w / 2
    qtl = numpy.mean(depth[0:halfH, 0:halfW])
    qtr = numpy.mean(depth[0:halfH, halfW:w])
    qbl = numpy.mean(depth[halfH:h, 0:halfW])
    qbr = numpy.mean(depth[halfH:h, halfW:w])
    
    depth = depth.ravel()  # 1-D version
    
    # calculate diff from last frame (unless it's a keyframe)
    keyFrame = self.currentFrame == 0
    keyFrame = True
    diffDepth = depth if keyFrame else depth - self.lastDepth
    
    # optionally produce pixel diffs (oddly, pixel diffing seems to *increase* compressed data size)
    if self.pixelDiffs:
      diffDepth = numpy.concatenate(([diffDepth[0]], numpy.diff(diffDepth)))
   
    # smush data together
    self.depthData = numpy.concatenate(([keyFrame, qtl, qtr, qbl, qbr], diffDepth % 256))
    self.depthReady = True
    # compress and broadcast
    
    # setup for next frame
    self.lastDepth = depth
    self.currentFrame += 1
    self.currentFrame %= self.keyFrameEvery

  def videoCallback(self, dev, video, timestamp):
    # resize grid
    video = video[self.useCols, self.useRows]
    #print len(video), len(video[0]), len(video[0][0]), len(self.useCols), len(self.useRows)
    self.videoData = video.ravel()  # 1-D version
    self.videoReady = True

    self.lastVideo = video
    self.currentFrame += 1
    self.currentFrame %= self.keyFrameEvery

  def bodyCallback(self, *args):
    if self.videoReady and self.depthReady:#blocking method here, killing efficiency
      data = numpy.concatenate((self.depthData, self.videoData), axis=0)
      self.videoReady = False
      self.depthReady = False     # data = numpy.zeros(10);
      # for i in range(10): data[i] = i
      data = data.astype(numpy.uint8)
      start= time.clock()
      print "bodyCallBack: " , len(data)

      reactor.callFromThread(self.wsFactory.broadcast, data.tostring(), True)
      
      end= time.clock()
      elapsed= (end-start)

    if not self.kinecting: raise freenect.Kill
  
  def runInOtherThread(self):
    self.kinecting = True
    reactor.callInThread(freenect.runloop, depth = self.depthCallback, video = self.videoCallback, body = self.bodyCallback)
  
  def stop(self):
    self.kinecting = False


def signalHandler(signum, frame):
  kinect.stop()
  reactor.stop()
print sys.argv, len(sys.argv)
func = sys.argv[1] if len(sys.argv) > 1 else 'server'
url  = sys.argv[2] if len(sys.argv) > 2 else 'ws://localhost:9000'
pc = sys.argv[3] if len(sys.argv) > 3 else 0
print func, url, pc
signal.signal(signal.SIGINT, signalHandler)
print '>>> %s --- Press Ctrl-C to stop <<<' % url


factory = BroadcastServerFactory(url) if func == 'server' else SendClientFactory(url)
kinect = Kinect(factory)
if pc == '1':
  kinect.runPCInOtherThread()
else:
    kinect.runInOtherThread()

reactor.run()
