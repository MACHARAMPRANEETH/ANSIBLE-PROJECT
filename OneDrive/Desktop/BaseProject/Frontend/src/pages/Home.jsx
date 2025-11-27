import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

function Home() {
  const {
    teluguSongs,
    setTeluguSongs,
    handlePlay,
    handlePause,
    handleResume,
    handleVolume,
    handleSeek,
    progress,
    duration,
    volume,
    currentSong,
    currentSrc,
    isPlaying,
    likedSongs,
    setLikedSongs,
  } = useContext(PlayerContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();

  const [hindiSongs, setHindiSongs] = useState([]);
  const [englishSongs, setEnglishSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);

  // ---------------------- Fetch Songs ----------------------
  const fetchSongs = async (query, setter, pageNum = 1) => {
    try {
      const res = await fetch(
        `https://sai-song-api.vercel.app/api/search/songs?query=${encodeURIComponent(
          query
        )}&limit=60&page=${pageNum}`
      );
      const data = await res.json();
      const songsArr = (data?.data?.results || []).map((song) => {
        let imageUrl = "";
        if (Array.isArray(song.image)) {
          const img500 = song.image.find((img) => img.quality === "500x500");
          const img150 = song.image.find((img) => img.quality === "150x150");
          const img50 = song.image.find((img) => img.quality === "50x50");
          imageUrl =
            img500?.url ||
            img150?.url ||
            img50?.url ||
            "https://via.placeholder.com/300x160?text=No+Image";
        }
        let audioUrl = "";
        if (Array.isArray(song.downloadUrl)) {
          const aud320 = song.downloadUrl.find((aud) => aud.quality === "320kbps");
          const aud160 = song.downloadUrl.find((aud) => aud.quality === "160kbps");
          const aud96 = song.downloadUrl.find((aud) => aud.quality === "96kbps");
          const aud48 = song.downloadUrl.find((aud) => aud.quality === "48kbps");
          const aud12 = song.downloadUrl.find((aud) => aud.quality === "12kbps");
          audioUrl =
            aud320?.url ||
            aud160?.url ||
            aud96?.url ||
            aud48?.url ||
            aud12?.url ||
            "";
        }
        let artistNames = "Unknown Artist";
        if (song.artists && song.artists.primary && Array.isArray(song.artists.primary)) {
          artistNames = song.artists.primary.map((a) => a.name).join(", ");
        }
        return {
          id: song.id,
          name: song.name,
          imageUrl,
          audioUrl,
          artistNames,
        };
      });
      setter((prev) => [...prev, ...songsArr]);
    } catch (err) {
      console.error(`Failed to fetch ${query} songs`, err);
    }
  };

  const fetchTeluguSongs = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      await fetchSongs("Telugu", setTeluguSongs, pageNum);
      setHasMore(true);
    } catch {
      setError("Failed to fetch Telugu songs");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeluguSongs(page);
    fetchSongs("Hindi", setHindiSongs);
    fetchSongs("English", setEnglishSongs);
    fetchSongs("Trending", setTrendingSongs);
    // eslint-disable-next-line
  }, [page]);

  // ---------------------- Infinite Scroll ----------------------
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // ---------------------- Handlers ----------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleLike = (song) => {
    setLikedSongs((prev) =>
      prev && prev.some((s) => s.id === song.id) ? prev.filter((s) => s.id !== song.id) : [...(prev || []), song]
    );
  };

  const findFirstAvailableSong = () => {
    const lists = [teluguSongs, hindiSongs, englishSongs, trendingSongs];
    for (let list of lists) {
      if (Array.isArray(list)) {
        const found = list.find((s) => s.audioUrl);
        if (found) return found;
      }
    }
    return null;
  };

  const getCombinedList = () => {
    const combined = [...teluguSongs, ...hindiSongs, ...englishSongs, ...trendingSongs];
    const unique = [];
    const seen = new Set();
    for (const s of combined) {
      if (!seen.has(s.id)) {
        unique.push(s);
        seen.add(s.id);
      }
    }
    return unique;
  };

  const playNext = () => {
    const list = getCombinedList();
    if (!list.length) return;
    if (!currentSong) {
      const first = list.find((s) => s.audioUrl);
      if (first) handlePlay(first.audioUrl, first);
      return;
    }
    const idx = list.findIndex((s) => s.id === currentSong.id);
    for (let i = idx + 1; i < list.length; i++) {
      if (list[i].audioUrl) {
        handlePlay(list[i].audioUrl, list[i]);
        return;
      }
    }
    const first = list.find((s) => s.audioUrl);
    if (first) handlePlay(first.audioUrl, first);
  };

  const playPrev = () => {
    const list = getCombinedList();
    if (!list.length) return;
    if (!currentSong) {
      const first = list.find((s) => s.audioUrl);
      if (first) handlePlay(first.audioUrl, first);
      return;
    }
    const idx = list.findIndex((s) => s.id === currentSong.id);
    for (let i = idx - 1; i >= 0; i--) {
      if (list[i].audioUrl) {
        handlePlay(list[i].audioUrl, list[i]);
        return;
      }
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].audioUrl) {
        handlePlay(list[i].audioUrl, list[i]);
        return;
      }
    }
  };

  // ---------------------- Song Grid ----------------------
  const SongGrid = ({ title, songs }) => (
    <section className="mt-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {songs && songs.length === 0 && !loading && !error && <div className="text-gray-500">No songs found.</div>}
        {songs &&
          songs.map((song) => {
            const isCurrent = currentSrc === song.audioUrl;
            return (
              <div
                key={song.id}
                className={`p-4 rounded-xl shadow transition ${theme === "dark" ? "bg-secondary" : "bg-gray-200"}`}
              >
                <img src={song.imageUrl} alt={song.name} className="w-full h-70 object-cover rounded-md mb-3" />
                <h4 className="text-base font-bold truncate">{song.name}</h4>
                <p className="text-sm truncate opacity-70">{song.artistNames}</p>
                <div className="flex mt-2 space-x-2 items-center">
                  <button
                    onClick={() => {
                      if (!song.audioUrl) return;
                      if (isCurrent) {
                        isPlaying ? handlePause() : handleResume();
                      } else {
                        handlePlay(song.audioUrl, song);
                      }
                    }}
                    className="bg-primary text-white text-sm px-3 py-1 rounded-full hover:bg-primary/80 transition"
                    disabled={!song.audioUrl}
                  >
                    {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <button onClick={() => toggleLike(song)} className="text-red-500 text-lg">
                    {likedSongs && likedSongs.some((s) => s.id === song.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </div>
            );
          })}
        {loading && <div>Loading more songs...</div>}
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </section>
  );

  const formatTime = (s) => {
    if (!s || Number.isNaN(s)) return "0:00";
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    const min = Math.floor(s / 60).toString();
    return `${min}:${sec}`;
  };

  return (
    <div className={`p-6 md:p-10 ${theme === "dark" ? "bg-dark text-white" : "bg-white text-black"} overflow-y-auto min-h-screen pb-28`}>
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-extrabold">
          Welcome to Your Music Space
        </motion.h1>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
            <FaUserCircle size={36} className="text-primary" />
          </button>
          {dropdownOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-primary/20 cursor-pointer">Update Password</li>
                <li onClick={toggleTheme} className="px-4 py-2 hover:bg-primary/20 cursor-pointer">
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </li>
                <li onClick={() => setShowAbout(true)} className="px-4 py-2 hover:bg-primary/20 cursor-pointer">
                  About
                </li>
                <li onClick={handleLogout} className="px-4 py-2 hover:bg-primary/20 cursor-pointer">
                  Logout
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* Partitions */}
      <SongGrid title="🎶 Telugu Songs For You" songs={teluguSongs} />
      <SongGrid title="🎵 Hindi Hits" songs={hindiSongs} />
      <SongGrid title="🌍 English Songs" songs={englishSongs} />
      <SongGrid title="🔥 Trending Now" songs={trendingSongs} />

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white text-black p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-2">About MelodyStream</h2>
            <p className="text-sm mb-4">
              MelodyStream is a music streaming app built using React and Spring Boot. Enjoy your music anytime!
            </p>
            <button onClick={() => setShowAbout(false)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* PlayerBar */}
      <div className="fixed left-0 right-0 bottom-0 bg-secondary/95 backdrop-blur-sm border-t border-gray-700 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center space-x-4">
          <div className="w-16 h-16 flex-shrink-0">
            <img src={(currentSong && currentSong.imageUrl) || (currentSrc && findFirstAvailableSong()?.imageUrl) || "https://via.placeholder.com/80"} alt={currentSong ? currentSong.name : "No song"} className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold truncate max-w-md">{currentSong?.name || "Not playing"}</div>
                <div className="text-xs opacity-70 truncate max-w-md">{currentSong?.artistNames || ""}</div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button onClick={playPrev} className="p-2 rounded hover:bg-primary/10"><FaBackward /></button>
                {currentSrc && isPlaying ? (
                  <button onClick={() => handlePause()} className="p-2 rounded bg-primary text-white"><FaPause /></button>
                ) : currentSrc ? (
                  <button onClick={() => handleResume()} className="p-2 rounded bg-primary text-white"><FaPlay /></button>
                ) : (
                  <button onClick={() => { const first = findFirstAvailableSong(); if (first) handlePlay(first.audioUrl, first); }} className="p-2 rounded bg-primary text-white"><FaPlay /></button>
                )}
                <button onClick={playNext} className="p-2 rounded hover:bg-primary/10"><FaForward /></button>
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-3">
              <div className="text-xs w-10 text-right">{formatTime(progress)}</div>
              <input type="range" min={0} max={duration || 0} step="0.1" value={progress} onChange={(e) => handleSeek(Number(e.target.value))} className="flex-1" />
              <div className="text-xs w-10 text-left">{formatTime(duration)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaVolumeUp />
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => handleVolume(Number(e.target.value))} className="w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
