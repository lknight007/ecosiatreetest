import http from "http";

function StartServer(port) {
    console.log(`Starting server on port ${port}.`);

    http.createServer((req, res) => {
        console.log(`Request received on '${req.url}'`);

        if (req.url == "/tree") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify({
                myFavoriteTree: "Maple"
            }));
            res.end();
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Path not found.");
        res.end();
    }).listen(port);
}

StartServer(8080);
