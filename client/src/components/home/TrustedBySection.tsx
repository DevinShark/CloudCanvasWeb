const TrustedBySection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-center text-xl text-gray-500 mb-8">Trusted by industry leaders</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-60">
          {/* Using SVG logos directly instead of images */}
          <svg className="h-6 md:h-8" viewBox="0 0 150 50" fill="currentColor">
            <text x="10" y="30" fontSize="14" fontWeight="bold">Company Logo 1</text>
          </svg>
          
          <svg className="h-6 md:h-8" viewBox="0 0 150 50" fill="currentColor">
            <text x="10" y="30" fontSize="14" fontWeight="bold">Company Logo 2</text>
          </svg>
          
          <svg className="h-6 md:h-8" viewBox="0 0 150 50" fill="currentColor">
            <text x="10" y="30" fontSize="14" fontWeight="bold">Company Logo 3</text>
          </svg>
          
          <svg className="h-6 md:h-8" viewBox="0 0 150 50" fill="currentColor">
            <text x="10" y="30" fontSize="14" fontWeight="bold">Company Logo 4</text>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
