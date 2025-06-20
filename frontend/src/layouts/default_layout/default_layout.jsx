import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
