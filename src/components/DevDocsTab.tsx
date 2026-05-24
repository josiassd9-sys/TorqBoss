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
                    <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] prose prose-sm prose-slate max-w-none">
                        <div className="markdown-body">
                            <ReactMarkdown>{content}</ReactMarkdown>
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
