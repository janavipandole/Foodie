// GitHub Repository Configuration
const REPO_OWNER = "janavipandole";
const REPO_NAME = "Foodie";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State Management
let allContributors = []; 
let filteredContributors = [];
let currentPage = 1;
const itemsPerPage = 12;

// Point System Weights
const POINTS = {
    L3: 11,      // Level 3
    L2: 5,       // Level 2
    L1: 2,       // Level 1
    DEFAULT: 1,  // Merged PR with no level label
    COMMIT: 1    // Fallback point per commit if no PRs found
};

document.addEventListener('DOMContentLoaded', () => {
    initData();
    fetchRecentActivity();
    setupEventListeners();
});

// 1. Data Fetching & Initialization
async function initData() {
    const grid = document.getElementById('contributorsList');
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        // Show loading
        document.getElementById('spinner').style.display = 'flex';
        if(grid) grid.innerHTML = '';
        if(errorMessage) errorMessage.innerText = '';

        // 1. Fetch Repo Info & Contributors List (Parallel)
        const [repoRes, contributorsRes] = await Promise.all([
            fetch(API_BASE),
            fetch(`${API_BASE}/contributors?per_page=100`)
        ]);

        if (!repoRes.ok || !contributorsRes.ok) throw new Error("API Limit Exceeded or Network Error");

        const repoData = await repoRes.json();
        const rawContributors = await contributorsRes.json();

        // 2. Fetch Pull Requests (To calculate points based on labels)
        // We fetch "all" states to credit merged PRs.
        const pullsData = await fetchAllPulls();

        // 3. Process the data
        processData(repoData, rawContributors, pullsData);

    } catch (error) {
        console.error('Error initializing data:', error);
        document.getElementById('spinner').style.display = 'none';
        if(errorMessage) errorMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Failed to load data. API limit may be exceeded.`;
    }
}

// Helper: Fetch PRs (Pages 1-3 to avoid hitting rate limit too fast)
async function fetchAllPulls() {
    let pulls = [];
    let page = 1;
    // Fetching top 300 recent PRs. Increase page limit if needed, but be wary of API limits.
    while (page <= 3) { 
        try {
            const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
            if (!res.ok) break;
            const data = await res.json();
            if (!data.length) break;
            pulls = pulls.concat(data);
            page++;
        } catch (e) { break; }
    }
    return pulls;
}

// 2. Data Processing
function processData(repoData, contributors, pulls) {
    const statsMap = {};
    let totalProjectPRs = 0;
    let totalProjectPoints = 0;
    let totalProjectCommits = 0;

    // A. MAP PRs -> USERS & CALCULATE POINTS
    pulls.forEach(pr => {
        // We generally only award points for Merged PRs, but if you want all opened PRs, remove the check.
        // For now, let's count anything that isn't closed without merge, or just count all.
        // Logic: If it is merged, full points.
        if (!pr.merged_at) return; 

        const user = pr.user.login;
        if (!statsMap[user]) statsMap[user] = { prs: 0, points: 0 };

        statsMap[user].prs++;
        totalProjectPRs++;

        let prPoints = 0;
        let hasLevel = false;

        // Check Labels
        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3')) { prPoints += POINTS.L3; hasLevel = true; }
            else if (name.includes('level 2')) { prPoints += POINTS.L2; hasLevel = true; }
            else if (name.includes('level 1')) { prPoints += POINTS.L1; hasLevel = true; }
        });

        // Default points if no level label found
        if (!hasLevel) prPoints += POINTS.DEFAULT;

        statsMap[user].points += prPoints;
        totalProjectPoints += prPoints;
    });

    // B. MERGE PR DATA WITH CONTRIBUTORS LIST
    allContributors = contributors.filter(c => c.type !== 'Bot').map(c => {
        const login = c.login;
        const userStats = statsMap[login] || { prs: 0, points: 0 };
        
        totalProjectCommits += c.contributions;

        // FINAL SCORE LOGIC:
        // Use the PR-calculated points. 
        // If a user has 0 PR points (maybe they are a legacy contributor or commit directly),
        // fallback to giving them 1 point per commit so they aren't zero.
        let finalPoints = userStats.points;
        if (finalPoints === 0) {
            finalPoints = c.contributions * POINTS.COMMIT;
        }

        return {
            login: c.login,
            id: c.id,
            avatar_url: c.avatar_url,
            html_url: c.html_url,
            contributions: c.contributions, // Actual Commits
            prs: userStats.prs,             // Actual PRs
            points: finalPoints             // Calculated Points
        };
    });

    // C. SORT BY POINTS (Descending)
    allContributors.sort((a, b) => b.points - a.points);

    // D. UPDATE DASHBOARD STATS
    updateGlobalStats(
        allContributors.length,
        totalProjectPRs,
        totalProjectPoints,
        repoData.stargazers_count,
        repoData.forks_count,
        totalProjectCommits
    );

    // E. RENDER
    filteredContributors = [...allContributors];
    document.getElementById('spinner').style.display = 'none';
    renderContributors(1);
}

function updateGlobalStats(count, prs, points, stars, forks, commits) {
    safeSetText('totalContributors', count);
    safeSetText('totalCommits', commits);
    safeSetText('totalPRs', prs);
    safeSetText('totalPoints', points);
    safeSetText('totalStars', stars);
    safeSetText('totalForks', forks);
}

// 3. Event Listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortBy = document.getElementById('sortBy');
    const filterLevel = document.getElementById('filterLevel');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('contributorModal');

    if (searchInput) searchInput.addEventListener('input', () => applyFilters());
    if (sortBy) sortBy.addEventListener('change', () => applyFilters());
    if (filterLevel) filterLevel.addEventListener('change', () => applyFilters());

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderContributors(currentPage); }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredContributors.length / itemsPerPage);
            if (currentPage < maxPage) { currentPage++; renderContributors(currentPage); }
        });
    }

    if(modalClose) modalClose.addEventListener('click', () => modal.classList.remove('active'));
    window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
}

// 4. Filtering Logic
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortType = document.getElementById('sortBy').value;
    const levelType = document.getElementById('filterLevel').value;

    let result = [...allContributors];

    // Search
    if (searchTerm) {
        result = result.filter(c => c.login.toLowerCase().includes(searchTerm));
    }

    // Level Filter
    if (levelType !== 'all') {
        result = result.filter(c => {
            const league = getLeagueData(c.points);
            if (levelType === 'top10') return true; 
            if (levelType === 'gold') return league.tier === 'league-gold';
            if (levelType === 'silver') return league.tier === 'league-silver';
            if (levelType === 'bronze') return league.tier === 'league-bronze';
            if (levelType === 'new') return c.contributions < 5;
            return true;
        });
    }

    // Sorting
    if (sortType === 'contributions') { // Actually sorts by Points
        result.sort((a, b) => b.points - a.points);
    } else if (sortType === 'alphabetical') {
        result.sort((a, b) => a.login.localeCompare(b.login));
    } else if (sortType === 'recent') {
        // Sort by commit count as a proxy for recent activity if dates aren't available
        result.sort((a, b) => b.contributions - a.contributions); 
    }

    // Top 10 Slice
    if (levelType === 'top10') {
        result.sort((a, b) => b.points - a.points);
        result = result.slice(0, 10);
    }

    filteredContributors = result;
    currentPage = 1;
    renderContributors(1);
}

// 5. Rendering
function renderContributors(page) {
    const grid = document.getElementById('contributorsList');
    if (!grid) return;
    grid.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = filteredContributors.slice(start, end);

    if (itemsToShow.length === 0) {
        grid.innerHTML = '<p class="para" style="grid-column: 1/-1; text-align: center;">No contributors match your search.</p>';
        updatePaginationUI();
        return;
    }

    itemsToShow.forEach((c, index) => {
        const rank = start + index + 1; // Rank based on current filtered order
        const league = getLeagueData(c.points);

        const card = document.createElement('div');
        card.className = `contrib-card ${league.tier}`;
        card.onclick = () => openContributorModal(c, league, rank);

        // Updated Card HTML to show Points and PRs clearly
        card.innerHTML = `
            <div class="contrib-img-wrapper">
                <img src="${c.avatar_url}" alt="${c.login}" class="contrib-img" loading="lazy">
            </div>
            <h3 class="contrib-name">${c.login}</h3>
            
            <div class="card-stats">
                <span class="card-stat-item" title="Total Points">
                    <i class="fa-solid fa-trophy"></i> ${c.points} Pts
                </span>
                <span class="card-stat-item" title="Merged Pull Requests">
                    <i class="fa-solid fa-code-branch"></i> ${c.prs} PRs
                </span>
            </div>
            
            <div class="contrib-links">
                 <a href="${c.html_url}" target="_blank" title="View GitHub Profile"><i class="fa-brands fa-github"></i></a>
            </div>
        `;
        grid.appendChild(card);
    });

    updatePaginationUI();
}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredContributors.length / itemsPerPage) || 1;
    safeSetText('currentPage', currentPage);
    safeSetText('totalPages', maxPage);
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === maxPage;
}

// 6. Modal & Utilities
function getLeagueData(points) {
    if (points >= 120) return { text: 'Gold', tier: 'league-gold', label: '🏆 Gold League' };
    if (points >= 60) return { text: 'Silver', tier: 'league-silver', label: '🥈 Silver League' };
    if (points >= 30) return { text: 'Bronze', tier: 'league-bronze', label: '🥉 Bronze League' };
    return { text: 'Contributor', tier: '', label: 'Contributor' };
}

function openContributorModal(c, league, rank) {
    const modal = document.getElementById('contributorModal');
    if (!modal) return;

    document.getElementById('modalAvatar').src = c.avatar_url;
    document.getElementById('modalName').textContent = c.login;
    document.getElementById('modalGithubLink').href = c.html_url;
    
    safeSetText('modalRank', `#${rank}`);
    safeSetText('modalPoints', c.points);
    safeSetText('modalLeague', league.label);
    safeSetText('modalCommits', c.contributions);
    safeSetText('modalPRs', c.prs);

    // Link to user's PRs in this specific repo
    const prLink = document.getElementById('viewPrBtn');
    if(prLink) prLink.href = `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls?q=is%3Apr+author%3A${c.login}`;

    modal.classList.add('active');
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// 7. Recent Activity
async function fetchRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/commits?per_page=5`);
        if(!response.ok) return;
        const commits = await response.json();
        const container = document.getElementById("timelineContent");
        if (!container) return;
        
        container.innerHTML = commits.map(c => {
            const msg = c.commit.message.split('\n')[0];
            const author = c.commit.author.name;
            const date = new Date(c.commit.author.date).toLocaleDateString();
            return `
                <div class="timeline-item">
                    <p><strong>${author}</strong> pushed code</p>
                    <p class="para" style="font-size: 0.9rem; margin: 5px 0;">"${msg}"</p>
                    <small style="color: var(--text-secondary);">${date}</small>
                </div>
            `;
        }).join('');
    } catch (e) { console.error('Timeline error:', e); }
}