const GitEducation = (function () {

    const STORAGE_KEY = 'gitEducationProgress';

    const MOMENTS = {
        firstSave: {
            title: 'Your project was saved as a snapshot',
            body: 'This is called a commit — think of it like a photograph of your project right now. You can always come back to this exact version later, even after making lots of changes.',
            button: 'Got it'
        },
        firstHistory: {
            title: 'This is your project\'s timeline',
            body: 'Every row here is a snapshot of your project from a different point in time. Click "Load this version" on any row to travel back to exactly how your project sounded then. Your current version is always safe.',
            button: 'Got it'
        },
        firstVersionTravel: {
            title: 'You just travelled back in time',
            body: 'Nothing is ever truly lost. You are looking at an older version of your project. Want to keep working from here? Just save normally and a new snapshot will be created.',
            button: 'Got it'
        },
        firstFork: {
            title: 'You just made this project your own',
            body: 'Forking creates your personal copy of someone else\'s project — with their complete history included. You can change anything without affecting the original.',
            button: 'Got it'
        },
        firstPR: {
            title: 'You just proposed a change',
            body: 'A pull request is a way of saying: I made something — would you like to add it to your project? The project owner will be able to see your changes and decide whether to include them.',
            button: 'Got it'
        },
        firstReceivedPR: {
            title: 'Someone wants to contribute to your project',
            body: 'Another student forked your project and made some changes. You can review what they changed and decide to add it to your project or leave it for now.',
            button: 'Review their changes'
        }
    };

    function getProgress() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || '{}'
            );
        } catch (e) {
            return {};
        }
    }

    function shouldShowTutorial(moment) {
        const progress = getProgress();
        return !progress[moment];
    }

    function markTutorialSeen(moment) {
        const progress = getProgress();
        progress[moment] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    function showTutorial(moment) {
    if (!shouldShowTutorial(moment)) return;

    const data = MOMENTS[moment];
    if (!data) return;

    const existing = document.getElementById('git-education-card');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.id = 'git-education-card';
    
    // Inline styles — no external CSS needed
    card.style.position = 'fixed';
    card.style.bottom = '20px';
    card.style.right = '20px';
    card.style.width = '280px';
    card.style.background = 'white';
    card.style.zIndex = '999999';
    card.style.padding = '16px';
    card.style.borderRadius = '12px';
    card.style.border = '1px solid #e0e0e0';
    card.style.fontFamily = 'sans-serif';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';

    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:bold;color:#1a1a1a;line-height:1.4;flex:1;margin-right:8px;">${data.title}</span>
            <span id="git-education-close" style="font-size:18px;color:#999;cursor:pointer;line-height:1;flex-shrink:0;">&#215;</span>
        </div>
        <p style="font-size:12px;color:#555;line-height:1.5;margin:0 0 12px 0;">${data.body}</p>
        <button id="git-education-btn" style="background:#1a73e8;color:white;border:none;border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer;float:right;">${data.button}</button>
    `;

    document.body.appendChild(card);

    document.getElementById('git-education-btn')
        .addEventListener('click', function () {
            markTutorialSeen(moment);
            card.remove();
        });

    document.getElementById('git-education-close')
        .addEventListener('click', function () {
            markTutorialSeen(moment);
            card.remove();
        });
}

    return {
        showTutorial: showTutorial,
        shouldShowTutorial: shouldShowTutorial
    };

})();