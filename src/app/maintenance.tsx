export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">R</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">RYDSTORE</h1>
          <p className="text-blue-200 font-medium">PREMIUM STREETWEAR</p>
        </div>
        
        {/* Main Message */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🔧 Under Maintenance
          </h2>
          <p className="text-lg text-gray-200 mb-6">
            We're working hard to bring you an even better shopping experience. 
            Our website will be back online soon with amazing new features!
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-300">75% Complete</p>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-4">
          <p className="text-gray-300">
            📧 Questions? Email us at: <a href="mailto:info@rydstore.my" className="text-blue-400 hover:text-blue-300">info@rydstore.my</a>
          </p>
          <p className="text-gray-300">
            📱 Follow us for updates: 
            <a href="#" className="text-blue-400 hover:text-blue-300 ml-2">@rydstore</a>
          </p>
          
          {/* Estimated Time */}
          <div className="bg-blue-600/20 rounded-2xl p-4 mt-6">
            <p className="text-white font-semibold">
              ⏰ Expected to be back: <span className="text-blue-300">Soon</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}