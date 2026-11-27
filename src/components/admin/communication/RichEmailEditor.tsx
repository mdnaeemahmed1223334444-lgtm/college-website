"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  initialContent?: string;
  onChange?: (html: string) => void;
  name?: string;
}

export default function RichEmailEditor({
  initialContent = "",
  onChange,
  name = "html_content",
}: Props) {
  const [htmlContent, setHtmlContent] = useState(
    initialContent ||
      `<h2>Important Campus Announcement</h2><p>Dear Faculty and Students,</p><p>We are writing to inform you of the following updates regarding the upcoming academic schedule...</p>`
  );
  const [isCodeView, setIsCodeView] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync content into editable div
  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [isCodeView]);

  const handleInput = () => {
    if (editorRef.current) {
      const val = editorRef.current.innerHTML;
      setHtmlContent(val);
      onChange?.(val);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlContent(val);
    onChange?.(val);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (isCodeView) return;
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const handleInsertLink = () => {
    if (isCodeView) return;
    const url = prompt("Enter the website or document link URL (e.g. https://...):");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const handleInsertBadge = (type: "notice" | "urgent" | "info") => {
    if (isCodeView) return;
    let badgeHtml = "";
    if (type === "urgent") {
      badgeHtml = `<span style="background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase;">🚨 URGENT</span>&nbsp;`;
    } else if (type === "notice") {
      badgeHtml = `<span style="background-color: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">📢 OFFICIAL NOTICE</span>&nbsp;`;
    } else {
      badgeHtml = `<span style="background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">ℹ️ INFORMATION</span>&nbsp;`;
    }
    execCmd("insertHTML", badgeHtml);
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white overflow-hidden shadow-xs focus-within:border-blue-500 transition">
      {/* Hidden input to pass value in form submission */}
      <input type="hidden" name={name} value={htmlContent} />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 p-2 text-xs">
        {/* View Switch */}
        <div className="flex rounded-md border border-gray-300 bg-white p-0.5 mr-2">
          <button
            type="button"
            onClick={() => setIsCodeView(false)}
            className={`rounded px-2.5 py-1 font-bold ${
              !isCodeView ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setIsCodeView(true)}
            className={`rounded px-2.5 py-1 font-mono font-bold ${
              isCodeView ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            &lt;/&gt; HTML Code
          </button>
        </div>

        {!isCodeView && (
          <>
            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Typography */}
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h1>")}
              className="rounded px-2 py-1 font-black text-gray-700 hover:bg-gray-200"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h2>")}
              className="rounded px-2 py-1 font-bold text-gray-700 hover:bg-gray-200"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h3>")}
              className="rounded px-2 py-1 font-semibold text-gray-700 hover:bg-gray-200"
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<p>")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Paragraph"
            >
              ¶
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Basic Styling */}
            <button
              type="button"
              onClick={() => execCmd("bold")}
              className="rounded px-2 py-1 font-black text-gray-800 hover:bg-gray-200"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => execCmd("italic")}
              className="rounded px-2 py-1 italic font-serif text-gray-800 hover:bg-gray-200"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => execCmd("underline")}
              className="rounded px-2 py-1 underline text-gray-800 hover:bg-gray-200"
              title="Underline"
            >
              <u>U</u>
            </button>
            <button
              type="button"
              onClick={() => execCmd("strikeThrough")}
              className="rounded px-2 py-1 line-through text-gray-800 hover:bg-gray-200"
              title="Strikethrough"
            >
              <s>S</s>
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCmd("insertUnorderedList")}
              className="rounded px-2 py-1 text-gray-800 hover:bg-gray-200"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertOrderedList")}
              className="rounded px-2 py-1 text-gray-800 hover:bg-gray-200"
              title="Numbered List"
            >
              1. List
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Links & Quotes */}
            <button
              type="button"
              onClick={handleInsertLink}
              className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-blue-700 hover:bg-blue-50"
              title="Insert Link"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<blockquote>")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Blockquote"
            >
              “ ” Quote
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertHorizontalRule")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Divider Line"
            >
              ― Divider
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Callout Badges */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleInsertBadge("urgent")}
                className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800 hover:bg-red-200"
              >
                + Urgent Tag
              </button>
              <button
                type="button"
                onClick={() => handleInsertBadge("notice")}
                className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800 hover:bg-indigo-200"
              >
                + Notice Tag
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content Area */}
      {isCodeView ? (
        <textarea
          value={htmlContent}
          onChange={handleCodeChange}
          rows={12}
          className="w-full p-4 font-mono text-xs text-gray-900 bg-gray-900 text-green-300 focus:outline-none resize-y"
          placeholder="Enter custom HTML email template..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[220px] max-h-[500px] overflow-y-auto p-5 text-sm text-gray-900 focus:outline-none prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:underline"
          style={{ minHeight: "220px" }}
        />
      )}
    </div>
  );
}
