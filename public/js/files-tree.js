const folderStructure = [
    {
        name:"projects",
        type : "folder",
        path : "/projects",
       children :[
    {
        name: "libs",
        type: "folder",
        path: "/projects/libs",
        children: [
            {
                name: "ace.js",
                type: "file",
                path: "projects/libs/ace.js"
            },
            {
                name: "ext-language_tools.js",
                type: "file",
                path: "projects/libs/ext-language_tools.js"
            }
        ]
    },
    {
        name: "ext-language_tools.js",
        type: "file",
        path: "projects/libs/ext-language_tools.js"
    }
    ]
    }
];

export default folderStructure;
