const folderStructure = [
    {
        name: "Project Files",
        type: "folder",
        path : "/Project Files",
        children: [
            {
                name: "Assets",
                type: "folder",
                path : "/Project Files/Assets",
                children: [
                    {
                        name: "Images",
                        type: "folder",
                        path : "/Project Files/Assets/Images",
                        children: [
                            { name: "logo.png", type: "file" },
                            { name: "banner.jpg", type: "file" }
                        ]
                    },
                    {
                        name: "Styles",
                        type: "folder",
                        path : "/Project Files/Assets/Styles",
                        children: [
                            { name: "main.css", type: "file" },
                            { name: "theme.css", type: "file" }
                        ]
                    }
                ]
            },
            { name: "README.md", type: "file" }
        ]
    }
];
export default folderStructure