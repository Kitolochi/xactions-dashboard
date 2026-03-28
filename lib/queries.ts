import { dbAll, dbGet } from "./db";

// Dashboard overview stats
export async function getDashboardStats() {
  const watchlistCount = await dbGet(
    "SELECT COUNT(*) as count FROM watchlist WHERE active = 1"
  );
  const topicCount = await dbGet(
    "SELECT COUNT(*) as count FROM topics WHERE active = 1"
  );
  const keywordCount = await dbGet(
    "SELECT COUNT(DISTINCT keyword) as count FROM keyword_tracking"
  );
  const snapshotCount = await dbGet(
    "SELECT COUNT(*) as count FROM snapshots"
  );

  return {
    watchlist: (watchlistCount?.count as number) || 0,
    topics: (topicCount?.count as number) || 0,
    keywords: (keywordCount?.count as number) || 0,
    snapshots: (snapshotCount?.count as number) || 0,
  };
}

// Top growing accounts
export async function getTopGrowing(days = 30, limit = 10) {
  const dateThreshold = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  const rows = await dbAll(
    `SELECT s.username, w.name, w.category,
            MIN(s.followers) AS first_followers,
            MAX(s.followers) AS latest_followers,
            COUNT(*) AS snapshot_count
     FROM snapshots s
     JOIN watchlist w ON w.username = s.username
     WHERE s.captured_at >= ? AND w.active = 1
     GROUP BY s.username
     HAVING snapshot_count >= 2
     ORDER BY (MAX(s.followers) - MIN(s.followers)) DESC
     LIMIT ?`,
    [dateThreshold, limit]
  );

  return rows.map((r) => {
    const first = r.first_followers as number;
    const latest = r.latest_followers as number;
    const delta = latest - first;
    const pct = first > 0 ? Math.round((delta / first) * 10000) / 100 : 0;
    return { ...r, delta, growth_pct: pct };
  });
}

// Top keywords by engagement
export async function getTopKeywords(limit = 10) {
  return dbAll(
    `SELECT keyword,
            SUM(tweet_count) as total_tweets,
            SUM(total_likes) as total_likes,
            SUM(total_retweets) as total_retweets,
            ROUND(AVG(avg_engagement), 2) as avg_engagement
     FROM keyword_tracking
     GROUP BY keyword
     ORDER BY avg_engagement DESC
     LIMIT ?`,
    [limit]
  );
}

// Engagement activity counts
export async function getEngagementActivity(days = 7) {
  const dateThreshold = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  return dbAll(
    `SELECT action, COUNT(*) AS count
     FROM engagement_log
     WHERE created_at >= ?
     GROUP BY action
     ORDER BY count DESC`,
    [dateThreshold]
  );
}

// Watchlist with latest snapshot
export async function getWatchlist(category?: string) {
  let sql = `
    SELECT w.username, w.name, w.category, w.description,
           s.followers, s.following, s.captured_at
    FROM watchlist w
    LEFT JOIN snapshots s ON s.username = w.username
      AND s.captured_at = (
        SELECT MAX(s2.captured_at) FROM snapshots s2 WHERE s2.username = w.username
      )
    WHERE w.active = 1
  `;
  const params: (string | number)[] = [];
  if (category) {
    sql += " AND w.category = ?";
    params.push(category);
  }
  sql += " ORDER BY s.followers DESC";
  return dbAll(sql, params);
}

// Watchlist categories
export async function getCategories() {
  return dbAll(
    "SELECT DISTINCT category FROM watchlist WHERE active = 1 AND category IS NOT NULL ORDER BY category"
  );
}

// Growth report
export async function getGrowthReport(days = 30, category?: string) {
  const dateThreshold = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  let sql = `
    SELECT s.username, w.name, w.category,
           MIN(s.followers) AS first_followers,
           MAX(s.followers) AS latest_followers,
           MIN(s.captured_at) AS first_snapshot,
           MAX(s.captured_at) AS latest_snapshot,
           COUNT(*) AS snapshot_count
    FROM snapshots s
    JOIN watchlist w ON w.username = s.username
    WHERE s.captured_at >= ? AND w.active = 1
  `;
  const params: (string | number)[] = [dateThreshold];
  if (category) {
    sql += " AND w.category = ?";
    params.push(category);
  }
  sql += " GROUP BY s.username";

  const rows = await dbAll(sql, params);
  return rows
    .map((r) => {
      const first = r.first_followers as number;
      const latest = r.latest_followers as number;
      const delta = latest - first;
      const pct = first > 0 ? Math.round((delta / first) * 10000) / 100 : 0;
      return { ...r, delta, growth_pct: pct };
    })
    .sort(
      (a, b) => (b.growth_pct as number) - (a.growth_pct as number)
    );
}

