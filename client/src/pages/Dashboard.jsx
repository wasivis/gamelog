import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const STATUSES = ["wishlist", "playing", "completed"];

const getStatusWidth = (status = "wishlist") => {
  const extraForArrow = 4.1;
  const statusBonus = {
    wishlist: 0,
    playing: 0.5,
    completed: 1.5,
  };
  return `${status.length + extraForArrow + (statusBonus[status] || 0)}ch`;
};

export default function Dashboard() {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
  const [addError, setAddError] = useState("");
  const [sortBy, setSortBy] = useState("status");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [reviewGameTitle, setReviewGameTitle] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [editReviewGameTitle, setEditReviewGameTitle] = useState("");
  const [editReviewRating, setEditReviewRating] = useState("5");
  const [editReviewComment, setEditReviewComment] = useState("");
  const [editReviewLoading, setEditReviewLoading] = useState(false);
  const [editReviewError, setEditReviewError] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const fetchGames = async () => {
    try {
      const { data } = await API.get("/backlog");
      setGames(data);
    } catch (err) {
      console.error("Error fetching backlog:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get("/reviews");
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await API.get("/auth/me");
      setCurrentUsername(data?.username || "");
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchReviews();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const query = title.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setHighlightedSearchIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { data } = await API.get("/igdb/search", { params: { q: query } });
        setSearchResults(Array.isArray(data) ? data : []);
        setIsResultsOpen(true);
        setHighlightedSearchIndex(-1);
      } catch (err) {
        console.error("Error searching IGDB:", err);
        setSearchResults([]);
        setHighlightedSearchIndex(-1);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [title]);

  const handleAdd = async () => {
    const normalizedTitle = title.trim().toLowerCase();
    if (!normalizedTitle) return;

    if (games.some((game) => game.gameTitle?.trim().toLowerCase() === normalizedTitle)) {
      setAddError("That game is already in your backlog.");
      return;
    }

    try {
      setAddError("");
      setLoading(true);
      await API.post("/backlog", {
        gameTitle: title,
        coverUrl: selectedCoverUrl,
      });
      setTitle("");
      setSelectedCoverUrl(null);
      setSearchResults([]);
      setIsResultsOpen(false);
      fetchGames();
    } catch (err) {
      setAddError(err.response?.data?.message || "Error adding game.");
      console.error("Error adding game:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (searchResults.length === 0) return;
      e.preventDefault();
      setIsResultsOpen(true);
      setHighlightedSearchIndex((currentIndex) =>
        currentIndex >= searchResults.length - 1 ? 0 : currentIndex + 1
      );
      return;
    }

    if (e.key === "ArrowUp") {
      if (searchResults.length === 0) return;
      e.preventDefault();
      setIsResultsOpen(true);
      setHighlightedSearchIndex((currentIndex) =>
        currentIndex <= 0 ? searchResults.length - 1 : currentIndex - 1
      );
      return;
    }

    if (e.key === "Escape") {
      setIsResultsOpen(false);
      setHighlightedSearchIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      if (isResultsOpen && highlightedSearchIndex >= 0 && searchResults[highlightedSearchIndex]) {
        e.preventDefault();
        selectSearchResult(searchResults[highlightedSearchIndex]);
        return;
      }

      handleAdd();
    }
  };

  const selectSearchResult = (result) => {
    setTitle(result.name);
    setSelectedCoverUrl(result.coverUrl || null);
    setSearchResults([]);
    setIsResultsOpen(false);
    setHighlightedSearchIndex(-1);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/backlog/${id}`, { status });
      fetchGames();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteGame = async (id) => {
    try {
      await API.delete(`/backlog/${id}`);
      fetchGames();
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This will remove your backlog and reviews."
    );

    if (!confirmed) return;

    try {
      setDeleteAccountLoading(true);
      await API.delete("/auth/me");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      alert(err.response?.data?.message || "Could not delete account. Please try again.");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleCreateReview = async () => {
    const normalizedGameTitle = reviewGameTitle.trim();

    if (!normalizedGameTitle) {
      setReviewError("Pick or enter a game title first.");
      return;
    }

    if (isDuplicateReviewTitle) {
      setReviewError("You already reviewed that game.");
      return;
    }

    try {
      setReviewError("");
      setReviewLoading(true);

      let reviewCoverUrl =
        gameCoverMap[normalizedGameTitle.toLowerCase()] || null;

      if (!reviewCoverUrl) {
        try {
          const { data } = await API.get("/igdb/search", {
            params: { q: normalizedGameTitle },
          });
          if (Array.isArray(data) && data.length > 0) {
            reviewCoverUrl = data[0].coverUrl || null;
          }
        } catch (coverErr) {
          console.error("Error fetching review cover:", coverErr);
        }
      }

      await API.post("/reviews", {
        gameTitle: normalizedGameTitle,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        coverUrl: reviewCoverUrl,
      });

      setReviewComment("");
      setReviewRating("5");
      setReviewGameTitle("");
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not save review.");
      console.error("Error creating review:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditReviewGameTitle(review.gameTitle || "");
    setEditReviewRating(String(review.rating || 5));
    setEditReviewComment(review.comment || "");
    setEditReviewError("");
  };

  const cancelEditReview = () => {
    setEditingReviewId("");
    setEditReviewGameTitle("");
    setEditReviewRating("5");
    setEditReviewComment("");
    setEditReviewError("");
  };

  const handleUpdateReview = async (reviewId) => {
    const normalizedGameTitle = editReviewGameTitle.trim();

    if (!normalizedGameTitle) {
      setEditReviewError("Game title is required when editing a review.");
      return;
    }

    if (isDuplicateEditReviewTitle) {
      setEditReviewError("You already reviewed that game.");
      return;
    }

    try {
      setEditReviewError("");
      setEditReviewLoading(true);

      let reviewCoverUrl = gameCoverMap[normalizedGameTitle.toLowerCase()] || null;

      if (!reviewCoverUrl) {
        try {
          const { data } = await API.get("/igdb/search", {
            params: { q: normalizedGameTitle },
          });
          if (Array.isArray(data) && data.length > 0) {
            reviewCoverUrl = data[0].coverUrl || null;
          }
        } catch (coverErr) {
          console.error("Error fetching edited review cover:", coverErr);
        }
      }

      await API.put(`/reviews/${reviewId}`, {
        gameTitle: normalizedGameTitle,
        rating: Number(editReviewRating),
        comment: editReviewComment.trim(),
        coverUrl: reviewCoverUrl,
      });

      cancelEditReview();
      fetchReviews();
    } catch (err) {
      setEditReviewError(err.response?.data?.message || "Could not update review.");
      console.error("Error updating review:", err);
    } finally {
      setEditReviewLoading(false);
    }
  };

  const availableReviewGames = games
    .map((game) => game.gameTitle)
    .filter(Boolean)
    .filter((gameTitle, index, list) => list.indexOf(gameTitle) === index)
    .sort((a, b) => a.localeCompare(b));

  const gameCoverMap = Object.fromEntries(
    games
      .filter((g) => g.gameTitle && g.coverUrl)
      .map((g) => [g.gameTitle.trim().toLowerCase(), g.coverUrl])
  );

  const sortedGames = [...games].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return (a.gameTitle || "").localeCompare(b.gameTitle || "");
    }

    const statusOrder = STATUSES;
    const aStatusIndex = statusOrder.indexOf(a.status || "wishlist");
    const bStatusIndex = statusOrder.indexOf(b.status || "wishlist");

    if (aStatusIndex !== bStatusIndex) {
      return aStatusIndex - bStatusIndex;
    }

    return (a.gameTitle || "").localeCompare(b.gameTitle || "");
  });

  const filteredGames = filterStatus === "all"
    ? sortedGames
    : sortedGames.filter((g) => (g.status || "wishlist") === filterStatus);

  const isDuplicateTitle = games.some(
    (game) => game.gameTitle?.trim().toLowerCase() === title.trim().toLowerCase()
  );

  const normalizedReviewGameTitle = reviewGameTitle.trim().toLowerCase();
  const normalizedEditReviewGameTitle = editReviewGameTitle.trim().toLowerCase();

  const isDuplicateReviewTitle = reviews.some(
    (review) => review.gameTitle?.trim().toLowerCase() === normalizedReviewGameTitle
  );

  const isDuplicateEditReviewTitle = reviews.some(
    (review) =>
      review._id !== editingReviewId
      && review.gameTitle?.trim().toLowerCase() === normalizedEditReviewGameTitle
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="auth-hero">
          <span>My </span><span>Backlog</span>
        </div>
        <div className="dashboard-header-actions">
          {currentUsername && (
            <Link className="btn btn-ghost btn-sm" to={`/u/${currentUsername}`}>
              View public profile
            </Link>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="add-form">
        <div className="search-box">
          <input
            className="input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSelectedCoverUrl(null);
              setAddError("");
              setHighlightedSearchIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0 || title.trim().length >= 2) {
                setIsResultsOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setIsResultsOpen(false), 120);
            }}
            placeholder="Search games..."
          />

          {isResultsOpen && (isSearching || searchResults.length > 0 || title.trim().length >= 2) && (
            <div className="search-results">
              {isSearching ? (
                <div className="search-result-item search-result-item--muted">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    className={`search-result-item${highlightedSearchIndex === index ? " search-result-item--active" : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSearchResult(result);
                    }}
                    onMouseEnter={() => setHighlightedSearchIndex(index)}
                  >
                    {result.coverUrl ? (
                      <img
                        src={result.coverUrl}
                        alt=""
                        className="search-result-thumb"
                      />
                    ) : (
                      <div className="search-result-thumb search-result-thumb--placeholder" />
                    )}
                    <span>{result.name}</span>
                  </button>
                ))
              ) : (
                <div className="search-result-item search-result-item--muted">No matches found</div>
              )}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "auto", marginTop: 0 }}
          onClick={handleAdd}
          disabled={!title.trim() || loading || isDuplicateTitle}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {(addError || isDuplicateTitle) && (
        <div className="error-msg">
          {addError || "That game is already in your backlog."}
        </div>
      )}

      {games.length === 0 ? (
        <div className="empty-state">No games yet — add one above.</div>
      ) : (
        <>
          <div className="backlog-toolbar">
            <div className="backlog-filters">
              {["all", ...STATUSES].map((s) => (
                <button
                  key={s}
                  className={`filter-pill${filterStatus === s ? " filter-pill--active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === "all" ? "All" : s}
                  <span className="filter-pill-count">
                    {s === "all"
                      ? games.length
                      : games.filter((g) => (g.status || "wishlist") === s).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="backlog-sort">
              <label htmlFor="backlog-sort" className="backlog-sort-label">Sort by</label>
              <select
                id="backlog-sort"
                className="input backlog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="status">Status</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {filteredGames.length === 0 && (
            <div className="empty-state">No games with status "{filterStatus}".</div>
          )}

          <div className="game-list">
            {filteredGames.map((game) => (
            <div className="game-card" key={game._id}>
              <div className="game-info">
                {game.coverUrl ? (
                  <img src={game.coverUrl} alt="" className="game-cover" />
                ) : (
                  <div className="game-cover game-cover--placeholder" />
                )}
                <span className="game-title">{game.gameTitle}</span>
                <select
                  className={`status-select status-select--${game.status || "wishlist"}`}
                  value={game.status || "wishlist"}
                  style={{ width: getStatusWidth(game.status || "wishlist") }}
                  onChange={(e) => updateStatus(game._id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="game-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteGame(game._id)}
                >
                  Remove
                </button>
              </div>
            </div>
            ))}
          </div>
        </>
      )}

      <section className="review-section">
        <div className="review-header">
          <h2>My Reviews</h2>
        </div>

        <div className="review-form">
          <div className="review-grid">
            <input
              className="input"
              list="review-game-options"
              value={reviewGameTitle}
              onChange={(e) => {
                setReviewGameTitle(e.target.value);
                setReviewError("");
              }}
              placeholder="Game title"
            />
            <datalist id="review-game-options">
              {availableReviewGames.map((gameTitle) => (
                <option key={gameTitle} value={gameTitle} />
              ))}
            </datalist>

            <select
              className="input review-rating"
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
            >
              <option value="5">5 / 5</option>
              <option value="4">4 / 5</option>
              <option value="3">3 / 5</option>
              <option value="2">2 / 5</option>
              <option value="1">1 / 5</option>
            </select>
          </div>

          <textarea
            className="input review-comment"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Short comment (optional)"
            rows={3}
          />

          <button
            className="btn btn-primary review-submit"
            type="button"
            onClick={handleCreateReview}
            disabled={reviewLoading || !reviewGameTitle.trim() || isDuplicateReviewTitle}
          >
            {reviewLoading ? "Saving..." : "Save review"}
          </button>
        </div>

        {(reviewError || isDuplicateReviewTitle) && (
          <div className="error-msg">
            {reviewError || "You already reviewed that game."}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="empty-state review-empty">No reviews yet.</div>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-card-top">
                  {(review.coverUrl || gameCoverMap[review.gameTitle?.trim().toLowerCase()]) ? (
                    <img
                      src={review.coverUrl || gameCoverMap[review.gameTitle.trim().toLowerCase()]}
                      alt=""
                      className="game-cover"
                    />
                  ) : (
                    <div className="game-cover game-cover--placeholder" />
                  )}
                  <h3>{review.gameTitle}</h3>
                  <span className="review-rating-pill">{review.rating}/5</span>
                </div>

                {review.comment ? (
                  <p className="review-comment-text">{review.comment}</p>
                ) : (
                  <p className="review-comment-text review-comment-text--muted">No comment</p>
                )}

                {editingReviewId === review._id && (
                  <div className="review-edit-form">
                    <div className="review-grid">
                      <input
                        className="input"
                        value={editReviewGameTitle}
                        onChange={(e) => {
                          setEditReviewGameTitle(e.target.value);
                          setEditReviewError("");
                        }}
                        placeholder="Game title"
                      />

                      <select
                        className="input review-rating"
                        value={editReviewRating}
                        onChange={(e) => setEditReviewRating(e.target.value)}
                      >
                        <option value="5">5 / 5</option>
                        <option value="4">4 / 5</option>
                        <option value="3">3 / 5</option>
                        <option value="2">2 / 5</option>
                        <option value="1">1 / 5</option>
                      </select>
                    </div>

                    <textarea
                      className="input review-comment"
                      value={editReviewComment}
                      onChange={(e) => setEditReviewComment(e.target.value)}
                      placeholder="Short comment (optional)"
                      rows={3}
                    />

                    {(editReviewError || isDuplicateEditReviewTitle) && (
                      <div className="error-msg review-inline-error">
                        {editReviewError || "You already reviewed that game."}
                      </div>
                    )}

                    <div className="review-edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={() => handleUpdateReview(review._id)}
                        disabled={editReviewLoading || !editReviewGameTitle.trim() || isDuplicateEditReviewTitle}
                      >
                        {editReviewLoading ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={cancelEditReview}
                        disabled={editReviewLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="review-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => startEditReview(review)}
                    disabled={editReviewLoading && editingReviewId === review._id}
                  >
                    Edit review
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={editReviewLoading && editingReviewId === review._id}
                  >
                    Delete review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="account-danger-zone">
        <div className="account-danger-text">
          <p className="account-danger-label">Danger zone</p>
          <p className="account-danger-hint">Delete your account and permanently remove your backlog and reviews.</p>
        </div>
        <button
          className="btn btn-danger btn-sm"
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleteAccountLoading}
        >
          {deleteAccountLoading ? "Deleting..." : "Delete account"}
        </button>
      </section>
    </div>
  );
}