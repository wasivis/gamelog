import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";

const STATUS_ORDER = ["wishlist", "playing", "completed"];

export default function Profile() {
	const { username } = useParams();
	const isLoggedIn = Boolean(localStorage.getItem("token"));
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sortBy, setSortBy] = useState("status");
	const [filterStatus, setFilterStatus] = useState("all");

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true);
				setError("");
				const { data } = await API.get(`/users/${username}`);
				setProfileData(data);
			} catch (err) {
				setError(err.response?.data?.message || "Could not load public profile.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [username]);

	const sortedBacklog = useMemo(() => {
		const backlog = profileData?.backlog || [];

		return [...backlog].sort((a, b) => {
			if (sortBy === "alphabetical") {
				return (a.gameTitle || "").localeCompare(b.gameTitle || "");
			}

			const aStatusIndex = STATUS_ORDER.indexOf(a.status || "wishlist");
			const bStatusIndex = STATUS_ORDER.indexOf(b.status || "wishlist");

			if (aStatusIndex !== bStatusIndex) {
				return aStatusIndex - bStatusIndex;
			}

			return (a.gameTitle || "").localeCompare(b.gameTitle || "");
		});
	}, [profileData, sortBy]);

	const reviews = profileData?.reviews || [];
	const filteredBacklog = filterStatus === "all"
		? sortedBacklog
		: sortedBacklog.filter((g) => (g.status || "wishlist") === filterStatus);
	const profileGameCoverMap = useMemo(
		() =>
			Object.fromEntries(
				sortedBacklog
					.filter((g) => g.gameTitle && g.coverUrl)
					.map((g) => [g.gameTitle.trim().toLowerCase(), g.coverUrl])
			),
		[sortedBacklog]
	);

	return (
		<div className="dashboard">
			<div className="dashboard-header">
				<div>
					<div className="auth-hero profile-title">
						<span>{profileData?.username || username}'s </span>
						<span>Backlog</span>
					</div>
				</div>
				<Link className="btn btn-ghost btn-sm" to={isLoggedIn ? "/dashboard" : "/"}>
					{isLoggedIn ? "Back to dashboard" : "Sign in"}
				</Link>
			</div>

			{loading ? (
				<div className="empty-state">Loading profile...</div>
			) : error ? (
				<div className="error-msg">{error}</div>
			) : (
				<>
					{sortedBacklog.length > 0 && (
						<div className="backlog-toolbar">
							<div className="backlog-filters">
								{["all", ...STATUS_ORDER].map((s) => (
									<button
										key={s}
										className={`filter-pill${filterStatus === s ? " filter-pill--active" : ""}`}
										onClick={() => setFilterStatus(s)}
									>
										{s === "all" ? "All" : s}
										<span className="filter-pill-count">
											{s === "all"
												? sortedBacklog.length
												: sortedBacklog.filter((g) => (g.status || "wishlist") === s).length}
										</span>
									</button>
								))}
							</div>
							<div className="backlog-sort">
								<label htmlFor="profile-backlog-sort" className="backlog-sort-label">Sort by</label>
								<select
									id="profile-backlog-sort"
									className="input backlog-sort-select"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
								>
									<option value="status">Status</option>
									<option value="alphabetical">Alphabetical (A-Z)</option>
								</select>
							</div>
						</div>
					)}

					{sortedBacklog.length === 0 ? (
						<div className="empty-state">No games in this backlog yet.</div>
					) : filteredBacklog.length === 0 ? (
						<div className="empty-state">No games with status "{filterStatus}".</div>
					) : (
						<div className="game-list">
							{filteredBacklog.map((game) => (
								<div className="game-card" key={game._id}>
									<div className="game-info">
										{game.coverUrl ? (
											<img src={game.coverUrl} alt="" className="game-cover" />
										) : (
											<div className="game-cover game-cover--placeholder" />
										)}
										<span className="game-title">{game.gameTitle}</span>
										<span className={`badge badge-${game.status || "wishlist"}`}>
											{game.status || "wishlist"}
										</span>
									</div>
								</div>
							))}
						</div>
					)}

					<section className="review-section">
						<div className="review-header">
							<h2>Reviews</h2>
						</div>

						{reviews.length === 0 ? (
							<div className="empty-state review-empty">No reviews yet.</div>
						) : (
							<div className="review-list">
								{reviews.map((review) => (
									<article className="review-card" key={review._id}>
										<div className="review-card-top">
											{(review.coverUrl || profileGameCoverMap[review.gameTitle?.trim().toLowerCase()]) ? (
												<img
													src={review.coverUrl || profileGameCoverMap[review.gameTitle.trim().toLowerCase()]}
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
									</article>
								))}
							</div>
						)}
					</section>
				</>
			)}
		</div>
	);
}