// Influence scores
export async function getInfluenceScores(category?: string) {
  let sql =
    "SELECT username, name, category FROM watchlist WHERE active = 1";
  const params: (string | number)[] = [];
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  const accounts = await dbAll(sql, params);
  const results = [];

  for (const account of accounts) {
    const snapshots = await dbAll(
      `SELECT followers, following, captured_at
       FROM snapshots WHERE username = ?
       ORDER BY captured_at DESC LIMIT 2`,
      [account.username as string]
    );

    if (snapshots.length === 0) continue;

    const latest = snapshots[0];
    const previous = snapshots.length > 1 ? snapshots[1] : null;
    const followers = latest.followers as number;
    const following = latest.following as number;

    const followerScore =
      followers > 0 ? Math.min(Math.log10(followers) / 7, 1) : 0;

    let growthScore = 0;
    if (previous && (previous.followers as number) > 0) {
      const delta = followers - (previous.followers as number);
      const rate = delta / (previous.followers as number);
      growthScore = Math.min(Math.max(rate * 100, 0), 1);
    }

    let engagementScore = 0;
    if (following > 0) {
      engagementScore = Math.min(followers / following / 20, 1);
    } else if (followers > 0) {
      engagementScore = 1;
    }

    const composite =
      Math.round(
        (followerScore * 0.3 + growthScore * 0.4 + engagementScore * 0.3) *
          1000
      ) / 10;

    results.push({
      username: account.username,
      name: account.name,
      category: account.category,
      followers,
      following,
      follower_score: Math.round(followerScore * 100) / 100,
      growth_score: Math.round(growthScore * 100) / 100,
      engagement_score: Math.round(engagementScore * 100) / 100,
      composite_score: composite,
    });
  }

  return results.sort((a, b) => b.composite_score - a.composite_score);
}

// Topics with latest volume
export async function getTopics() {
  const topics = await dbAll(
    "SELECT * FROM topics WHERE active = 1"
  );

  const results = [];
  for (const topic of topics) {
    const keywords = JSON.parse((topic.keywords as string) || "[]");
    let latestVolume = 0;
    let latestEngagement = 0;

    if (keywords.length > 0) {
      const placeholders = keywords.map(() => "?").join(", ");
      const rows = await dbAll(
        `SELECT keyword, tweet_count, avg_engagement
         FROM keyword_tracking
         WHERE keyword IN (${placeholders})
         AND captured_at = (
           SELECT MAX(k2.captured_at) FROM keyword_tracking k2 WHERE k2.keyword = keyword_tracking.keyword
         )`,
        keywords
      );

      for (const row of rows) {
        latestVolume += (row.tweet_count as number) || 0;
        latestEngagement += (row.avg_engagement as number) || 0;
      }
      if (rows.length > 0) {
        latestEngagement =
          Math.round((latestEngagement / rows.length) * 100) / 100;
      }
    }

    results.push({
      name: topic.name,
      keywords,
      description: topic.description,
      latest_volume: latestVolume,
      latest_engagement: latestEngagement,
    });
  }

  return results;
}

// Topic volume over time
export async function getTopicVolume(topicName: string, days = 30) {
  const topic = await dbGet("SELECT * FROM topics WHERE name = ?", [
    topicName,
  ]);
  if (!topic) return null;

  const keywords = JSON.parse((topic.keywords as string) || "[]");
  if (keywords.length === 0) return { topic: topicName, volume: [] };

  const dateThreshold = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();
  const placeholders = keywords.map(() => "?").join(", ");

  const rows = await dbAll(
    `SELECT date(captured_at) AS date,
            SUM(tweet_count) AS volume,
            ROUND(AVG(avg_engagement), 2) AS engagement
     FROM keyword_tracking
     WHERE keyword IN (${placeholders}) AND captured_at >= ?
     GROUP BY date(captured_at)
     ORDER BY date(captured_at)`,
    [...keywords, dateThreshold]
  );

  return { topic: topicName, description: topic.description, keywords, volume: rows };
}

