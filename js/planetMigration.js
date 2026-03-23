const PlanetMigration = (function () {

    const dummyPlanetProjects = [
        {
            id: "proj_001",
            name: "My Jazz Composition",
            lastModified: "December 1, 2024"
        },
        {
            id: "proj_002",
            name: "Drum Pattern Practice",
            lastModified: "November 15, 2024"
        },
        {
            id: "proj_003",
            name: "Scale Explorer",
            lastModified: "October 20, 2024"
        },
        {
            id: "proj_004",
            name: "Rhythm Experiment",
            lastModified: "September 5, 2024"
        }
    ];

    async function hashPassphrase(passphrase) {
        const encoder = new TextEncoder();
        const data = encoder.encode(passphrase);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function stopKeyEvents(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        ['keydown', 'keyup', 'keypress'].forEach(evt => {
            el.addEventListener(evt, e => e.stopPropagation());
        });
    }

    function showMigrationModal() {
        const existing = document.getElementById('migration-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'migration-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: Arial, sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                width: 460px;
                max-width: 92vw;
                max-height: 82vh;
                overflow-y: auto;
                box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="
                            width:32px;height:32px;
                            background:#1a73e8;
                            border-radius:8px;
                            display:flex;align-items:center;justify-content:center;
                        ">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <h2 style="margin:0;font-size:17px;color:#1a1a1a;font-weight:600;">
                            Migrate from Planet
                        </h2>
                    </div>
                    <span id="migration-close" style="
                        font-size:20px;cursor:pointer;color:#aaa;
                        width:28px;height:28px;display:flex;
                        align-items:center;justify-content:center;
                        border-radius:50%;
                        transition:background 0.15s;
                    " onmouseover="this.style.background='#f0f0f0'" 
                       onmouseout="this.style.background='transparent'">
                        &#215;
                    </span>
                </div>

                <p style="font-size:12px;color:#777;margin:0 0 16px 0;">
                    Select the projects you want to bring into the new Git-backed system.
                </p>

                <div id="project-list" style="margin-bottom:16px;">
                    ${dummyPlanetProjects.map(p => `
                        <label for="proj-${p.id}" style="
                            display:flex;align-items:center;
                            padding:10px 12px;
                            border:1.5px solid #e8e8e8;
                            border-radius:10px;
                            margin-bottom:8px;
                            cursor:pointer;
                            transition:border-color 0.15s, background 0.15s;
                        " onmouseover="this.style.borderColor='#1a73e8';this.style.background='#f6faff'"
                           onmouseout="this.style.borderColor='#e8e8e8';this.style.background='white'">
                            <input type="checkbox" 
                                   id="proj-${p.id}" 
                                   value="${p.id}"
                                   style="margin-right:12px;cursor:pointer;width:16px;height:16px;accent-color:#1a73e8;">
                            <div style="
                                width:44px;height:44px;
                                border-radius:8px;
                                background:linear-gradient(135deg,#87CEEB,#4fa8d5);
                                margin-right:12px;
                                flex-shrink:0;
                                display:flex;align-items:center;justify-content:center;
                            ">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <path d="M9 18V5l12-2v13"/>
                                    <circle cx="6" cy="18" r="3"/>
                                    <circle cx="18" cy="16" r="3"/>
                                </svg>
                            </div>
                            <div>
                                <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:2px;">
                                    ${p.name}
                                </div>
                                <div style="font-size:11px;color:#999;">
                                    Last modified: ${p.lastModified}
                                </div>
                            </div>
                        </label>
                    `).join('')}
                </div>

                <div style="display:flex;gap:10px;">
                    <button id="migration-cancel" style="
                        flex:1;padding:10px;border-radius:8px;
                        border:1.5px solid #e0e0e0;background:white;
                        cursor:pointer;font-size:13px;color:#555;
                        font-weight:500;transition:background 0.15s;
                    " onmouseover="this.style.background='#f5f5f5'"
                       onmouseout="this.style.background='white'">
                        Cancel
                    </button>
                    <button id="migration-next" style="
                        flex:1;padding:10px;border-radius:8px;
                        border:none;background:#1a73e8;
                        color:white;cursor:pointer;font-size:13px;
                        font-weight:500;transition:background 0.15s;
                    " onmouseover="this.style.background='#1558b0'"
                       onmouseout="this.style.background='#1a73e8'">
                        Next &rarr;
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('migration-close')
            .addEventListener('click', () => modal.remove());
        document.getElementById('migration-cancel')
            .addEventListener('click', () => modal.remove());
        document.getElementById('migration-next')
            .addEventListener('click', () => {
                const selected = [
                    ...document.querySelectorAll(
                        '#project-list input[type="checkbox"]:checked'
                    )
                ].map(cb => cb.value);

                if (selected.length === 0) {
                    alert('Please select at least one project to migrate.');
                    return;
                }
                showPassphraseScreen(modal, selected);
            });
    }

    function showPassphraseScreen(modal, selectedProjects) {
        const inner = modal.querySelector('div');
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="
                        width:32px;height:32px;
                        background:#1a73e8;
                        border-radius:8px;
                        display:flex;align-items:center;justify-content:center;
                    ">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h2 style="margin:0;font-size:17px;color:#1a1a1a;font-weight:600;">
                        Protect Your Projects
                    </h2>
                </div>
                <span id="migration-close-2" style="
                    font-size:20px;cursor:pointer;color:#aaa;
                    width:28px;height:28px;display:flex;
                    align-items:center;justify-content:center;
                    border-radius:50%;
                " onmouseover="this.style.background='#f0f0f0'"
                   onmouseout="this.style.background='transparent'">
                    &#215;
                </span>
            </div>

            <p style="font-size:12px;color:#777;margin:0 0 14px 0;">
                Choose a passphrase to identify yourself as the owner 
                of your migrated projects.
            </p>

            <div style="
                background:#f0f7ff;border-radius:8px;
                padding:10px 12px;margin-bottom:14px;
                font-size:12px;color:#1a73e8;
                border-left:3px solid #1a73e8;
            ">
                <strong>Tip:</strong> If you have migrated projects before, 
                use the same passphrase to manage all your projects together 
                from any device.
            </div>

            <div style="position:relative;margin-bottom:10px;">
                <input type="password" 
                       id="migration-passphrase"
                       placeholder="Enter your passphrase"
                       style="
                           width:100%;
                           padding:10px 40px 10px 12px;
                           border-radius:8px;
                           border:1.5px solid #e0e0e0;
                           font-size:13px;
                           box-sizing:border-box;
                           outline:none;
                           transition:border-color 0.15s;
                       "
                       onfocus="this.style.borderColor='#1a73e8'"
                       onblur="this.style.borderColor='#e0e0e0'">
                <span id="toggle-passphrase" style="
                    position:absolute;right:10px;top:50%;
                    transform:translateY(-50%);
                    cursor:pointer;font-size:16px;
                    color:#aaa;user-select:none;
                    transition:color 0.15s;
                " title="Show/hide passphrase">
                    &#128065;
                </span>
            </div>

            <div style="
                background:#fff8e1;border-radius:8px;
                padding:10px 12px;margin-bottom:18px;
                font-size:12px;color:#f57c00;
                border-left:3px solid #f57c00;
            ">
                <strong>Remember this passphrase</strong> — it cannot be 
                recovered if forgotten. You will need it to edit your 
                projects from any computer.
            </div>

            <div style="display:flex;gap:10px;">
                <button id="passphrase-back" style="
                    flex:1;padding:10px;border-radius:8px;
                    border:1.5px solid #e0e0e0;background:white;
                    cursor:pointer;font-size:13px;color:#555;
                    font-weight:500;
                " onmouseover="this.style.background='#f5f5f5'"
                   onmouseout="this.style.background='white'">
                    &larr; Back
                </button>
                <button id="passphrase-migrate" style="
                    flex:1;padding:10px;border-radius:8px;
                    border:none;background:#1a73e8;
                    color:white;cursor:pointer;font-size:13px;
                    font-weight:500;
                " onmouseover="this.style.background='#1558b0'"
                   onmouseout="this.style.background='#1a73e8'">
                    Migrate Projects
                </button>
            </div>
        `;

        // Stop keyboard events reaching Music Blocks
        stopKeyEvents('migration-passphrase');

        // Toggle password visibility
        document.getElementById('toggle-passphrase')
            .addEventListener('click', function () {
                const input = document.getElementById('migration-passphrase');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.style.color = '#1a73e8';
                } else {
                    input.type = 'password';
                    this.style.color = '#aaa';
                }
            });

        document.getElementById('migration-close-2')
            .addEventListener('click', () => modal.remove());

        document.getElementById('passphrase-back')
            .addEventListener('click', () => {
                modal.remove();
                showMigrationModal();
            });

        document.getElementById('passphrase-migrate')
            .addEventListener('click', async () => {
                const passphrase = document.getElementById(
                    'migration-passphrase'
                ).value.trim();

                if (!passphrase) {
                    alert('Please enter a passphrase.');
                    return;
                }

                const btn = document.getElementById('passphrase-migrate');
                btn.textContent = 'Migrating...';
                btn.disabled = true;
                btn.style.background = '#aaa';

                const hash = await hashPassphrase(passphrase);
                await new Promise(resolve => setTimeout(resolve, 1500));
                showSuccessScreen(modal, selectedProjects, hash);
            });
    }

    function showSuccessScreen(modal, selectedProjects, hash) {
        const projectNames = selectedProjects.map(id => {
            const p = dummyPlanetProjects.find(p => p.id === id);
            return p ? p.name : id;
        });

        const inner = modal.querySelector('div');
        inner.innerHTML = `
            <div style="text-align:center;padding:8px 0 4px 0;">

                <div style="
                    width:60px;height:60px;
                    background:#e8f5e9;
                    border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    margin:0 auto 16px auto;
                ">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" 
                         stroke="#34a853" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>

                <h2 style="margin:0 0 6px 0;font-size:18px;color:#1a1a1a;font-weight:600;">
                    Migration Complete!
                </h2>

                <p style="font-size:13px;color:#777;margin:0 0 18px 0;">
                    ${projectNames.length} project${projectNames.length > 1 ? 's' : ''} 
                    migrated successfully to the Git-backed system.
                </p>

                <div style="text-align:left;margin-bottom:14px;">
                    ${projectNames.map(name => `
                        <div style="
                            display:flex;align-items:center;gap:10px;
                            padding:9px 12px;
                            background:#f0f7ff;
                            border-radius:8px;
                            margin-bottom:6px;
                            font-size:13px;color:#1a1a1a;
                        ">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                                 stroke="#34a853" stroke-width="2.5">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            ${name}
                        </div>
                    `).join('')}
                </div>

                <div style="
                    background:#fff8e1;border-radius:8px;
                    padding:10px 12px;margin-bottom:18px;
                    font-size:12px;color:#f57c00;
                    text-align:left;
                    border-left:3px solid #f57c00;
                ">
                    <strong>Remember your passphrase</strong> — you will need 
                    it to edit these projects from any device or browser.
                </div>

                <button id="migration-done" style="
                    width:100%;padding:11px;border-radius:8px;
                    border:none;background:#1a73e8;
                    color:white;cursor:pointer;font-size:13px;
                    font-weight:500;
                " onmouseover="this.style.background='#1558b0'"
                   onmouseout="this.style.background='#1a73e8'">
                    Open My Projects
                </button>
            </div>
        `;

        document.getElementById('migration-done')
            .addEventListener('click', () => modal.remove());
    }

    return {
        showMigrationModal: showMigrationModal
    };

})();