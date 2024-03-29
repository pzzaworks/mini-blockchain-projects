const config = {
    rpcUrl: "https://rpc.ankr.com/optimism_sepolia",
    deployCount: 1, // Number of times to deploy all contracts
    interactCount: 1, // Number of times to interact with each contract
    timeout: 0, // Timeout in ms to wait for each transactions
    runForever: true // Runs the bot forever
}

module.exports = config;