// components/portfolio/Gallery.jsx
export default function Gallery({data}) {
  const images = Array.isArray(data?.galery) ? data.galery : [];

  return (
    <div id="gallery" className="px-4 md:px-6 py-10 md:py-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-text">
        Galería
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl shadow-lg group"
          >
            <img
              src={img}
              alt={`Gallery ${index}`}
              className="w-full aspect-[4/5] sm:aspect-[3/4] object-cover transform group-hover:scale-105 transition duration-300"
            />
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">No hay imágenes disponibles todavía.</p>
        )}
      </div>
    </div>
  );
}
