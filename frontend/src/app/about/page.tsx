import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">About Product Explorer</h1>
      <p className="mb-4 text-gray-700 leading-relaxed">
        Product Explorer is a full-stack application designed to help users navigate and analyze
        products from World of Books. 
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-3">How it works</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li><strong>Discovery:</strong> We dynamically crawl the website to find categories.</li>
        <li><strong>Scraping:</strong> When you browse a category, we fetch fresh data in real-time.</li>
        <li><strong>Caching:</strong> Data is saved to our database to ensure fast reloads and reduce load on the source site.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-3">Tech Stack</h2>
      <p className="text-gray-700">
        Built with Next.js (App Router), NestJS, PostgreSQL, Prisma, and Crawlee/Playwright.
      </p>
    </div>
  );
}