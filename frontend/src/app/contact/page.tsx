import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold mb-8 text-center">Contact Us</h1>
      
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <p className="text-gray-600 mb-6 text-center">
          Have questions about the Product Explorer? We&apos;d love to hear from you.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              id="message" 
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="How can we help?"
            ></textarea>
          </div>

          <button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Send Message
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Or email us directly at <a href="mailto:support@productexplorer.com" className="text-blue-600 hover:underline">support@productexplorer.com</a></p>
        </div>
      </div>
    </div>
  );
}