import {printAllEnvVars} from "./const/env";
import {startExpressServer} from "./app";

async function main(): Promise<void> {
    console.log("Starting Server, please wait...");
    printAllEnvVars();
    await startExpressServer();
}

main().then(() => {
    console.log("Server started successfully");
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
