import axios from "axios";
import { fork } from "child_process";

function URL(path) { return `http://localhost:8080${path}` }
function Sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const testFunctions = [
    async () => {
        let status = "passed";
        await axios.get(URL("/unknown")).catch(err => {
            if (!err.response || err.response.status != 404) {
                status = "Server did not respond with 404 for path '/unknown'.";
            }
        });
        return status;
    },

    async () => {
        const { data } = await axios.get(URL("/tree")).catch(err => {
            return "Request failed for path '/tree'."
        });

        if (!data) return "Response does not contain any data for path '/tree'.";
        if (!data.myFavoriteTree) return "Response does not contain property 'myFavoriteTree'.";
        if (typeof data.myFavoriteTree !== "string") return "myFavoriteTree is not a string.";
        return "passed";
    },
];

async function test() {
    // Spawn a fork process for the server
    const server = fork("src/index.js", [ "child" ]);
    server.on("error", () => {
        console.log("Test failed since server crashed.");
        process.exit(1);
    });

    // Wait for server to be up
    let tries = 0;
    let success = false;
    while (!success) {
        const resp = await axios.get(URL("/")).catch(err => {
            if (err.response) success = true;
            if (++tries >= 20) {
                console.log("Test failed since server failed to initalize.");
                process.exit(1);
            }
        });
        if (resp && resp.status) success = true;
        await Sleep(50);
    }

    // Run tests
    const promises = testFunctions.map(func => func());
    const results = await Promise.all(promises);
    const totalTests = testFunctions.length;
    let failed = false;

    results.forEach((result, index) => {
        if (result != "passed") {
            console.log(`Test ${index + 1} of ${totalTests} failed. Reason: ${result}`);
            failed = true;
        } else {
            console.log(`Test ${index + 1} of ${totalTests} passed.`);
        }
    })

    server.kill("SIGINT");
    if (failed) process.exit(1);
    process.exit(0);
}
test();
