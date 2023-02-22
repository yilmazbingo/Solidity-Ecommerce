import { toast } from "react-toastify";

export const withToast = (promise) => {
  toast.promise(
    promise,
    {
      pending: {
        render() {
          return (
            <div className="p-6 py-2 bg-green-400">
              <p className="mb-2">Your transaction is being processed.</p>
              <p>Hang tight... Just few more moments.</p>
            </div>
          );
        },
        icon: false,
      },
      success: {
        render({ data }) {
          return (
            <div>
              <p className="font-bold">
                Tx: {data.transactionHash.slice(0, 20)}...
              </p>
              <p>Has been succesfuly processed.</p>
              {/* Essentially, adding rel="noreferrer" to links protects your site's users against having the site you've linked to potentially hijacking the browser */}
              <a
                href={`https://goerli.etherscan.io/tx/${data.transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="text-indigo-600 underline">See Tx Details</i>
              </a>
            </div>
          );
        },
        // other options
        icon: "🟢",
      },
      error: {
        render({ data }) {
          // When the promise reject, data will contains the error
          return <div>{data.message ?? "Transaction has failed"}</div>;
        },
      },
    },
    // configuration
    {
      closeButton: true,
    }
  );
};
