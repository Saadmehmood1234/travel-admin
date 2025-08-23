"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PixabayImage = {
  id: number;
  webformatURL: string;
  tags: string;
};

export default function Home() {
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("travel"); 
  const [searchTerm, setSearchTerm] = useState("travel");
    const router = useRouter();
  const { data: session, status } = useSession();

  if (!session) {
    router.push("/auth/signin");
    return;
  }
  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch(
        `https://pixabay.com/api/?key=${process.env.NEXT_PUBLIC_PIXABAY_KEY}&q=${query}&image_type=photo&per_page=20&page=${page}`
      );
      const data = await res.json();

      if (page === 1) {
        setImages(data.hits); // reset images on new search
      } else {
        setImages((prev) => [...prev, ...data.hits]); // append on load more
      }
    };
    fetchImages();
  }, [page, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchTerm);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard!");
  };
console.log(images,page,query,searchTerm)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pixabay Image Search</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search images..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Image
              src={img.webformatURL}
              alt={img.tags}
              width={400}
              height={250}
              className="w-full h-48 object-cover"
            />
            <div className="p-3 flex justify-between items-center">
              <p className="text-sm text-gray-600 truncate">{img.tags}</p>
              <button
                onClick={() => copyToClipboard(img.webformatURL)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {images.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setPage((p) => p + 1)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
