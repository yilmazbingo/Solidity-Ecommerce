import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@styles/globals.css";

const Noop = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }) {
  const Layout = Component.Layout ?? Noop;

  return (
    <Layout>
      {/* it could be also placed in Layout component */}
      <ToastContainer />
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
