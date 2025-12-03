import React, { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

const CodeBlock = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      const code = preRef.current.innerText;
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-gray-900 w-full max-w-full">
      <div className="flex items-center justify-between rounded-t-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre
          ref={preRef}
          {...props}
          className="my-0 p-0 bg-transparent border-0 font-mono text-sm"
        >
          {children}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
