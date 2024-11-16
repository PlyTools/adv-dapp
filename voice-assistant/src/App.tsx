import { Bot } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-white/30 backdrop-blur-sm">
            <Bot className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Meet Liam
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your AI voice assistant powered by OpenAI. Have natural conversations and get help with anything you need.
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Background Card */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl"></div>
          
          {/* Content Container */}
          <div className="relative p-8 flex flex-col items-center">
            {/* Voice Assistant Widget */}
            <div className="w-[400px] h-[600px] relative">
              <iframe 
                id="audio_iframe"
                src="https://widget.synthflow.ai/widget/v2/1731764929541x262282493576913470/1731764929457x375926099300899100"
                allow="microphone"
                width="400"
                height="600"
                style={{
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}
              />
            </div>

            {/* Features List */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-all"
                >
                  <div className="text-indigo-600 mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Natural Conversations",
    description: "Engage in fluid, context-aware discussions with advanced AI understanding."
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Voice Recognition",
    description: "Crystal-clear voice recognition for seamless verbal communication."
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "24/7 Assistance",
    description: "Get help anytime with your AI assistant always ready to support you."
  }
];

export default App;