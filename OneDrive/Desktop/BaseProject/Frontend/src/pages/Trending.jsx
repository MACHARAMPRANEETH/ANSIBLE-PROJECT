import React, { useEffect, useState, useContext } from "react";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
  FaList,
  FaThLarge,
} from "react-icons/fa";

import { PlayerContext } from "../context/PlayerContext";

function Trending() {
  const {
    handlePlay,
    handlePause,
    handleResume,
    currentSrc,
    isPlaying,
    likedSongs,
    setLikedSongs,
  } = useContext(PlayerContext);

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [hindiSongs, setHindiSongs] = useState([]);
  const [teluguSongs, setTeluguSongs] = useState([]);
  const [englishSongs, setEnglishSongs] = useState([]);

  const [activeSections, setActiveSections] = useState({
    trending: true,
    hindi: false,
    telugu: false,
    english: false,
  });

  const [viewMode, setViewMode] = useState("grid");

  const fallback = {
    trending: [
      {
        id: "t1",
        name: "Blinding Lights",
        artistNames: "The Weeknd",
        imageUrl: "/songs/blinding-lights.jpg",
        audioUrl: "/songs/Blinding Lights.mp3",
      },
      {
        id: "t2",
        name: "Believer",
        artistNames: "Imagine Dragons",
        imageUrl: "/songs/believer.jpg",
        audioUrl: "/songs/Believer.mp3",
      },
    ],
    hindi: [
      {
        id: "h1",
        name: "Kesariya",
        artistNames: "Arijit Singh",
        imageUrl: "/songs/kesariya.jpg",
        audioUrl: "/songs/kesariya.mp3",
      },
    ],
    telugu: [
      {
        id: "te1",
        name: "Naatu Naatu",
        artistNames: "Rahul Sipligunj, Kaala Bhairava",
        imageUrl: "/songs/naatu.jpg",
        audioUrl: "/songs/naatu.mp3",
      },
    ],
    english: [
      {
        id: "e1",
        name: "Shape of You",
        artistNames: "Ed Sheeran",
        imageUrl: "/songs/shape-of-you.jpg",
        audioUrl: "/songs/Shape_Of_You.mp3",
      },
    ],
  };

  const fetchSongs = async (query, setter, fallbackList) => {
    try {
      const res = await fetch(
        `https://sai-song-api.vercel.app/api/search/songs?query=${query}&limit=20&page=1`
      );
      const data = await res.json();

      const results = data?.data?.results || [];
      const mapped =
        results.length > 0
          ? results.map((song) => ({
              id: song.id,
              name: song.name,
              artistNames:
                song.artists?.primary?.map((a) => a.name).join(", ") ||
                "Unknown",
              imageUrl:
                song.image?.find((i) => i.quality === "500x500")?.url ||
                "https://via.placeholder.com/300",
              audioUrl:
                song.downloadUrl?.find((a) => a.quality === "320kbps")?.url ||
                "",
            }))
          : fallbackList;

      setter(mapped);
    } catch {
      setter(fallbackList);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchSongs("Trending", setTrendingSongs, fallback.trending),
        fetchSongs("Hindi", setHindiSongs, fallback.hindi),
        fetchSongs("Telugu", setTeluguSongs, fallback.telugu),
        fetchSongs("English", setEnglishSongs, fallback.english),
      ]);
    };
    load();
  }, []);

  const toggleLike = (song) => {
    setLikedSongs((prev) =>
      prev?.some((s) => s.id === song.id)
        ? prev.filter((s) => s.id !== song.id)
        : [...prev, song]
    );
  };

  // 🔵 Blue Neon Grid Card
  const GridCard = React.memo(({ song, isCurrent, isPlaying }) => {
    return (
      <div className="p-4 rounded-xl bg-secondary border border-light/20 shadow-lg hover:scale-[1.03] transition">
        <div className="relative">
          <img
            src={song.imageUrl}
            className="w-full h-44 object-cover rounded-lg"
            alt=""
          />

          <button
            onClick={() =>
              isCurrent
                ? isPlaying
                  ? handlePause()
                  : handleResume()
                : handlePlay(song.audioUrl, song)
            }
            className="absolute bottom-3 right-3 p-3 bg-primary rounded-full hover:bg-light transition"
          >
            {isCurrent && isPlaying ? (
              <FaPause className="text-dark" />
            ) : (
              <FaPlay className="text-dark" />
            )}
          </button>
        </div>

        <h3 className="font-bold mt-3 truncate text-light">{song.name}</h3>
        <p className="text-sm text-gray-300 truncate">{song.artistNames}</p>

        <button onClick={() => toggleLike(song)} className="text-lg mt-2">
          {likedSongs?.some((s) => s.id === song.id) ? (
            <FaHeart className="text-light" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-light" />
          )}
        </button>
      </div>
    );
  });

  // 🔵 Blue Neon List Row
  const ListRow = React.memo(({ song, isCurrent, isPlaying }) => {
    return (
      <div className="flex items-center p-3 rounded-lg bg-secondary border border-light/20 hover:bg-dark transition">
        <img
          src={song.imageUrl}
          className="w-16 h-16 object-cover rounded-md"
          alt=""
        />

        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-light">{song.name}</h3>
          <p className="text-xs text-gray-300">{song.artistNames}</p>
        </div>

        <button
          onClick={() =>
            isCurrent
              ? isPlaying
                ? handlePause()
                : handleResume()
              : handlePlay(song.audioUrl, song)
          }
          className="p-3 bg-primary rounded-full mr-3 hover:bg-light"
        >
          {isCurrent && isPlaying ? (
            <FaPause className="text-dark" />
          ) : (
            <FaPlay className="text-dark" />
          )}
        </button>

        <button onClick={() => toggleLike(song)} className="text-xl">
          {likedSongs?.some((s) => s.id === song.id) ? (
            <FaHeart className="text-light" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-light" />
          )}
        </button>
      </div>
    );
  });

  const renderSongs = (songs) =>
    songs.map((song) => {
      const isCurrent = currentSrc === song.audioUrl;
      return viewMode === "grid" ? (
        <GridCard
          key={song.id}
          song={song}
          isCurrent={isCurrent}
          isPlaying={isPlaying}
        />
      ) : (
        <ListRow
          key={song.id}
          song={song}
          isCurrent={isCurrent}
          isPlaying={isPlaying}
        />
      );
    });

  // 🔵 Playlist Section Styling
  const PlaylistSection = ({ title, id, songs }) => (
    <div className="mb-16">
      <div
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() =>
          setActiveSections((prev) => ({ ...prev, [id]: !prev[id] }))
        }
      >
        <h2 className="text-3xl font-bold text-light">{title}</h2>
        <span className="text-sm opacity-70">
          {activeSections[id] ? "▲ Hide" : "▼ Show"}
        </span>
      </div>

      {activeSections[id] && (
        <div className="transition-opacity duration-300 opacity-100">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {renderSongs(songs)}
            </div>
          ) : (
            <div className="space-y-3">{renderSongs(songs)}</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-dark text-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-light">
          🎧 Explore Playlists
        </h1>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-full ${
              viewMode === "grid"
                ? "bg-primary text-dark"
                : "bg-secondary text-light"
            }`}
          >
            <FaThLarge />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-full ${
              viewMode === "list"
                ? "bg-primary text-dark"
                : "bg-secondary text-light"
            }`}
          >
            <FaList />
          </button>
        </div>
      </div>

      <PlaylistSection
        title="🔥 Trending Worldwide"
        id="trending"
        songs={trendingSongs}
      />

      <PlaylistSection title="🎵 Hindi Playlist" id="hindi" songs={hindiSongs} />
      <PlaylistSection title="🎶 Telugu Music" id="telugu" songs={teluguSongs} />
      <PlaylistSection title="🌍 English Hits" id="english" songs={englishSongs} />
    </div>
  );
}

export default React.memo(Trending);
