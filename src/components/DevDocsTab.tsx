import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

type DocFile = 'README.md' | 'LOGICA_NEGOCIO.md' | 'security_spec.md' | 'MONETIZACAO_PLATAFORMA.md' | 'MARKETING_PLAYSTORE.md' | 'COMO_GERAR_APK.md';

export const DevDocsTab: React.FC = () => {
    const [activeDoc, setActiveDoc] = React.useState<DocFile>('README.md');
    const [content, setContent] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchDoc = async (filename: DocFile) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/dev/docs/${filename}`);
            if (!response.ok) throw new Error('Falha ao carregar documento');
            const data = await response.json();
            setContent(data.content);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDoc(activeDoc);
    }, [activeDoc]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'README.md', label: 'Guia de Engenharia' },
                    { id: 'LOGICA_NEGOCIO.md', label: 'Lógica de Negócio' },
                    { id: 'security_spec.md', label: 'Segurança' },
                    { id: 'MONETIZACAO_PLATAFORMA.md', label: 'Monetização e Pagamentos' },
                    { id: 'MARKETING_PLAYSTORE.md', label: 'Marketing Play Store' },
                    { id: 'COMO_GERAR_APK.md', label: 'Gerar APK Android' }
                ].map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.id as DocFile)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeDoc === doc.id
                                ? 'bg-brand-primary text-white shadow-lg'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {doc.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando Documentação...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 text-brand-danger">
                        <AlertCircle className="w-8 h-8" />
                        <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                        <button 
                            onClick={() => fetchDoc(activeDoc)}
                            className="text-[10px] font-black underline"
                        >
                            TENTAR NOVAMENTE
                        </button>
                    </div>
                ) : (
                    <div className="p-4 sm:p-8 overflow-y-auto max-h-[65vh] text-left custom-scrollbar">
                        <div className="markdown-body prose prose-sm prose-slate max-w-none 
                            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-headings:text-brand-primary
                            prose-p:text-gray-600 prose-p:font-bold prose-p:leading-relaxed prose-p:text-[11px] sm:prose-p:text-xs
                            prose-strong:text-brand-primary prose-strong:font-black
                            prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-code:text-[10px] prose-code:font-mono prose-code:text-brand-primary
                            prose-pre:bg-zinc-900 prose-pre:p-4 prose-pre:rounded-xl prose-pre:border-l-4 prose-pre:border-brand-primary prose-pre:shadow-xl
                            prose-li:text-gray-600 prose-li:font-bold prose-li:text-[11px] sm:prose-li:text-xs
                            break-words overflow-hidden">
                            <ReactMarkdown
                                components={{
                                    pre: ({ children }) => (
                                        <pre className="overflow-x-auto custom-scrollbar-dark my-4 p-4 text-[10px] sm:text-xs leading-relaxed">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ children, className }) => {
                                        const isInline = !className;
                                        if (isInline) {
                                            return <code className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-mono text-[9px] sm:text-[10px] font-black break-all">{children}</code>;
                                        }
                                        return <code className="block w-full font-mono text-zinc-100 break-words whitespace-pre-wrap">{children}</code>;
                                    }
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-brand-primary/5 border border-brand-primary/10 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                    <FileText className="text-brand-primary shrink-0" size={18} />
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-brand-primary mb-1 tracking-widest">Nota do Desenvolvedor</h4>
                        <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                            Estes arquivos são a "Fonte da Verdade" do FleetX. Eles sincronizam as diretrizes de design, 
                            segurança e lógica de negócio que guiam o desenvolvimento do app.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
