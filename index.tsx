import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import io from 'socket.io-client';
import { HexColorPicker } from 'react-colorful';
import { FiImage, FiType, FiSave, FiDownload, FiSend, FiCheck } from 'react-icons/fi';

const DesignEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [color, setColor] = useState('#000000');
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [comments, setComments] = useState<any[]>([]);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isDesigner, setIsDesigner] = useState(true); // Toggle between designer and brand team

  // Initialize canvas and socket
  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setCanvas(initCanvas);

    // Connect to Socket.io
    const socket = io('http://localhost:5000');
    setSocket(socket);

    // Listen for comments
    socket.on('commentAdded', (newComment) => {
      setComments(prev => [...prev, newComment]);
      addCommentMarker(newComment);
    });

    socket.on('commentResolved', (resolvedCommentId) => {
      setComments(prev => prev.map(comment => 
        comment._id === resolvedCommentId ? { ...comment, resolved: true } : comment
      ));
      removeCommentMarker(resolvedCommentId);
    });

    return () => {
      initCanvas.dispose();
      socket.disconnect();
    };
  }, []);

  const addCommentMarker = (comment: any) => {
    if (!canvas) return;
    
    const marker = new fabric.Circle({
      radius: 10,
      fill: comment.resolved ? 'green' : 'red',
      left: comment.x,
      top: comment.y,
      selectable: false,
      data: { commentId: comment._id },
    });

    marker.on('mousedown', () => {
      setActiveComment(comment._id);
    });

    canvas.add(marker);
    canvas.renderAll();
  };

  const removeCommentMarker = (commentId: string) => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    const marker = objects.find(obj => obj.data?.commentId === commentId);
    if (marker) {
      canvas.remove(marker);
      canvas.renderAll();
    }
  };

  const addText = () => {
    if (!canvas || !text) return;
    
    const textObj = new fabric.Textbox(text, {
      left: 100,
      top: 100,
      fontSize,
      fill: color,
      width: 200,
      editable: true,
    });
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    setText('');
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      fabric.Image.fromURL(event.target.result.toString(), (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.renderAll();
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: any) => {
    if (isDesigner || !canvas || !socket || !designId) return;
    
    const pointer = canvas.getPointer(e.e);
    const commentText = prompt('Enter your feedback:');
    
    if (commentText) {
      const newComment = {
        designId,
        x: pointer.x,
        y: pointer.y,
        text: commentText,
        resolved: false,
      };
      
      socket.emit('addComment', newComment);
    }
  };

  const resolveComment = (commentId: string) => {
    if (!socket) return;
    socket.emit('resolveComment', commentId);
  };

  const saveDesign = async () => {
    if (!canvas || !designId) return;
    
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: designId,
          data: dataUrl,
        }),
      });
      
      const result = await response.json();
      if (!designId) setDesignId(result.id);
    } catch (error) {
      console.error('Error saving design:', error);
    }
  };

  const exportDesign = () => {
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Design Editor</h1>
        
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => setIsDesigner(!isDesigner)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isDesigner ? 'Designer Mode' : 'Brand Team Mode'}
          </button>
        </div>
        
        <div className="flex gap-8">
          {/* Toolbar */}
          <div className="w-64 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Tools</h2>
            
            {isDesigner && (
              <>
                <div className="mb-4">
                  <label className="block mb-2">Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter text"
                  />
                  <button
                    onClick={addText}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    <FiType /> Add Text
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span>{fontSize}px</span>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Color</label>
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                  >
                    <FiImage /> Add Image
                  </label>
                </div>
              </>
            )}
            
            <div className="mt-6">
              <button
                onClick={saveDesign}
                className="flex items-center gap-2 w-full px-4 py-2 bg-green-500 text-white rounded mb-2"
              >
                <FiSave /> Save Design
              </button>
              
              <button
                onClick={exportDesign}
                className="flex items-center gap-2 w-full px-4 py-2 bg-purple-500 text-white rounded"
              >
                <FiDownload /> Export as PNG
              </button>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded shadow">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="border border-gray-300"
              />
            </div>
          </div>
          
          {/* Comments Panel */}
          <div className="w-64 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Feedback</h2>
            
            {comments.length === 0 ? (
              <p>No feedback yet</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`p-3 rounded ${comment._id === activeComment ? 'bg-blue-100' : 'bg-gray-50'} ${comment.resolved ? 'opacity-50' : ''}`}
                    onClick={() => setActiveComment(comment._id)}
                  >
                    <p>{comment.text}</p>
                    {isDesigner && !comment.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveComment(comment._id);
                        }}
                        className="mt-2 flex items-center gap-1 text-sm text-green-600"
                      >
                        <FiCheck /> Mark as resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
