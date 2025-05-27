import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


function Home() {
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="text-blue-600 block">Chat Bot</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hi there! Just a heads-up — when you send a request, you'll receive the same response twice. So don’t be surprised if you see duplicate replies like this. It’s part of how the system currently works!
            </p>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
}

export default Home;
