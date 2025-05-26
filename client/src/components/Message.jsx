import { useState, useRef, useEffect } from "react";

function Message() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!", sender: "other", time: "10:30 AM" },
    { id: 2, text: "Hi! How are you?", sender: "me", time: "10:31 AM" },
    {
      id: 3,
      text: "I'm good, thanks for asking. How about you?",
      sender: "other",
      time: "10:32 AM",
    },
    {
      id: 4,
      text: "Pretty good! Just working on some code.",
      sender: "me",
      time: "10:33 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: Date.now(), 
      text: newMessage.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const replies = [
        "Thanks for your message!",
        "That's interesting!",
        "I see what you mean.",
        "Got it!",
        "Sounds good!",
        "Nice to hear from you!",
        "How's your day going?",
        "That's cool!",
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg = {
        id: Date.now() + 1,
        text: randomReply,
        sender: "other",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-96 bg-gray-100 max-w-5xl mx-auto border-l border-r border-gray-300 rounded-lg overflow-hidden shadow-lg">
      
      <div className="bg-green-300 text-white p-4 flex items-center shadow-md">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
          <span className="text-gray-900 font-semibold">JD</span>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">John Doe</h1>
          <p className="text-xs opacity-80">
            {isTyping ? "typing..." : "online"}
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="relative group">
            <button className="hover:bg-green-200 p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5 text-red-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
            <span className="absolute top-7 left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
              Delete
            </span>
          </div>
          <div className="relative group">
            <button className="hover:bg-green-200 p-1 rounded">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="house_keeping" data-name="house keeping">
                  <path
                    className="cls-1"
                    fill="#231f20"
                    d="m23 23.38-1-3.81V17.5a.51.51 0 0 0-.22-.42L19 15.23V2.5a1.5 1.5 0 0 0-3 0V3h-1V1.5a.5.5 0 0 0-.5-.5H5.72a4.06 4.06 0 0 0-3.51 2h-.27a.94.94 0 0 0-.94.94v1.12a.94.94 0 0 0 .94.94H2v3.1a1.91 1.91 0 0 0 1 1.68l1 10.76a.51.51 0 0 0 .5.46h7.87L12 23.38a.48.48 0 0 0 .09.43.49.49 0 0 0 .39.19h10a.53.53 0 0 0 .4-.19.52.52 0 0 0 .12-.43zM21 19h-7v-1.23L16.65 16h1.7L21 17.77zm-5-8.22v4.47l-.46.31zM18 15h-1v-1h1zM17 2.5a.5.5 0 0 1 1 0V13h-1V2.5zM5.72 2H14v1H3.44a3.08 3.08 0 0 1 2.28-1zM2.5 4H16v1H2.5a.46.46 0 0 0-.23.06H2L1.94 4zM3 6h13v3.1a.9.9 0 0 1-.9.9H3.9a.9.9 0 0 1-.9-.9zm2 15-.95-10H15l-.47 5.25-1.26.83a.51.51 0 0 0-.22.42v2l-.43 1.5zm8.18 2 .77-3H15v.49a.5.5 0 0 0 .49.51.51.51 0 0 0 .5-.49V20h1v.49a.5.5 0 0 0 .49.51.51.51 0 0 0 .5-.49V20h1v.49a.5.5 0 0 0 .49.51.51.51 0 0 0 .5-.49V20h1.07l.77 3z"
                  />
                  <path
                    className="cls-1"
                    fill="#231f20"
                    d="M8.81 17h-.5l.11-.23a.49.49 0 0 0-.22-.67.5.5 0 0 0-.67.22l-.48 1a.51.51 0 0 0 0 .48.52.52 0 0 0 .45.2h1.31a.5.5 0 0 0 .5-.5.51.51 0 0 0-.5-.5zM10.24 15a.52.52 0 0 0 .22-.68l-.51-1a.5.5 0 0 0-.9 0l-.76 1.53a.5.5 0 0 0 .22.67.46.46 0 0 0 .23 0 .48.48 0 0 0 .44-.28l.32-.63.07.13a.5.5 0 0 0 .67.26zM11.22 15.82a.5.5 0 0 0-.67-.23.49.49 0 0 0-.22.67l.36.74h-.23a.5.5 0 0 0 0 1h1a.49.49 0 0 0 .42-.24.48.48 0 0 0 0-.48z"
                  />
                </g>
              </svg>
            </button>
            <span className="absolute top-7 left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
              Clear
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-3 ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg shadow-sm ${
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
          </div>
        ))}

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
  );
}

export default Message;
