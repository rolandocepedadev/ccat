export default function SharedPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shared Files</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">
            This page will show files that have been shared with you or files
            you&apos;ve shared with others.
          </p>
        </div>
      </div>
    </div>
  );
}
