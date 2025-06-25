const editor = ace.edit("editor");
// Set the mode to JavaScript
editor.session.setMode("ace/mode/javascript");
// Set the theme to Monokai
editor.setTheme("ace/theme/monokai");

editor.setOptions({
    // Editor options
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
    fontSize: "18px",
    fontFamily: "monospace",
    // Renderer options
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
    scrollPastEnd: 0, // Allow scrolling 100% of editor height/width past content
    //hScrollBarAlwaysVisible: true, // Force horizontal scrollbar
    //vScrollBarAlwaysVisible: true, // Force vertical scrollbar
    // Mouse handler options
    scrollSpeed: 3,
    dragDelay: 0,
    dragEnabled: true
});
editor.getSession().setUseWrapMode(false);
editor.getSession().setUseSoftTabs(true);
editor.setOption("printMargin", 180);
editor.setOption("persistentHScrollBar", true);
editor.setScrollSpeed(1);
