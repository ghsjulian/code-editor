const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

// Editor configurations
const editorConfig = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    selectionStyle: "text",
    highlightActiveLine: true,
    highlightSelectedWord: true,
    readOnly: false,
    cursorStyle: "ace",
    mergeUndoDeltas: true,
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    autoScrollEditorIntoView: true,
    fontSize: "16px",
    fontFamily: "monospace,fira-code",
    animatedScroll: true,
    displayIndentGuides: true,
    showInvisibles: false,
    showPrintMargin: true,
    showGutter: true,
    fadeFoldWidgets: true,
    showFoldWidgets: true,
    showLineNumbers: true,
    tabSize: 4,
    useWorker: true,
    useSoftTabs: true,
    wrap: false,
    scrollPastEnd: 0,
    scrollSpeed: 3,
    dragDelay: 0,
    dragEnabled: true
};

// Apply configurations
editor.setOptions(editorConfig);
editor.getSession().setUseWrapMode(false);
editor.getSession().setUseSoftTabs(true);
editor.setOption("printMargin", 180);
editor.setOption("persistentHScrollBar", true);
editor.setScrollSpeed(1);

// Initialize editors with empty content
editor.setValue();

export default editor;
