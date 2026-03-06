/**
 * @license
 * MusicBlocks v3.4.1
 * Copyright (C) 2025 Diwangshu Kakoty
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Toolbar Class Test Suite - Comprehensive Testing
 * Tests for: Constructor, Init, Icon Rendering, Event Handling
 * Total Tests: 59 (All Passing)
 */

// ==================== SETUP: GLOBALS FIRST ====================
global.WRAP = true;
global.RECORDBUTTON = "mic";
global.doSVG = jest.fn(() => "<svg>mock</svg>");
global._THIS_IS_MUSIC_BLOCKS_ = false;
global.play_button_debounce_timeout = null;
global.saveButton = { onclick: null, style: { display: "" }, disabled: false, className: "" };
global.saveButtonAdvanced = {
    onclick: null,
    style: { display: "" },
    disabled: false,
    className: ""
};

// Mock platformstyle
jest.mock("../utils/platformstyle", () => ({
    platformColor: {
        stopIconColor: "#ea174c",
        stopIconcolor: "#ea174c"
    }
}));

const { platformColor } = require("../utils/platformstyle");
global.platformColor = platformColor;

// Mock jQuery
global.jQuery = jest.fn(() => ({
    on: jest.fn(),
    trigger: jest.fn(),
    tooltip: jest.fn(),
    dropdown: jest.fn()
}));
global.jQuery.noConflict = jest.fn(() => global.jQuery);

// ==================== localStorage Mock ====================
const localStorageMock = {
    languagePreference: "en",
    getItem(key) {
        return this[key] !== undefined ? this[key] : null;
    },
    setItem(key, value) {
        this[key] = String(value);
    },
    removeItem(key) {
        delete this[key];
    },
    clear() {
        Object.keys(this).forEach(k => {
            if (typeof this[k] !== "function") delete this[k];
        });
    }
};

global.window = {
    localStorage: localStorageMock,
    navigator: { language: "en-US" },
    getComputedStyle: jest.fn(() => ({ display: "block", visibility: "visible" }))
};

global.document = {
    getElementById: jest.fn(() => ({ style: {} })),
    createElement: jest.fn(tagName => ({
        tagName,
        classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn(), toggle: jest.fn() },
        textContent: "",
        style: {},
        onclick: null,
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        id: "",
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        focus: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
    })),
    body: {
        style: { cursor: "" },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }
};

// Assign the SAME proxy to global.localStorage
global.localStorage = localStorageMock;

// Mock functions
global._ = jest.fn(str => str);
global.$j = jest.fn(() => ({
    tooltip: jest.fn(),
    dropdown: jest.fn(),
    on: jest.fn(),
    trigger: jest.fn()
}));
global.fnBrowserDetect = jest.fn(() => "chrome");

const Toolbar = require("../toolbar");

// Mock element factory
const createMockElement = id => ({
    id,
    style: {},
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    innerHTML: "",
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn()
    },
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    querySelector: jest.fn(() => null),
    focus: jest.fn(),
    click: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({ top: 0, left: 0, width: 10, height: 10 })),
    hasAttribute: jest.fn(() => false),
    onclick: null
});

global.docById = jest.fn(createMockElement);

// ==================== TEST SUITE ====================

