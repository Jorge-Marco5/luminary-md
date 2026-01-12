import React from "react";
import { Command } from "lucide-react";

const KBD = ({ keys }: { keys: string[] }) => {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span
          key={index}
          className="inline-flex items-center justify-center rounded border border-b-2 border-border bg-muted px-2 py-1 text-xs font-medium text-foreground shadow-sm"
        >
          {key === "?" ? (
            <Command size={16} className="text-foreground" />
          ) : (
            key
          )}
        </span>
      ))}
    </div>
  );
};

export default KBD;
