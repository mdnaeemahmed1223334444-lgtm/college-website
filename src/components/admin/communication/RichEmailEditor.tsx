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
  const [showColorPicker, setShowColorPicker] = useState(false);
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
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleFormatBlock = (tag: string) => {
    execCmd("formatBlock", tag);
  };

  const handleInsertLink = () => {
    if (isCodeView) return;
    const url = prompt("Enter the website or document link URL (e.g. https://...):");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const handleInsertButton = () => {
    if (isCodeView) return;
    const text = prompt("Enter button label (e.g. 'View Exam Schedule'):", "View Details");
    if (!text) return;
    const url = prompt("Enter button destination link (e.g. https://...):", "https://");
    if (!url) return;

    const btnHtml = `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${url}" target="_blank" style="display: inline-block; background-color: #1e40af; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${text} &rarr;
        </a>
      </div>
      <p style="color: #111827; font-size: 15px; margin: 8px 0;"><br></p>
    `;
    execCmd("insertHTML", btnHtml);
    execCmd("foreColor", "#111827");
  };

  const handleInsertBadge = (type: "notice" | "urgent" | "info") => {
    if (isCodeView) return;
    let badgeHtml = "";
    if (type === "urgent") {
      badgeHtml = `<span style="display:inline-block;background-color:#fee2e2;color:#b91c1c;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:bold;letter-spacing:0.02em;text-transform:uppercase;margin-right:6px;">🚨 URGENT</span>&nbsp;<span style="color:#111827;font-weight:normal;font-size:15px;">&nbsp;</span>`;
    } else if (type === "notice") {
      badgeHtml = `<span style="display:inline-block;background-color:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:bold;letter-spacing:0.02em;margin-right:6px;">📢 OFFICIAL NOTICE</span>&nbsp;<span style="color:#111827;font-weight:normal;font-size:15px;">&nbsp;</span>`;
    } else {
      badgeHtml = `<span style="display:inline-block;background-color:#d1fae5;color:#065f46;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:bold;letter-spacing:0.02em;margin-right:6px;">ℹ️ INFORMATION</span>&nbsp;<span style="color:#111827;font-weight:normal;font-size:15px;">&nbsp;</span>`;
    }
    execCmd("insertHTML", badgeHtml);
    // Reset formatting immediately so cursor continues in standard black font
    execCmd("foreColor", "#111827");
  };

  const handleApplyColor = (color: string) => {
    execCmd("foreColor", color);
    setShowColorPicker(false);
  };

  const handleClearFormat = () => {
    execCmd("removeFormat");
    execCmd("foreColor", "#111827");
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white overflow-hidden shadow-xs focus-within:border-blue-500 transition">
      {/* Hidden input to pass value in form submission */}
      <input type="hidden" name={name} value={htmlContent} />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/90 p-2 text-xs">
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

            {/* Typography Blocks */}
            <button
              type="button"
              onClick={() => handleFormatBlock("<h1>")}
              className="rounded px-2 py-1 font-black text-gray-800 hover:bg-gray-200"
              title="Large Heading (H1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("<h2>")}
              className="rounded px-2 py-1 font-bold text-gray-800 hover:bg-gray-200"
              title="Medium Heading (H2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("<h3>")}
              className="rounded px-2 py-1 font-semibold text-gray-800 hover:bg-gray-200"
              title="Small Heading (H3)"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("<p>")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Normal Paragraph"
            >
              ¶
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Basic Formatting */}
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

            {/* Text Color Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-100"
                title="Change Text Color"
              >
                <span className="font-bold underline decoration-red-500 decoration-2">A</span>
                <span>▼</span>
              </button>
              {showColorPicker && (
                <div className="absolute left-0 top-full mt-1 z-20 flex gap-1.5 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  {[
                    { color: "#111827", label: "Black" },
                    { color: "#1e40af", label: "Navy Blue" },
                    { color: "#dc2626", label: "Crimson Red" },
                    { color: "#059669", label: "Emerald Green" },
                    { color: "#7c3aed", label: "Purple" },
                    { color: "#d97706", label: "Amber" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => handleApplyColor(c.color)}
                      className="h-5 w-5 rounded-full border border-gray-300 transition hover:scale-110"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => execCmd("justifyLeft")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Align Left"
            >
              ⇤
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyCenter")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Align Center"
            >
              ⇥⇤
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyRight")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Align Right"
            >
              ⇥
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

            {/* Links, Button & Quote */}
            <button
              type="button"
              onClick={handleInsertLink}
              className="rounded border border-blue-200 bg-blue-50 px-2 py-1 font-medium text-blue-700 hover:bg-blue-100"
              title="Insert Hyperlink"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={handleInsertButton}
              className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100"
              title="Insert Action Button"
            >
              🔘 Add Button
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<blockquote>")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Blockquote"
            >
              “ Quote
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertHorizontalRule")}
              className="rounded px-2 py-1 text-gray-700 hover:bg-gray-200"
              title="Divider Line"
            >
              ― Line
            </button>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Callout Badges */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleInsertBadge("urgent")}
                className="rounded bg-red-100 px-2 py-1 text-[11px] font-bold text-red-800 hover:bg-red-200"
                title="Insert Urgent Tag"
              >
                + Urgent Tag
              </button>
              <button
                type="button"
                onClick={() => handleInsertBadge("notice")}
                className="rounded bg-indigo-100 px-2 py-1 text-[11px] font-bold text-indigo-800 hover:bg-indigo-200"
                title="Insert Notice Tag"
              >
                + Notice Tag
              </button>
            </div>

            <span className="h-4 w-px bg-gray-300 mx-1" />

            {/* Clear Formatting */}
            <button
              type="button"
              onClick={handleClearFormat}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
              title="Clear formatting & reset to normal text"
            >
              T⃠ Reset Style
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      {isCodeView ? (
        <textarea
          value={htmlContent}
          onChange={handleCodeChange}
          rows={14}
          className="w-full p-4 font-mono text-xs text-green-400 bg-gray-900 focus:outline-none resize-y"
          placeholder="Enter custom HTML email template..."
        />
      ) : (
        <div className="relative">
          <style>{`
            .email-editor-body h1 {
              font-size: 24px !important;
              font-weight: 800 !important;
              color: #111827 !important;
              margin: 16px 0 10px 0 !important;
              line-height: 1.3 !important;
            }
            .email-editor-body h2 {
              font-size: 20px !important;
              font-weight: 700 !important;
              color: #111827 !important;
              margin: 14px 0 8px 0 !important;
              line-height: 1.35 !important;
            }
            .email-editor-body h3 {
              font-size: 16px !important;
              font-weight: 600 !important;
              color: #1f2937 !important;
              margin: 12px 0 6px 0 !important;
              line-height: 1.4 !important;
            }
            .email-editor-body p {
              margin: 8px 0 !important;
              line-height: 1.65 !important;
              color: #374151 !important;
              font-size: 14px !important;
            }
            .email-editor-body ul {
              list-style-type: disc !important;
              padding-left: 24px !important;
              margin: 8px 0 !important;
              color: #374151 !important;
            }
            .email-editor-body ol {
              list-style-type: decimal !important;
              padding-left: 24px !important;
              margin: 8px 0 !important;
              color: #374151 !important;
            }
            .email-editor-body li {
              margin: 3px 0 !important;
            }
            .email-editor-body blockquote {
              border-left: 4px solid #3b82f6 !important;
              padding: 6px 14px !important;
              margin: 12px 0 !important;
              color: #4b5563 !important;
              background-color: #eff6ff !important;
              font-style: italic !important;
              border-radius: 0 6px 6px 0 !important;
            }
            .email-editor-body a {
              color: #2563eb !important;
              text-decoration: underline !important;
              font-weight: 500 !important;
            }
            .email-editor-body hr {
              border: none !important;
              border-top: 1px solid #e5e7eb !important;
              margin: 18px 0 !important;
            }
          `}</style>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="email-editor-body min-h-[220px] max-h-[500px] overflow-y-auto p-5 text-sm text-gray-900 focus:outline-none"
            style={{ minHeight: "220px" }}
          />
        </div>
      )}
    </div>
  );
}
