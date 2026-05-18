import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book } from 'lucide-react';
import { AUTO_DICTIONARY } from '../constants';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (name: string) => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  onSelectPart,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded p-8 w-full max-w-4xl shadow-2xl h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-brand-accent p-2 rounded-xl text-white block">
                  <Book size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Dicionário Técnico</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Catálogo de Componentes Comuns</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
              {AUTO_DICTIONARY.map((category) => (
                <div key={category.name}>
                  <h3 className="text-sm font-black text-brand-accent uppercase tracking-tighter mb-4 flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-brand-accent/20"></span>
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {category.parts.map((part) => (
                      <button
                        key={part.name}
                        onClick={() => {
                          onSelectPart(part.name);
                          onClose();
                        }}
                        className="text-left bg-gray-50 hover:bg-brand-accent hover:text-white border border-gray-100 rounded-xl p-4 transition-all group"
                      >
                        <p className="text-sm font-bold tracking-tight">{part.name}</p>
                        <p className="text-[10px] opacity-60 font-mono mt-1 group-hover:opacity-100">Vida: {part.lifecycle.toLocaleString()} km</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center shrink-0">
              <p className="text-gray-400 text-xs italic">
                Este dicionário contém os componentes mais comuns. Você também pode digitar manualmente qualquer outra peça na tela anterior.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
