import React, { useEffect, useState } from "react";

function InstagramCarousel() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const res = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=TU_ACCESS_TOKEN`
        );
        const data = await res.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error("Error al cargar Instagram:", err);
      }
    };
    fetchInstagram();
  }, []);

  return (
    <div className="mt-10">
      <h3 className="text-[#38629F] text-xl font-semibold text-center mb-3">
        🐾 Últimos posteos en Instagram
      </h3>

      <div className="flex gap-4 overflow-x-auto scroll-smooth px-1 scrollbar-hide">
        {posts.length > 0 ? (
          posts.map((p) => (
            <a
              key={p.id}
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[260px] bg-white rounded-2xl shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={p.media_url}
                alt={p.caption?.slice(0, 50)}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <p className="p-2 text-sm text-slate-600">
                {p.caption?.slice(0, 80)}...
              </p>
            </a>
          ))
        ) : (
          <p className="text-center text-slate-500 w-full">
            Cargando publicaciones...
          </p>
        )}
      </div>
    </div>
  );
}

export default InstagramCarousel;
