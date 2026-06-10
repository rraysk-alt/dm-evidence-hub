export function YouTube({ id }: { id: string }) {
  return (
    <figure className="my-6">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-sm"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </figure>
  );
}
