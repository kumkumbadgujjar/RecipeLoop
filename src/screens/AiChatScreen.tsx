import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage } from '../types/recipe';
import { sendChatMessage } from '../services/aiChatService';
import { MyTopBar } from '../components/MyTopBar';

interface AiChatScreenProps {
  onBack: () => void;
}

// Initial friendly greeting from RecipeLoop AI
const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'model',
  content:
    "Hello Chef! 🍳 I'm RecipeLoop AI, your personal culinary assistant and conversation partner. Ask me anything—whether it's cooking tips, meal ideas from whatever is in your fridge, wine pairings, or everyday topics!",
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  'What can I cook with chicken and rice?',
  'Suggest a 20-minute vegetarian dinner',
  'What is a good substitute for heavy cream?',
  'Tips for making fluffy sourdough pancakes',
];

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: {
        [index: number]: { transcript: string };
        isFinal: boolean;
      };
    };
  }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export const AiChatScreen: React.FC<AiChatScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [INITIAL_MESSAGE];
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [readAloudEnabled, setReadAloudEnabled] = useState<boolean>(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Speak aloud function using Web Speech Synthesis
  const speakText = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      // Clean markdown tags for natural speech
      const cleanedText = text
        .replace(/[*_#`~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/🍳|🥗|🥘|🍝|🍲|✨|👉|🔥/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (messageId) {
        setSpeakingMessageId(messageId);
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
      }

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Send message flow
  const handleSend = async (textToSend?: string, isVoice = false) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isLoading) return;

    // Stop ongoing speech
    stopSpeaking();

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSpeechError(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        history: messages,
      });

      const modelMessageId = `model-${Date.now()}`;
      const modelMessage: ChatMessage = {
        id: modelMessageId,
        role: 'model',
        content: response.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);

      if (readAloudEnabled && response.reply && !response.error) {
        speakText(response.reply, modelMessageId);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: 'I had trouble connecting. Please check your network or server setup.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Voice Recognition (Speech-to-Text)
  const toggleListening = () => {
    setSpeechError(null);

    // Stop speaking if AI is talking
    stopSpeaking();

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            setInputText(event.results[i][0].transcript);
          }
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          setIsListening(false);
          recognition.stop();
          // Automatically submit final recognized speech
          handleSend(finalTranscript, true);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please tap the microphone and speak again.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setIsListening(false);
      const msg = err instanceof Error ? err.message : 'Could not initialize speech recognition';
      setSpeechError(msg);
    }
  };

  // Reset conversation
  const handleReset = () => {
    stopSpeaking();
    setMessages([INITIAL_MESSAGE]);
    setSpeechError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFFDFB]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-neutral-200/80 shadow-xs">
        <div className="flex items-center">
          <MyTopBar title="RecipeLoop AI" onBackClick={onBack} />
        </div>

        <div className="flex items-center gap-1">
          {/* Read Aloud Toggle */}
          <button
            type="button"
            onClick={() => {
              if (speakingMessageId) stopSpeaking();
              setReadAloudEnabled(!readAloudEnabled);
            }}
            title={readAloudEnabled ? 'Voice responses ON' : 'Voice responses OFF'}
            className={`p-2 rounded-full transition cursor-pointer ${
              readAloudEnabled
                ? 'text-[#FF5722] bg-[#FF5722]/10 hover:bg-[#FF5722]/20'
                : 'text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {readAloudEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleReset}
            title="Start fresh conversation"
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-[#FF5722] text-white'
                    : 'bg-white border border-[#FF5722]/30 text-[#FF5722]'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-xs text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#FF5722] text-white rounded-tr-xs'
                    : 'bg-white border border-neutral-200/90 text-neutral-800 rounded-tl-xs'
                }`}
              >
                {/* Voice input indicator for user message */}
                {isUser && msg.isVoiceInput && (
                  <div className="flex items-center gap-1 text-[11px] text-white/80 mb-1">
                    <Mic className="w-3 h-3" />
                    <span>Spoken input</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Bottom Row (Time + Audio Button for AI) */}
                <div
                  className={`mt-1.5 flex items-center justify-between gap-3 text-[11px] ${
                    isUser ? 'text-white/70' : 'text-neutral-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          speakText(msg.content, msg.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#FF5722] transition cursor-pointer"
                      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-[#FF5722] animate-pulse" />
                          <span className="text-[#FF5722] font-semibold">
                            Speaking...
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Speak</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing / Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white border border-[#FF5722]/30 text-[#FF5722] flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-neutral-200/90 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" />
            </div>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="flex-1">{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-red-500 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Listening Voice Waveform Indicator */}
        {isListening && (
          <div className="flex items-center justify-center p-3 bg-[#FF5722]/10 border border-[#FF5722]/30 rounded-2xl text-[#FF5722] text-sm animate-pulse gap-2">
            <Mic className="w-5 h-5 text-[#FF5722] animate-bounce" />
            <span className="font-semibold">
              Listening to you... Speak now!
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (shown when conversation is new or idle) */}
      {messages.length <= 2 && !isLoading && !isListening && (
        <div className="max-w-3xl w-full mx-auto px-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Suggested questions:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs bg-white border border-neutral-200/90 text-neutral-700 hover:border-[#FF5722] hover:text-[#FF5722] transition whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <footer className="sticky bottom-0 bg-white border-t border-neutral-200/80 p-3 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl w-full mx-auto flex items-center gap-2"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop listening' : 'Speak to AI'}
            className={`p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-[#FF5722]/10 hover:text-[#FF5722]'
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening ? 'Listening...' : 'Ask anything or talk about food...'
            }
            disabled={isLoading}
            className="flex-1 h-11 bg-neutral-100 rounded-full px-4 text-sm text-neutral-800 placeholder-neutral-400 outline-hidden focus:bg-white focus:ring-2 focus:ring-[#FF5722]/40 transition border border-transparent focus:border-[#FF5722]/40"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className={`p-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-[#FF5722] text-white hover:bg-[#F4511E] shadow-xs active:scale-95'
                : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};
