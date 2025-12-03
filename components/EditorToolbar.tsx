import React from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Quote,
  Table,
  CornerDownLeft,
  Indent,
} from "lucide-react";

interface EditorToolbarProps {
  onInsertMarkdown: (
    before: string,
    after?: string,
    placeholder?: string
  ) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onInsertMarkdown }) => {
  return (
    <div className="flex items-center gap-1 p-2 min-w-max">
      <button
        onClick={() => onInsertMarkdown("\n\n", "", "")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Nuevo parrafo"
      >
        <CornerDownLeft size={20} />
      </button>
      {/* sangría */}
      <button
        onClick={() => onInsertMarkdown("\t")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Sangría"
      >
        <Indent size={20} />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
      <select
        onChange={(e) => {
          if (e.target.value) {
            onInsertMarkdown(e.target.value, "", "Encabezado");
            e.target.value = "";
          }
        }}
        className="bg-gray-50 dark:text-gray-200 dark:bg-neutral-950 border-none focus:ring-0 focus:border-none"
        title="Insertar encabezado"
        defaultValue=""
      >
        <option value="" disabled>
          Encabezado
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 1"
          value="# "
        >
          H1
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 2"
          value="## "
        >
          H2
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 3"
          value="### "
        >
          H3
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 4"
          value="#### "
        >
          H4
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 5"
          value="##### "
        >
          H5
        </option>
        <option
          className="dark:text-neutral-200"
          title="Encabezado 6"
          value="###### "
        >
          H6
        </option>
      </select>
      <div className="w-px h-6 dark:text-neutral-200 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
      <button
        onClick={() => onInsertMarkdown("**", "**", "negrita")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Negrita"
      >
        <Bold size={20} />
      </button>
      <button
        onClick={() => onInsertMarkdown("*", "*", "cursiva")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0 cursor-pointer"
        title="Cursiva"
      >
        <Italic size={20} />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
      <button
        onClick={() => onInsertMarkdown("- ", "", "Item de lista")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Lista"
      >
        <List size={20} />
      </button>
      <button
        onClick={() => onInsertMarkdown("1. ", "", "Item numerado")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Lista numerada"
      >
        <ListOrdered size={20} />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
      <button
        onClick={() => onInsertMarkdown("[", "](url)", "texto del enlace")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Enlace"
      >
        <Link2 size={20} />
      </button>
      <button
        onClick={() => onInsertMarkdown("![", "](url)", "alt text")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Imagen"
      >
        <Image size={20} />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
      <button
        onClick={() => onInsertMarkdown("```", "```", "código")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Código"
      >
        <Code size={20} />
      </button>
      <button
        onClick={() => onInsertMarkdown("> ", "", "cita")}
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Cita"
      >
        <Quote size={20} />
      </button>
      <button
        onClick={() =>
          onInsertMarkdown(
            "| Col1 | Col2 |\n|------|------|\n| ",
            " | |",
            "dato"
          )
        }
        className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
        title="Tabla"
      >
        <Table size={20} />
      </button>
    </div>
  );
};

export default EditorToolbar;
