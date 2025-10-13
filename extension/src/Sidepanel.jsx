import { useState, useEffect, useRef } from 'react';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { History } from 'lucide-react';
import './index.css';

const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-2', name: 'Claude 2' },
  { id: 'claude-instant', name: 'Claude Instant' },
  { id: 'palm-2', name: 'PaLM 2' },
  { id: 'llama-2-70b', name: 'Llama 2 70B' },
  { id: 'llama-2-13b', name: 'Llama 2 13B' },
  { id: 'cohere-command', name: 'Command' },
  { id: 'mistral-7b', name: 'Mistral 7B' },
];

const SUBMITTING_TIMEOUT = 200;
const STREAMING_TIMEOUT = 2000;

const Sidepanel = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState(models[0].id);
  const [userAvatar, setUserAvatar] = useState('');
  const [status, setStatus] = useState('ready');
  const timeoutRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'set-chat-input' && message.payload) {
          setText(message.payload.text || '');
        }
        if (message.type === 'speedy-highlight-added' && message.payload) {
          console.log('Highlight added:', message.payload);
        }
        if (message.type === 'add-image-to-context' && message.imageData) {
          console.log('Image added:', message.filename);
        }
      });
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
          if (userInfo && userInfo.email) {
            const avatarUrl = `https://www.google.com/s2/photos/profile/${userInfo.id}`;
            setUserAvatar(avatarUrl);
          } else {
            setUserAvatar(createAvatarPlaceholder('U'));
          }
        });
      } else {
        setUserAvatar(createAvatarPlaceholder('U'));
      }
    } catch (error) {
      console.log('Could not load user profile:', error);
      setUserAvatar(createAvatarPlaceholder('U'));
    }
  };

  const createAvatarPlaceholder = (letter) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 32, 32);
    return canvas.toDataURL();
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus('ready');
  };

  const handleSubmit = (message) => {
    if (status === 'streaming' || status === 'submitted') {
      stop();
      return;
    }
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;

    setStatus('submitted');
    console.log('Submitting message:', message);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'prompt-submit',
        payload: { message: message.text, model: model, files: message.files }
      }).catch(err => console.error('Error sending message:', err));
    }

    setTimeout(() => setStatus('streaming'), SUBMITTING_TIMEOUT);
    timeoutRef.current = setTimeout(() => {
      setStatus('ready');
      timeoutRef.current = null;
    }, STREAMING_TIMEOUT);

    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <div className="cursor-pointer p-2 rounded-lg transition-all">
          <History className="w-5 h-5 text-slate-700" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-[28px] font-bold text-slate-900 tracking-[10px]" style={{ fontFamily: "'PT Serif', serif" }}>
          robin
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer p-1 rounded-lg transition-all"
          onClick={() => console.log('User profile clicked')}
        >
          {userAvatar && (
            <img 
              src={userAvatar} 
              alt="User profile" 
              className="w-8 h-8 rounded-full border-2 border-slate-200 object-cover"
              onError={(e) => {
                e.target.src = createAvatarPlaceholder('U');
              }}
            />
          )}
        </div>
      </div>

      {/* Tab Reference Area */}
      <div className="px-5 pb-4">
        {/* Tab references will go here */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Chat messages will go here */}
      </div>

      {/* Prompt Input */}
      <div className="p-4">
        <div className="border border-gray-200 shadow-[0_2px_3px_rgba(0,0,0,0.04),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-4px_rgba(0,0,0,0.05),0_16px_24px_-8px_rgba(0,0,0,0.04),0_24px_32px_-12px_rgba(0,0,0,0.03),inset_0_0_0_1px_rgba(255,255,255,0.1)] rounded-[28px] overflow-hidden bg-white">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              ref={textareaRef}
              value={text}
              placeholder="Ask me anything..."
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputModelSelect onValueChange={setModel} value={model}>
                <PromptInputModelSelectTrigger className="border-none bg-transparent shadow-none">
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((modelOption) => (
                    <PromptInputModelSelectItem
                      key={modelOption.id}
                      value={modelOption.id}
                    >
                      {modelOption.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputToolbar>
        </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default Sidepanel;
