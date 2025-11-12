import axios from "axios";

const TOKEN = process.env.IG_TOKEN;      // Tu token de Graph API
const USER_ID = process.env.IG_USER_ID;  // Tu Instagram User ID

export default async function handler(req, res) {
  try {
    const url = `https://graph.instagram.com/${USER_ID}/media?fields=id,caption,media_url,permalink&access_token=${TOKEN}`;

    const response = await axios.get(url);
    const data = response.data?.data || [];

    const posts = data.map(post => ({
      image: post.media_url,
      link: post.permalink,
      caption: post.caption || ""
    }));

    res.status(200).json(posts.slice(0, 12)); // las 12 publicaciones más recientes
  } catch (error) {
    console.error("Error fetching Instagram posts:", error.message);
    res.status(500).json({ error: "No se pudieron cargar las publicaciones de Instagram" });
  }
}
