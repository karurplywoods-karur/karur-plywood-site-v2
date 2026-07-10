export default function ReviewSection({ reviews, area }: { reviews: any[]; area: any }) {
  if (!reviews?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Customer Reviews from {area.name}</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{review.customer_name}</span>
              {review.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>}
              <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p className="text-gray-700">{review.review_text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
