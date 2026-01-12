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
    <div className="flex flex-row relative group rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-gray-900 w-full max-w-full">
      <div className="overflow-x-auto w-full">
        <pre
          ref={preRef}
          {...props}
          className="my-0 p-0 bg-transparent border-0 font-mono text-sm"
        >
          {children}
        </pre>
      </div>
      <div className="flex items-center justify-between rounded-t-lg px-2 bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-neutral-700">
        <button
          onClick={handleCopy}
          className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

export default CodeBlock;
