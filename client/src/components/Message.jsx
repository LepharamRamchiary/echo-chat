import { useState, useRef, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function Message() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  // Get current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch(`${API_BASE_URL}/api/v1/user/current-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/message`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedMessages = data.data.messages.map((msg, index) => ({
          id: msg._id || index,
          text: msg.content,
          sender: msg.type === "sent" ? "me" : "other",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: msg.type
        }));
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      setIsTyping(true);

      const response = await fetch(`${API_BASE_URL}/api/v1/message/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add the sent message immediately
        const sentMsg = {
          id: data.data.sentMessage._id,
          text: data.data.sentMessage.content,
          sender: "me",
          time: new Date(data.data.sentMessage.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: "sent"
        };

        setMessages(prev => [...prev, sentMsg]);
        setNewMessage("");

        // Add received messages with a small delay for better UX
        setTimeout(() => {
          const receivedMessages = data.data.responses.map(response => ({
            id: response._id,
            text: response.content,
            sender: "other",
            time: new Date(response.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            type: "received"
          }));

          setMessages(prev => [...prev, ...receivedMessages]);
          setIsTyping(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/message/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleClearAllMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/message/clear-all`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearAllClick = () => {
    setShowClearAllDialog(true);
  };

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteDialog(true);
  };

  const confirmClearAll = () => {
    handleClearAllMessages();
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete);
      setMessageToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 sm:mt-24 bg-gray-100 sm:max-w-5xl sm:mx-auto border-l border-r border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-96 sm:mt-24 bg-gray-100 sm:max-w-5xl sm:mx-auto border-l border-r border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-green-500 text-white p-4 flex items-center shadow-md">
          <div className="w-10 h-10 rounded-full bg-green-600 mr-3 flex items-center justify-center">
            <span className="text-white font-semibold">
              {user ? getInitials(user.fullname) : "?"}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-semibold">
              {user ? user.fullname : "Loading..."}
            </h1>
            <p className="text-xs opacity-80">
              {user ? (user.isVerified ? "verified" : "unverified") : ""}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="relative group">
              <button 
                onClick={handleClearAllClick}
                className="hover:bg-green-400 p-2 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                Clear All
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex-1 p-4 overflow-y-auto"
          style={{
            background: "#e5ddd5",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 group ${
                  message.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-end max-w-xs lg:max-w-sm">
                  <div
                    className={`px-3 py-2 rounded-lg shadow-sm relative ${
                      message.sender === "me"
                        ? "bg-green-100 border border-green-200"
                        : "bg-white border border-gray-200"
                    }`}
                    style={{
                      borderRadius:
                        message.sender === "me"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                    }}
                  >
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {message.text}
                    </p>
                    <div
                      className={`flex items-center mt-1 ${
                        message.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p className="text-xs text-gray-500">{message.time}</p>
                      {message.sender === "me" && (
                        <svg
                          className="w-4 h-4 ml-1 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {message.sender === "me" && (
                    <button
                      onClick={() => handleDeleteClick(message.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start mb-3">
              <div
                className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm"
                style={{ borderRadius: "18px 18px 18px 4px" }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <div className="flex items-center bg-white rounded-full border border-gray-300 px-3 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-500"
            />

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-1 ml-2 rounded-full transition-colors ${
                newMessage.trim()
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearAllDialog}
        onClose={() => setShowClearAllDialog(false)}
        onConfirm={confirmClearAll}
        title="Clear All Messages"
        message="Are you sure you want to clear all messages? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMessageToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}

export default Message;