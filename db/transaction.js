const commitWithRetry = async session => {
    try {
        await session.commitTransaction();
        console.log("Transaction committed.");
    } catch (error) {
        if (error.errorLabels && error.errorLabels.indexOf("UnknownTransactionCommitResult") >= 0) {
            console.log("UnknownTransactionCommitResult, retrying commit operation ...");
            await commitWithRetry(session);
        } else {
            console.log("Error during commit ...");
            throw error;
        }
    }
};

const runTransactionWithRetry = async (txnFunc, client, session) => {
    try {
        await txnFunc(client, session);
    } catch (error) {
        console.log("Transaction aborted. Caught exception during transaction.");

        // If transient error, retry the whole transaction
        if (error.errorLabels && error.errorLabels.indexOf("TransientTransactionError") >= 0) {
            console.log("TransientTransactionError, retrying transaction ...");
            await runTransactionWithRetry(txnFunc, client, session);
        } else {
            throw error;
        }
    }
};

module.exports = {
    commitWithRetry,
    runTransactionWithRetry
};
