
import React, { useState, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import DiceCategory from './components/DiceCategory';
import { initialDiceData } from './constants';
import { CopyIcon } from './components/Icons';

const PROMPT_TEMPLATE = "A young woman, **descriptive adjective**, with **hair color** hair in a **hairstyle**, **build**, wearing **outfit** with **accessories** while **activity**.";

interface PromptPart {
  type: 'static' | 'dynamic';
  value: string;
  category?: string;
  isError?: boolean;
}

const parseTemplate = (template: string): PromptPart[] => {
    const parts: PromptPart[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'static', value: template.substring(lastIndex, match.index) });
        }
        const category = match[1];
        parts.push({ type: 'dynamic', value: category, category, isError: false });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.length) {
        parts.push({ type: 'static', value: template.substring(lastIndex) });
    }

    return parts;
};

const promptPartsToString = (parts: PromptPart[]): string => {
    return parts.map(p => p.value).join('').trim();
};


const App: React.FC = () => {
  const [diceData, setDiceData] = useLocalStorage('promptDiceData', initialDiceData);
  const [promptParts, setPromptParts] = useState<PromptPart[]>(() => parseTemplate(PROMPT_TEMPLATE));
  const [history, setHistory] = useLocalStorage<string[]>('promptHistory', []);
  const [isCopied, setIsCopied] = useState(false);


  const handleAddValue = useCallback((category: string, value: string) => {
    if (value.trim() === '') return;
    setDiceData(prevData => ({
      ...prevData,
      [category]: [...(prevData[category] || []), value.trim()],
    }));
  }, [setDiceData]);

  const handleUpdateValue = useCallback((category: string, index: number, newValue: string) => {
    if (newValue.trim() === '') return;
    setDiceData(prevData => {
      const newValues = [...(prevData[category] || [])];
      newValues[index] = newValue.trim();
      return { ...prevData, [category]: newValues };
    });
  }, [setDiceData]);

  const handleDeleteValue = useCallback((category: string, index: number) => {
    setDiceData(prevData => {
      const newValues = [...(prevData[category] || [])];
      newValues.splice(index, 1);
      return { ...prevData, [category]: newValues };
    });
  }, [setDiceData]);

  const handleGeneratePrompt = () => {
    const newPromptParts = promptParts.map(part => {
      if (part.type === 'dynamic' && part.category) {
        const category = part.category;
        const values = diceData[category];
        if (values && values.length > 0) {
          const randomIndex = Math.floor(Math.random() * values.length);
          const randomValue = values[randomIndex].replace(/'/g, ''); // Remove apostrophes
          return { ...part, value: randomValue, isError: false };
        }
        return { ...part, value: `[No values for ${category}]`, isError: true };
      }
      return part;
    });
    setPromptParts(newPromptParts);

    const newPromptString = promptPartsToString(newPromptParts);
    setHistory(prev => [newPromptString, ...prev].slice(0, 10));
  };
  
  const handlePartChange = (index: number, newValue: string) => {
    const newParts = [...promptParts];
    const currentPart = newParts[index];
    newParts[index] = { ...currentPart, value: newValue ?? '', isError: false }; // Clear error on edit
    setPromptParts(newParts);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to the default values? This cannot be undone.')) {
        setDiceData(initialDiceData);
        setPromptParts(parseTemplate(PROMPT_TEMPLATE));
        setHistory([]);
    }
  };

  const handleCopyPrompt = () => {
      const promptText = promptPartsToString(promptParts);
      // Don't copy if the prompt is just the template
      if (promptText && !promptText.includes('**')) {
          navigator.clipboard.writeText(promptText).then(() => {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
          }).catch(err => {
              console.error("Failed to copy text:", err);
          });
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500">
            Prompt Dice Roller
          </h1>
          <p className="mt-2 text-lg text-gray-400">Craft your perfect inspiration by customizing your dice.</p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-cyan-300">Generated Prompt</h2>
            <div 
              className="bg-gray-900 p-4 rounded-lg text-lg leading-relaxed min-h-[6rem] flex items-center justify-center flex-wrap text-center transition-all"
            >
              {promptParts.map((part, index) => {
                if (part.type === 'static') {
                  return <span key={index}>{part.value}</span>;
                } else {
                  const isError = part.isError;
                  return (
                    <span
                      key={`${part.category}-${index}`}
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handlePartChange(index, e.currentTarget.textContent || '')}
                      className={`font-semibold outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-700/50 rounded px-1 transition-all ${isError ? 'text-red-400' : 'text-cyan-400'}`}
                      dangerouslySetInnerHTML={{ __html: part.value }}
                    />
                  );
                }
              })}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleGeneratePrompt}
                    className="w-full flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Roll the Dice & Generate
                </button>
                <button
                    onClick={handleCopyPrompt}
                    disabled={isCopied}
                    className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCopied ? 'Copied!' : 'Copy Prompt'}
                </button>
                <button
                    onClick={handleResetData}
                    className="w-full sm:w-auto bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300"
                >
                    Reset Data
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(diceData).map(category => (
              <DiceCategory
                key={category}
                title={category}
                values={diceData[category]}
                onAddValue={(value) => handleAddValue(category, value)}
                onUpdateValue={(index, newValue) => handleUpdateValue(category, index, newValue)}
                onDeleteValue={(index) => handleDeleteValue(category, index)}
              />
            ))}
          </div>
        </main>
        
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-cyan-300">Prompt History</h2>
            {history.length > 0 ? (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {history.map((prompt, index) => (
                        <div key={index} className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex justify-between items-center transition-all hover:border-purple-500/50">
                            <p className="text-gray-300 leading-relaxed">{prompt}</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(prompt)}
                                className="ml-4 p-2 text-gray-400 bg-gray-700/50 rounded-lg opacity-0 group-hover:opacity-100 hover:text-cyan-400 hover:bg-gray-700 transition-all"
                                aria-label="Copy prompt"
                            >
                                <CopyIcon />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 bg-gray-800/50 rounded-lg py-8">
                    <p>Your generated prompts will appear here.</p>
                </div>
            )}
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