// Keyword tracking data
export async function getKeywordData(days = 30) {
  const dateThreshold = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  return dbAll(
    `SELECT keyword, tweet_count, total_likes, total_retweets,
            avg_engagement, captured_at
     FROM keyword_tracking
     WHERE captured_at >= ?
     ORDER BY keyword, captured_at`,
    [dateThreshold]
  );
}

// Trending detection
export async function getTrending(days = 7, threshold = 2.0) {
  const now = Date.now();
  const recentStart = new Date(
    now - (days / 2) * 86_400_000
  ).toISOString();
  const earlierStart = new Date(now - days * 86_400_000).toISOString();

  const recentRows = await dbAll(
    `SELECT keyword, AVG(tweet_count) AS avg_volume, AVG(avg_engagement) AS avg_eng
     FROM keyword_tracking
     WHERE captured_at >= ?
     GROUP BY keyword`,
    [recentStart]
  );

  const earlierRows = await dbAll(
    `SELECT keyword, AVG(tweet_count) AS avg_volume, AVG(avg_engagement) AS avg_eng
     FROM keyword_tracking
     WHERE captured_at >= ? AND captured_at < ?
     GROUP BY keyword`,
    [earlierStart, recentStart]
  );

  const earlierMap: Record<string, Record<string, unknown>> = {};
  for (const row of earlierRows) {
    earlierMap[row.keyword as string] = row;
  }

  const trending = [];
  for (const recent of recentRows) {
    const earlier = earlierMap[recent.keyword as string];
    if (!earlier || (earlier.avg_volume as number) === 0) continue;

    const ratio =
      (recent.avg_volume as number) / (earlier.avg_volume as number);
    if (ratio >= threshold) {
      trending.push({
        keyword: recent.keyword,
        recent_avg_volume:
          Math.round((recent.avg_volume as number) * 100) / 100,
        earlier_avg_volume:
          Math.round((earlier.avg_volume as number) * 100) / 100,
        volume_ratio: Math.round(ratio * 100) / 100,
        recent_avg_engagement:
          Math.round((recent.avg_eng as number) * 100) / 100,
      });
    }
  }

  return trending.sort(
    (a, b) => b.volume_ratio - a.volume_ratio
  );
}

// Single account data
export async function getAccountData(username: string) {
  const account = await dbGet(
    "SELECT * FROM watchlist WHERE username = ?",
    [username]
  );
  if (!account) return null;

  const snapshots = await dbAll(
    `SELECT followers, following, captured_at
     FROM snapshots WHERE username = ?
     ORDER BY captured_at`,
    [username]
  );

  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const first = snapshots.length > 0 ? snapshots[0] : null;

  let delta = 0;
  let growthPct = 0;
  if (first && latest) {
    delta = (latest.followers as number) - (first.followers as number);
    growthPct =
      (first.followers as number) > 0
        ? Math.round((delta / (first.followers as number)) * 10000) / 100
        : 0;
  }

  // Influence score
  let influence = null;
  if (latest) {
    const followers = latest.followers as number;
    const following = latest.following as number;
    const followerScore =
      followers > 0 ? Math.min(Math.log10(followers) / 7, 1) : 0;

    let growthScore = 0;
    if (snapshots.length >= 2) {
      const prev = snapshots[snapshots.length - 2];
      if ((prev.followers as number) > 0) {
        const d = followers - (prev.followers as number);
        growthScore = Math.min(Math.max((d / (prev.followers as number)) * 100, 0), 1);
      }
    }

    let engagementScore = 0;
    if (following > 0) {
      engagementScore = Math.min(followers / following / 20, 1);
    } else if (followers > 0) {
      engagementScore = 1;
    }

    const composite =
      Math.round(
        (followerScore * 0.3 + growthScore * 0.4 + engagementScore * 0.3) * 1000
      ) / 10;

    influence = {
      follower_score: Math.round(followerScore * 100) / 100,
      growth_score: Math.round(growthScore * 100) / 100,
      engagement_score: Math.round(engagementScore * 100) / 100,
      composite_score: composite,
    };
  }

  return {
    account,
    snapshots,
    delta,
    growth_pct: growthPct,
    influence,
  };
}

// Sparkline data for a user
export async function getSparkline(username: string, limit = 20) {
  return dbAll(
    `SELECT followers, captured_at
     FROM snapshots WHERE username = ?
     ORDER BY captured_at DESC LIMIT ?`,
    [username, limit]
  );
}