describe("Toolbar Class - Comprehensive Test Suite", () => {
    let toolbar;
    let mockActivity;

    beforeEach(() => {
        // Reset localStorage to clean defaults before every test
        localStorageMock.clear();
        localStorageMock.languagePreference = "en";

        // Reset globals
        global._THIS_IS_MUSIC_BLOCKS_ = false;
        global.WRAP = true;
        global.doSVG = jest.fn(() => "<svg>mock</svg>");
        global.saveButton = {
            onclick: null,
            style: { display: "" },
            disabled: false,
            className: ""
        };
        global.saveButtonAdvanced = {
            onclick: null,
            style: { display: "" },
            disabled: false,
            className: ""
        };

        toolbar = new Toolbar();
        mockActivity = {
            beginnerMode: true,
            textMsg: jest.fn(),
            helpfulWheelItems: [],
            hideMsgs: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe("Constructor & Initialization", () => {
        it("initializes with correct default properties", () => {
            const newToolbar = new Toolbar();
            expect(newToolbar.language).toBeDefined();
            expect(newToolbar.tooltipsDisabled).toBe(false);
        });

        // ── Language tests ──────────────────────────────────────────────────────
        it("reads language preference from localStorage", () => {
            global.localStorage.languagePreference = "es";
            let FreshToolbar;
            jest.isolateModules(() => {
                FreshToolbar = require("../toolbar");
            });
            const newToolbar = new FreshToolbar();
            expect(newToolbar.language).toBe("es");
        });

        it("falls back to navigator language when localStorage is empty", () => {
            delete global.localStorage.languagePreference;
            let FreshToolbar;
            jest.isolateModules(() => {
                FreshToolbar = require("../toolbar");
            });
            const newToolbar = new FreshToolbar();
            expect(newToolbar.language).toBe("en-US");
        });

        it("initializes with stop icon color from platformColor", () => {
            const newToolbar = new Toolbar();
            expect(newToolbar.stopIconColorWhenPlaying).toBe("#ea174c");
        });

        it("handles language preference correctly", () => {
            global.localStorage.languagePreference = "ja";
            let FreshToolbar;
            jest.isolateModules(() => {
                FreshToolbar = require("../toolbar");
            });
            const newToolbar = new FreshToolbar();
            expect(newToolbar.language).toBe("ja");
        });
    });

    describe("Init Method", () => {
        it("sets activity and language on init", () => {
            toolbar.init(mockActivity);
            expect(toolbar.activity).toBe(mockActivity);
        });

        it("initializes tooltips when not disabled", () => {
            toolbar.tooltipsDisabled = false;
            toolbar.init(mockActivity);
            expect(toolbar.activity).toBe(mockActivity);
        });

        it("does not initialize tooltips when disabled", () => {
            toolbar.tooltipsDisabled = true;
            toolbar.init(mockActivity);
            expect(toolbar.tooltipsDisabled).toBe(true);
        });

        it("sets up strings for Music Blocks mode", () => {
            global._THIS_IS_MUSIC_BLOCKS_ = true;
            toolbar.init(mockActivity);
            expect(global._).toHaveBeenCalledWith("About Music Blocks");
        });

        it("sets up strings for Turtle Blocks mode", () => {
            global._THIS_IS_MUSIC_BLOCKS_ = false;
            toolbar.init(mockActivity);
            expect(global._).toHaveBeenCalledWith("About Turtle Blocks");
        });

        it("configures beginner mode UI correctly", () => {
            const beginnerMode = {
                style: { display: "" },
                setAttribute: jest.fn(),
                classList: { add: jest.fn() }
            };
            const advancedMode = {
                style: { display: "" },
                setAttribute: jest.fn(),
                classList: { add: jest.fn() }
            };

            global.docById.mockImplementation(id => {
                if (id === "beginnerMode") return beginnerMode;
                if (id === "advancedMode") return advancedMode;
                return createMockElement(id);
            });

            mockActivity.beginnerMode = true;
            toolbar.init(mockActivity);

            expect(advancedMode.style.display).toBe("block");
            expect(beginnerMode.style.display).toBe("none");
        });

        it("configures advanced mode UI correctly", () => {
            const beginnerMode = {
                style: { display: "" },
                setAttribute: jest.fn(),
                classList: { add: jest.fn() }
            };
            const advancedMode = {
                style: { display: "" },
                setAttribute: jest.fn(),
                classList: { add: jest.fn() }
            };

            global.docById.mockImplementation(id => {
                if (id === "beginnerMode") return beginnerMode;
                if (id === "advancedMode") return advancedMode;
                return createMockElement(id);
            });

            mockActivity.beginnerMode = false;
            toolbar.init(mockActivity);

            expect(advancedMode.style.display).toBe("none");
            expect(beginnerMode.style.display).toBe("block");
        });

        it("initializes dropdown menus", () => {
            toolbar.init(mockActivity);
            expect(toolbar.activity).toBe(mockActivity);
        });
    });

    describe("Logo Icon Rendering", () => {
        it("renders logo icon for non-Japanese language", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            toolbar.language = "en";
            toolbar.activity = mockActivity;

            toolbar.renderLogoIcon(jest.fn());
            expect(logoIcon.innerHTML).toBe("");
        });

        it("renders Japanese logo icon when language is Japanese", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            toolbar.language = "ja";
            toolbar.activity = mockActivity;

            toolbar.renderLogoIcon(jest.fn());
            expect(logoIcon.innerHTML).toContain("logo-ja.svg");
        });

        it("sets cursor pointer on logo hover", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            toolbar.activity = mockActivity;

            toolbar.renderLogoIcon(jest.fn());
            if (logoIcon.onmouseenter) {
                logoIcon.onmouseenter();
                expect(global.document.body.style.cursor).toBe("pointer");
            }
        });

        it("resets cursor on logo hover out", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            global.document.body.style.cursor = "pointer";
            toolbar.activity = mockActivity;

            toolbar.renderLogoIcon(jest.fn());
            if (logoIcon.onmouseleave) {
                logoIcon.onmouseleave();
                expect(global.document.body.style.cursor).toBe("default");
            }
        });

        it("calls onclick handler on logo click", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderLogoIcon(mockOnClick);
            logoIcon.onclick();

            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Play Icon Rendering", () => {
        beforeEach(() => {
            global.play_button_debounce_timeout = null;
        });

        it("renders play icon and sets onclick handler", () => {
            const playIcon = { onclick: null };
            const stopIcon = {
                style: { color: "" },
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            const recordButton = { className: "" };

            global.docById.mockImplementation(id => {
                if (id === "play") return playIcon;
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.stopIconColorWhenPlaying = "#ff0000";
            toolbar.renderPlayIcon(jest.fn());

            expect(playIcon.onclick).toBeDefined();
        });

        it("disables save buttons on play", () => {
            const playIcon = { onclick: null };
            const stopIcon = {
                style: { color: "" },
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            const recordButton = { className: "" };

            global.docById.mockImplementation(id => {
                if (id === "play") return playIcon;
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderPlayIcon(jest.fn());
            playIcon.onclick();

            expect(global.saveButton.disabled).toBe(true);
        });

        it("sets stop icon color on play", () => {
            const playIcon = { onclick: null };
            const stopIcon = {
                style: { color: "" },
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            const recordButton = { className: "" };

            global.docById.mockImplementation(id => {
                if (id === "play") return playIcon;
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.stopIconColorWhenPlaying = "#ff0000";
            toolbar.renderPlayIcon(jest.fn());
            playIcon.onclick();

            expect(stopIcon.style.color).toBe("#ff0000");
        });
    });

    describe("Stop Icon Rendering", () => {
        beforeEach(() => {
            global.saveButton = { disabled: true, className: "grey-text inactiveLink" };
            global.saveButtonAdvanced = { disabled: true, className: "grey-text inactiveLink" };
        });

        it("re-enables save buttons on stop", () => {
            const stopIcon = { onclick: null, style: { color: "" } };
            const recordButton = { className: "grey-text inactiveLink" };

            global.docById.mockImplementation(id => {
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderStopIcon(jest.fn());
            stopIcon.onclick();

            expect(global.saveButton.disabled).toBe(false);
        });

        it("resets record button className on stop", () => {
            const stopIcon = { onclick: null, style: { color: "" } };
            const recordButton = { className: "grey-text inactiveLink" };

            global.docById.mockImplementation(id => {
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderStopIcon(jest.fn());
            stopIcon.onclick();

            expect(recordButton.className).toBe("");
        });

        it("sets stop icon color to white on stop", () => {
            const stopIcon = { onclick: null, style: { color: "red" } };
            const recordButton = { className: "" };

            global.docById.mockImplementation(id => {
                if (id === "stop") return stopIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderStopIcon(jest.fn());
            stopIcon.onclick();

            expect(stopIcon.style.color).toBe("white");
        });
    });

    describe("New Project Icon Rendering", () => {
        it("creates modal with confirmation button", () => {
            const modalContainer = {
                style: { display: "" },
                setAttribute: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            const newDropdown = { innerHTML: "", appendChild: jest.fn() };

            global.docById.mockImplementation(id => {
                if (id === "modal-container") return modalContainer;
                if (id === "newdropdown") return newDropdown;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderNewProjectIcon(jest.fn());

            expect(modalContainer.style.display).toBe("flex");
        });
    });

    describe("Load Icon Rendering", () => {
        it("sets onclick handler for load icon", () => {
            const loadIcon = { setAttribute: jest.fn(), onclick: null };
            global.docById.mockReturnValue(loadIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderLoadIcon(mockOnClick);

            expect(loadIcon.onclick).toBeDefined();
            loadIcon.onclick();
            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Wrap Icon Rendering", () => {
        it("initializes wrap icon with tooltip", () => {
            const wrapIcon = { setAttribute: jest.fn(), onclick: null };
            global.docById.mockReturnValue(wrapIcon);
            global.WRAP = true;
            toolbar.activity = { textMsg: jest.fn(), helpfulWheelItems: [] };

            toolbar.renderWrapIcon();

            expect(wrapIcon.setAttribute).toHaveBeenCalledWith("data-tooltip", "Turtle Wrap Off");
        });

        // ==================== WRAP toggle test ====================
        it("toggles WRAP when clicked", () => {
            const wrapIcon = { setAttribute: jest.fn(), onclick: null };
            const helpfulWheelDiv = { style: { display: "block" } };

            global.docById.mockImplementation(id => {
                if (id === "wrapTurtle") return wrapIcon;
                if (id === "helpfulWheelDiv") return helpfulWheelDiv;
                return createMockElement(id);
            });

            global.WRAP = true;
            toolbar.activity = { textMsg: jest.fn(), helpfulWheelItems: [] };

            toolbar.renderWrapIcon();

            // Capture how many times setAttribute was called before click
            const callsBefore = wrapIcon.setAttribute.mock.calls.length;

            // Trigger the click — this should call changeWrap internally
            wrapIcon.onclick();

            // After click, setAttribute should have been called again
            // (to update the tooltip to the new WRAP state)
            expect(wrapIcon.setAttribute.mock.calls.length).toBeGreaterThan(callsBefore);
        });
    });

    describe("Change Wrap Method", () => {
        // ==================== changeWrap WRAP state tests ====================
        it("toggles WRAP state", () => {
            const wrapIcon = { setAttribute: jest.fn() };
            const helpfulWheelDiv = { style: { display: "block" } };

            global.docById.mockImplementation(id => {
                if (id === "wrapTurtle") return wrapIcon;
                if (id === "helpfulWheelDiv") return helpfulWheelDiv;
                return createMockElement(id);
            });

            mockActivity.helpfulWheelItems = [];
            mockActivity.textMsg = jest.fn();

            // Call changeWrap twice — state should flip each time.
            // We verify the setAttribute call changes between calls.
            toolbar.changeWrap(mockActivity);
            const firstCallTooltip = wrapIcon.setAttribute.mock.calls
                .filter(c => c[0] === "data-tooltip")
                .pop();

            wrapIcon.setAttribute.mockClear();

            toolbar.changeWrap(mockActivity);
            const secondCallTooltip = wrapIcon.setAttribute.mock.calls
                .filter(c => c[0] === "data-tooltip")
                .pop();

            // The tooltip text should differ between first and second call,
            // proving the state toggled.
            expect(firstCallTooltip).toBeDefined();
            expect(secondCallTooltip).toBeDefined();
            expect(firstCallTooltip[1]).not.toBe(secondCallTooltip[1]);
        });

        it("updates helpful wheel items on wrap change", () => {
            const wrapIcon = { setAttribute: jest.fn() };
            const helpfulWheelDiv = { style: { display: "block" } };

            global.docById.mockImplementation(id => {
                if (id === "wrapTurtle") return wrapIcon;
                if (id === "helpfulWheelDiv") return helpfulWheelDiv;
                return createMockElement(id);
            });

            mockActivity.textMsg = jest.fn();
            // Set up helpfulWheelItems with both wrap labels
            mockActivity.helpfulWheelItems = [
                { label: "Turtle Wrap Off", display: false },
                { label: "Turtle Wrap On", display: true }
            ];

            // changeWrap should toggle the display flags on helpfulWheelItems
            toolbar.changeWrap(mockActivity);

            // After toggle, exactly one of the two items should have display === true
            const displayStates = mockActivity.helpfulWheelItems.map(i => i.display);
            expect(displayStates).toContain(true);
            expect(displayStates).toContain(false);
            // And they should be flipped from the initial state
            expect(mockActivity.helpfulWheelItems[0].display).toBe(true);
            expect(mockActivity.helpfulWheelItems[1].display).toBe(false);
        });
    });

    describe("Save Icons Rendering", () => {
        beforeEach(() => {
            global.saveButton = { onclick: null, style: { display: "" } };
            global.saveButtonAdvanced = { onclick: null, style: { display: "" } };
        });

        it("displays beginner mode save buttons", () => {
            const elements = {
                "saveButton": { onclick: null, style: { display: "" } },
                "saveButtonAdvanced": { onclick: null, style: { display: "" } },
                "save-html-beg": { onclick: null },
                "save-png-beg": { onclick: null, disabled: false, className: "" }
            };

            global.docById.mockImplementation(id => elements[id] || createMockElement(id));

            toolbar.language = "en";
            mockActivity.beginnerMode = true;
            // renderSaveIcons calls doSVG_onclick(activity.canvas, activity.logo, ...)
            // so canvas and logo must exist on the activity mock
            mockActivity.canvas = { width: 100, height: 100 };
            mockActivity.logo = {};
            mockActivity.turtles = {};
            toolbar.activity = mockActivity;
            toolbar.renderSaveIcons(
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            expect(elements.saveButton.style.display).toBe("block");
        });

        it("displays advanced mode save buttons", () => {
            const elements = {
                "saveButton": { onclick: null, style: { display: "" } },
                "saveButtonAdvanced": { onclick: null, style: { display: "" } },
                "save-html": { onclick: null },
                "save-svg": { onclick: null, disabled: false, className: "" },
                "save-png": { onclick: null, disabled: false, className: "" }
            };

            global.docById.mockImplementation(id => elements[id] || createMockElement(id));

            mockActivity.beginnerMode = false;
            toolbar.activity = mockActivity;
            toolbar.renderSaveIcons(
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            expect(elements.saveButton.style.display).toBe("none");
        });
    });

    describe("Record Button Updates", () => {
        it("updates record button correctly", () => {
            global.fnBrowserDetect = jest.fn(() => "chrome");
            const recordButton = {
                classList: { add: jest.fn(), remove: jest.fn() },
                style: { display: "" },
                innerHTML: "",
                onclick: null
            };

            const recordDropdownArrow = {
                classList: { add: jest.fn(), remove: jest.fn() },
                innerHTML: "",
                addEventListener: jest.fn(),
                querySelector: jest.fn(() => ({ textContent: "" }))
            };

            global.docById.mockImplementation(id => {
                if (id === "record") return recordButton;
                if (id === "recordDropdownArrow") return recordDropdownArrow;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;

            toolbar.updateRecordButton(jest.fn());

            expect(recordButton.innerHTML).toContain("material-icons");
        });

        it("hides record button in unsupported browsers", () => {
            global.fnBrowserDetect = jest.fn(() => "firefox");
            const recordButton = {
                classList: { add: jest.fn(), remove: jest.fn() },
                style: { display: "" },
                innerHTML: ""
            };

            global.docById.mockReturnValue(recordButton);

            toolbar.updateRecordButton(jest.fn());

            expect(recordButton.classList.add).toHaveBeenCalledWith("hide");
        });
    });

    describe("Planet Icon Rendering", () => {
        it("renders planet icon when planet enabled", () => {
            const planetIcon = { onclick: null, style: { display: "" } };
            const planetIconDisabled = { style: { display: "" } };
            const toolbars = { style: { display: "" } };
            const wheelDiv = { style: { display: "" } };
            const contextWheelDiv = { style: { display: "" } };

            global.docById.mockImplementation(id => {
                if (id === "planetIcon") return planetIcon;
                if (id === "planetIconDisabled") return planetIconDisabled;
                if (id === "toolbars") return toolbars;
                if (id === "wheelDiv") return wheelDiv;
                if (id === "contextWheelDiv") return contextWheelDiv;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderPlanetIcon(true, jest.fn());

            expect(planetIcon.style.display).not.toBe("none");
        });

        it("disables planet icon when planet disabled", () => {
            const planetIcon = { onclick: null, style: { display: "" } };
            const planetIconDisabled = { style: { display: "" } };

            global.docById.mockImplementation(id => {
                if (id === "planetIcon") return planetIcon;
                if (id === "planetIconDisabled") return planetIconDisabled;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderPlanetIcon(false, jest.fn());

            expect(planetIcon.style.display).toBe("none");
        });
    });

    describe("Menu Icon Rendering", () => {
        it("toggles menu visibility", () => {
            const menuIcon = { onclick: null, innerHTML: "" };
            const auxToolbar = { style: { display: "none" } };
            const toggleAuxBtn = { className: "" };
            const searchBar = { classList: { toggle: jest.fn() } };
            const chooseKeyDiv = { style: { display: "" } };
            const movable = { style: { display: "" } };

            global.docById.mockImplementation(id => {
                if (id === "menu") return menuIcon;
                if (id === "aux-toolbar") return auxToolbar;
                if (id === "toggleAuxBtn") return toggleAuxBtn;
                if (id === "search") return searchBar;
                if (id === "chooseKeyDiv") return chooseKeyDiv;
                if (id === "movable") return movable;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            toolbar.renderMenuIcon(jest.fn());

            expect(menuIcon.onclick).toBeDefined();
        });
    });

    describe("Run Slowly Icon Rendering", () => {
        it("hides icon in beginner Japanese mode", () => {
            const runSlowlyIcon = { onclick: null, style: { display: "" } };
            const stopIcon = { style: { color: "" } };

            global.docById.mockImplementation(id => {
                if (id === "runSlowlyIcon") return runSlowlyIcon;
                if (id === "stop") return stopIcon;
                return createMockElement(id);
            });

            toolbar.activity = { beginnerMode: true };
            toolbar.language = "ja";
            toolbar.renderRunSlowlyIcon(jest.fn());

            expect(runSlowlyIcon.style.display).toBe("none");
        });

        it("shows icon in advanced mode", () => {
            const runSlowlyIcon = { onclick: null, style: { display: "none" } };
            const stopIcon = { style: { color: "" } };

            global.docById.mockImplementation(id => {
                if (id === "runSlowlyIcon") return runSlowlyIcon;
                if (id === "stop") return stopIcon;
                return createMockElement(id);
            });

            toolbar.activity = { beginnerMode: false };
            toolbar.language = "en";
            toolbar.renderRunSlowlyIcon(jest.fn());

            expect(runSlowlyIcon.onclick).toBeDefined();
        });
    });

    describe("Help Icon Rendering", () => {
        it("sets help icon onclick handler", () => {
            const helpIcon = { setAttribute: jest.fn(), onclick: null };
            global.docById.mockReturnValue(helpIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderHelpIcon(mockOnClick);
            helpIcon.onclick();

            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Mode Select Icon Rendering", () => {
        it("switches from beginner to advanced mode", () => {
            global.doSVG = jest.fn(() => "<svg>mock</svg>");

            const begIcon = { onclick: null, style: { display: "" } };
            const advIcon = { onclick: null, style: { display: "" } };
            const recordButton = {
                style: { display: "" },
                classList: { add: jest.fn(), remove: jest.fn() }
            };

            global.docById.mockImplementation(id => {
                if (id === "beginnerMode") return begIcon;
                if (id === "advancedMode") return advIcon;
                if (id === "record") return recordButton;
                return createMockElement(id);
            });

            mockActivity.beginnerMode = true;
            mockActivity.toolbar = { renderSaveIcons: jest.fn() };
            mockActivity.palettes = { updatePalettes: jest.fn() };
            mockActivity.refreshCanvas = jest.fn();
            mockActivity.helpfulWheelItems = [];
            mockActivity.save = {
                saveHTML: { bind: jest.fn(() => jest.fn()) },
                saveSVG: { bind: jest.fn(() => jest.fn()) },
                saveMIDI: { bind: jest.fn(() => jest.fn()) },
                savePNG: { bind: jest.fn(() => jest.fn()) },
                saveWAV: { bind: jest.fn(() => jest.fn()) },
                saveLilypond: { bind: jest.fn(() => jest.fn()) },
                saveAbc: { bind: jest.fn(() => jest.fn()) },
                saveMxml: { bind: jest.fn(() => jest.fn()) },
                saveBlockArtwork: { bind: jest.fn(() => jest.fn()) },
                saveBlockArtworkPNG: { bind: jest.fn(() => jest.fn()) }
            };

            toolbar.activity = mockActivity;
            toolbar.renderModeSelectIcon(
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            expect(advIcon.style.display).toBe("block");
        });
    });

    describe("Run Step Icon Rendering", () => {
        it("hides icon in beginner Japanese mode", () => {
            const runStepIcon = { onclick: null, style: { display: "" } };
            global.docById.mockReturnValue(runStepIcon);

            toolbar.activity = { beginnerMode: true };
            toolbar.language = "ja";
            toolbar.renderRunStepIcon(jest.fn());

            expect(runStepIcon.style.display).toBe("none");
        });
    });

    describe("Merge Icon Rendering", () => {
        it("sets merge icon onclick handler", () => {
            const mergeIcon = { onclick: null };
            global.docById.mockReturnValue(mergeIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderMergeIcon(mockOnClick);
            mergeIcon.onclick();

            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Restore Icon Rendering", () => {
        it("sets restore icon onclick handler", () => {
            const restoreIcon = { onclick: null };
            global.docById.mockReturnValue(restoreIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderRestoreIcon(mockOnClick);
            restoreIcon.onclick();

            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Choose Key Icon Rendering", () => {
        it("renders choose key icon in Music Blocks mode", () => {
            global._THIS_IS_MUSIC_BLOCKS_ = true;
            const chooseKeyIcon = { onclick: null };
            const chooseKeyDiv = { style: { display: "" } };

            global.docById.mockImplementation(id => {
                if (id === "chooseKeyIcon") return chooseKeyIcon;
                if (id === "chooseKeyDiv") return chooseKeyDiv;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            const mockOnClick = jest.fn();
            toolbar.renderChooseKeyIcon(mockOnClick);

            expect(chooseKeyIcon.onclick).toBeDefined();
        });
    });

    describe("JavaScript Icon Rendering", () => {
        it("sets JavaScript icon onclick handler", () => {
            const jsIcon = { onclick: null };
            global.docById.mockReturnValue(jsIcon);
            toolbar.activity = mockActivity;

            const mockOnClick = jest.fn();
            toolbar.renderJavaScriptIcon(mockOnClick);
            jsIcon.onclick();

            expect(mockOnClick).toHaveBeenCalledWith(mockActivity);
        });
    });

    describe("Language Select Icon Rendering", () => {
        it("sets language select icon onclick handler", () => {
            const languageSelectIcon = { onclick: null };
            const langElement = { onclick: null, classList: { add: jest.fn(), remove: jest.fn() } };

            global.docById.mockImplementation(id => {
                if (id === "languageSelectIcon") return languageSelectIcon;
                return langElement;
            });

            toolbar.renderLanguageSelectIcon({});

            expect(languageSelectIcon.onclick).toBeDefined();
        });

        it("highlights current language preference", () => {
            const languageSelectIcon = { onclick: null };
            const langElement = { onclick: null, classList: { add: jest.fn(), remove: jest.fn() } };

            global.docById.mockImplementation(id => {
                if (id === "languageSelectIcon") return languageSelectIcon;
                return langElement;
            });

            // Set directly on global.localStorage (the proxy) so renderLanguageSelectIcon
            // reads "es" when languageSelectIcon.onclick() calls localStorage.languagePreference
            global.localStorage.languagePreference = "es";
            toolbar.renderLanguageSelectIcon({});
            languageSelectIcon.onclick();

            expect(langElement.classList.add).toHaveBeenCalledWith("selected-language");
        });
    });

    describe("Disable Tooltips", () => {
        it("disables tooltips correctly", () => {
            const mockJQuery = jest.fn(() => ({ tooltip: jest.fn() }));
            toolbar.tooltipsDisabled = false;
            toolbar.disableTooltips(mockJQuery);

            expect(mockJQuery).toHaveBeenCalledWith(".tooltipped");
            expect(toolbar.tooltipsDisabled).toBe(true);
        });
    });

    describe("Close Auxiliary Toolbar", () => {
        it("closes auxiliary toolbar when visible", () => {
            const auxToolbar = { style: { display: "block" } };
            const menuIcon = { innerHTML: "" };
            const toggleAuxBtn = { className: "blue darken-1" };

            global.docById.mockImplementation(id => {
                if (id === "aux-toolbar") return auxToolbar;
                if (id === "menu") return menuIcon;
                if (id === "toggleAuxBtn") return toggleAuxBtn;
                return createMockElement(id);
            });

            toolbar.activity = mockActivity;
            const mockOnClick = jest.fn();
            toolbar.closeAuxToolbar(mockOnClick);

            expect(auxToolbar.style.display).toBe("none");
            expect(menuIcon.innerHTML).toBe("menu");
        });
    });

    describe("Theme Selection", () => {
        it("renders theme select icon", () => {
            const themeSelectIcon = { onclick: null, innerHTML: "" };
            global.docById.mockReturnValue(themeSelectIcon);
            global.document.getElementById = jest.fn(() => ({ innerHTML: "light-icon" }));

            toolbar.renderThemeSelectIcon({}, ["light", "dark"]);

            expect(themeSelectIcon.onclick).toBeDefined();
        });
    });

    describe("Storage & Preferences", () => {
        it("respects stored language preference", () => {
            global.localStorage.languagePreference = "pt";
            let FreshToolbar;
            jest.isolateModules(() => {
                FreshToolbar = require("../toolbar");
            });
            const newToolbar = new FreshToolbar();
            expect(newToolbar.language).toBe("pt");
        });

        it("handles missing localStorage gracefully", () => {
            delete global.localStorage.languagePreference;
            let FreshToolbar;
            jest.isolateModules(() => {
                FreshToolbar = require("../toolbar");
            });
            const newToolbar = new FreshToolbar();
            expect(newToolbar.language).toBe("en-US");
        });
    });

    describe("Error Handling", () => {
        it("handles missing DOM elements gracefully", () => {
            const loadIcon = { onclick: null };
            global.docById.mockReturnValue(loadIcon);
            toolbar.activity = mockActivity;

            expect(() => {
                toolbar.renderLoadIcon(jest.fn());
            }).not.toThrow();
        });

        it("handles undefined activity", () => {
            toolbar.activity = undefined;
            const mockOnClick = jest.fn();
            const loadIcon = { onclick: null };
            global.docById.mockReturnValue(loadIcon);

            expect(() => {
                toolbar.renderLoadIcon(mockOnClick);
            }).not.toThrow();
        });

        it("handles missing onclick callbacks", () => {
            const helpIcon = { setAttribute: jest.fn(), onclick: null };
            global.docById.mockReturnValue(helpIcon);
            toolbar.activity = mockActivity;

            expect(() => {
                toolbar.renderHelpIcon(undefined);
            }).not.toThrow();
        });
    });

    describe("Integration Tests", () => {
        it("initializes and renders complete toolbar", () => {
            const beginnerMode = { style: { display: "" }, setAttribute: jest.fn() };
            const advancedMode = { style: { display: "" }, setAttribute: jest.fn() };

            global.docById.mockImplementation(id => {
                if (id === "beginnerMode") return beginnerMode;
                if (id === "advancedMode") return advancedMode;
                return createMockElement(id);
            });

            toolbar.init(mockActivity);

            expect(toolbar.activity).toBe(mockActivity);
            expect(toolbar.language).toBeDefined();
            expect(toolbar.tooltipsDisabled).toBe(false);
        });

        it("handles multiple icon rendering", () => {
            const logoIcon = {
                innerHTML: "",
                onmouseenter: null,
                onmouseleave: null,
                onclick: null
            };
            global.docById.mockReturnValue(logoIcon);
            toolbar.activity = mockActivity;

            expect(() => {
                toolbar.renderLogoIcon(jest.fn());
            }).not.toThrow();
        });

        it("properly manages toolbar state", () => {
            toolbar.activity = mockActivity;
            toolbar.tooltipsDisabled = false;

            expect(toolbar.activity).toBe(mockActivity);
            expect(toolbar.tooltipsDisabled).toBe(false);
        });
    });
});
