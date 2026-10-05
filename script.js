/* ==========================================================
   SPINSPIRE
   ========================================================== */

/* ---------- State ---------- */

let projects = [];
let savedProjects = [];

let selectedDegree = null;
let selectedDifficulty = null;

let currentProject = null;
let previousProjectId = null;

let spinCount = 0;
let spinning = false;
let spinSession = 0;

/* Delay (ms) before a new spin starts after the result screen closes.
   Kept small so the spin feels instant. */
const SPIN_START_DELAY = 120;


/* ---------- DOM references ---------- */

const $ = id => document.getElementById(id);

const brand = $("brand");

const degreeScreen = $("degreeScreen");
const difficultyScreen = $("difficultyScreen");
const roulette = $("roulette");

const degreeGrid = $("degreeGrid");
const anythingButton = $("anythingButton");
const anyDifficultyButton = $("anyDifficultyButton");
const difficultyBackButton = $("difficultyBackButton");

const degreeIndicator = $("degreeIndicator");
const difficultyIndicator = $("difficultyIndicator");
const currentDegreeLabel = $("currentDegreeLabel");
const currentDifficultyLabel = $("currentDifficultyLabel");

const roulettePrompt = $("roulettePrompt");
const categoryPrompt = $("categoryPrompt");
const projectWord = $("projectWord");
const projectWordText = $("projectWordText");
const categoryWord = $("categoryWord");
const categoryWordText = $("categoryWordText");

const spinButton = $("spinButton");
const spaceButton = $("spaceButton");
const spinCountElement = $("spinCount");

const resultScreen = $("resultScreen");
const projectTitle = $("projectTitle");
const projectDescription = $("projectDescription");
const resultDegree = $("resultDegree");
const resultCategory = $("resultCategory");
const resultDifficulty = $("resultDifficulty");
const technologyList = $("technologyList");

const anotherButton = $("anotherButton");
const backButton = $("backButton");
const saveProjectButton = $("saveProjectButton");
const saveIcon = $("saveIcon");
const saveText = $("saveText");
const exploreButton = $("exploreButton");

const exploreScreen = $("exploreScreen");
const exploreBackButton = $("exploreBackButton");
const exploreTitle = $("exploreTitle");
const exploreDescription = $("exploreDescription");
const exploreDegree = $("exploreDegree");
const exploreCategory = $("exploreCategory");
const exploreDifficulty = $("exploreDifficulty");
const exploreIdea = $("exploreIdea");
const exploreFeatures = $("exploreFeatures");
const exploreTechnologies = $("exploreTechnologies");
const exploreRoadmap = $("exploreRoadmap");
const exploreSkills = $("exploreSkills");
const exploreLevel = $("exploreLevel");
const exploreSaveButton = $("exploreSaveButton");
const exploreAnotherButton = $("exploreAnotherButton");

const savedHeaderButton = $("savedHeaderButton");
const savedCount = $("savedCount");
const savedScreen = $("savedScreen");
const savedList = $("savedList");
const closeSavedButton = $("closeSavedButton");

const statusScreen = $("statusScreen");
const statusText = $("statusText");


/* ==========================================================
   AUDIO
   ========================================================== */

let audioContext = null;
let masterGain = null;

/* Creates the audio context once, routes everything through a
   master gain + compressor (loud but no clipping), and makes sure
   the context is running. */
function getAudioContext() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;

        audioContext = new AudioCtx({ latencyHint: "interactive" });

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -6;
        compressor.knee.value = 10;
        compressor.ratio.value = 20;
        compressor.attack.value = 0.002;
        compressor.release.value = 0.12;

        masterGain = audioContext.createGain();
        masterGain.gain.value = 500.2; 

        masterGain.connect(compressor);
        compressor.connect(audioContext.destination);

        startKeepAlive(audioContext);
    }

    if (audioContext.state !== "running") {
        audioContext.resume();
    }

    return audioContext;
}

/* Browsers keep audio suspended until the first user gesture.
   Unlocking on the very first click/key/touch means the audio
   engine is already warm by the time the user spins, which
   removes the delay on the first spin sound. */
function unlockAudio() {
    const ctx = getAudioContext();

    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();

    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
}

["pointerdown", "keydown", "touchstart"].forEach(eventName => {
    document.addEventListener(eventName, unlockAudio, {
        once: true,
        passive: true
    });
});

/* Plays an inaudible tone forever so the browser/OS never decides
   the audio output is idle and puts it to sleep. Without this, the
   audio device can take a few seconds to wake up after ~1-2 minutes
   of silence, which delays the first spin sounds. */
function startKeepAlive(ctx) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 40;

    // About -80dB: inaudible, but not pure digital silence.
    gain.gain.value = 0.0001;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
}

/* If the browser suspends the context while the tab sits idle,
   bring it back as soon as the user touches the page again
   (before they even press spin). */
function wakeAudio() {
    if (audioContext && audioContext.state !== "running") {
        audioContext.resume();
    }
}

["pointerdown", "pointermove", "keydown", "touchstart", "focus"].forEach(eventName => {
    window.addEventListener(eventName, wakeAudio, { passive: true });
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wakeAudio();
});

/* Small helper: one sine note with a fast attack and exponential decay. */
function playNote({
    type = "sine",
    startFreq,
    endFreq = null,
    startTime,
    attack = 0.004,
    duration,
    volume
}) {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, startTime);

    if (endFreq) {
        oscillator.frequency.exponentialRampToValueAtTime(
            endFreq,
            startTime + duration * 0.55
        );
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
}

function playSpinTick(progress = 0) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Triangle wave + short click on top = louder, punchier tick.
    playNote({
        type: "triangle",
        startFreq: 260 + progress * 170,
        startTime: now,
        attack: 0.002,
        duration: 0.05,
        volume: 0.7
    });

    playNote({
        type: "square",
        startFreq: 900 + progress * 300,
        startTime: now,
        attack: 0.001,
        duration: 0.012,
        volume: 0.12
    });
}

function playFinalTick() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pop
    playNote({
        type: "sine",
        startFreq: 220,
        endFreq: 520,
        startTime: now,
        attack: 0.008,
        duration: 0.14,
        volume: 0.6
    });

    // Chime
    playNote({
        type: "sine",
        startFreq: 659.25,
        startTime: now + 0.055,
        attack: 0.01,
        duration: 0.4,
        volume: 0.35
    });

    // Sparkle
    playNote({
        type: "sine",
        startFreq: 987.77,
        startTime: now + 0.11,
        attack: 0.01,
        duration: 0.45,
        volume: 0.2
    });
}


/* ==========================================================
   DATA LOADING
   ========================================================== */

async function loadProjects() {
    try {
        const response = await fetch("data/projects.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        projects = await response.json();

        if (!Array.isArray(projects) || projects.length === 0) {
            throw new Error("Invalid project database.");
        }

        initializeApp();
    } catch (error) {
        console.error(error);

        statusText.innerHTML =
            "couldn't load the project database.<br><br>" +
            "make sure Spinspire is running with Live Server.";
    }
}

function initializeApp() {
    createDegreeButtons();
    loadSavedProjects();
    showDegreeScreen();

    statusScreen.classList.add("hidden");
}


/* ==========================================================
   DEGREE + DIFFICULTY SELECTION
   ========================================================== */

function getDegrees() {
    return [...new Set(projects.map(project => project.degree))].sort();
}

function createDegreeButtons() {
    degreeGrid.innerHTML = "";

    getDegrees().forEach(degree => {
        const button = document.createElement("button");

        button.className = "degree-option";
        button.type = "button";
        button.textContent = degree;

        button.addEventListener("click", () => selectDegree(degree));

        degreeGrid.appendChild(button);
    });
}

function selectDegree(degree) {
    selectedDegree = degree;

    degreeScreen.classList.add("hidden");
    difficultyScreen.classList.remove("hidden");
}

function selectAnyDegree() {
    selectedDegree = null;

    degreeScreen.classList.add("hidden");
    difficultyScreen.classList.remove("hidden");
}

function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;

    savePreferences();
    openRoulette();
}

function savePreferences() {
    const preferences = {
        degree: selectedDegree,
        difficulty: selectedDifficulty
    };

    localStorage.setItem("spinspirePreferences", JSON.stringify(preferences));
}


/* ==========================================================
   SCREEN HELPERS
   ========================================================== */

function setOverlay(element, active) {
    element.classList.toggle("active", active);
    element.setAttribute("aria-hidden", active ? "false" : "true");
}

function hideExplore() {
    setOverlay(exploreScreen, false);
}

function closeResult() {
    setOverlay(resultScreen, false);
}

function closeSavedProjects() {
    setOverlay(savedScreen, false);
}

function showDegreeScreen() {
    spinSession++;
    spinning = false;
    currentProject = null;

    projectWord.classList.remove("spinning");
    categoryWord.classList.remove("spinning");

    closeResult();
    hideExplore();
    closeSavedProjects();

    roulette.classList.add("hidden");
    difficultyScreen.classList.add("hidden");
    degreeScreen.classList.remove("hidden");

    degreeIndicator.classList.add("hidden");
    difficultyIndicator.classList.add("hidden");

    resetRouletteWords();
}

function showDifficultyScreen() {
    spinSession++;
    spinning = false;

    closeResult();
    hideExplore();
    closeSavedProjects();

    roulette.classList.add("hidden");
    degreeScreen.classList.add("hidden");
    difficultyScreen.classList.remove("hidden");

    degreeIndicator.classList.add("hidden");
    difficultyIndicator.classList.add("hidden");
}

function resetRouletteWords() {
    projectWordText.textContent = "Find Your Next Project";
    categoryWordText.textContent = "spin to discover";

    roulettePrompt.textContent = "ready?";
    categoryPrompt.textContent = "your idea is waiting";
}

function openRoulette() {
    closeResult();
    hideExplore();
    closeSavedProjects();

    degreeScreen.classList.add("hidden");
    difficultyScreen.classList.add("hidden");
    roulette.classList.remove("hidden");

    degreeIndicator.classList.remove("hidden");
    difficultyIndicator.classList.remove("hidden");

    currentDegreeLabel.textContent = selectedDegree || "anything";
    currentDifficultyLabel.textContent = selectedDifficulty || "any difficulty";

    currentProject = null;

    resetRouletteWords();
}


/* ==========================================================
   PROJECT SELECTION
   ========================================================== */

function getEligibleProjects() {
    return projects.filter(project => {
        const degreeMatch =
            !selectedDegree || project.degree === selectedDegree;

        const difficultyMatch =
            !selectedDifficulty || project.difficulty === selectedDifficulty;

        return degreeMatch && difficultyMatch;
    });
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomEligibleProject() {
    let eligible = getEligibleProjects();

    if (eligible.length === 0 && selectedDegree) {
        eligible = projects.filter(project => project.degree === selectedDegree);
    }

    if (eligible.length === 0) {
        eligible = projects;
    }

    if (eligible.length === 1) {
        return eligible[0];
    }

    const withoutPrevious = eligible.filter(
        project => project.id !== previousProjectId
    );

    return randomItem(withoutPrevious.length ? withoutPrevious : eligible);
}

function getProjectTechnologies(project) {
    return (project?.technologies || []).map(technology =>
        String(technology).trim().toLowerCase()
    );
}

function getSimilarProject(referenceProject) {
    if (!referenceProject) {
        return getRandomEligibleProject();
    }

    const eligible = getEligibleProjects().filter(
        project => project.id !== referenceProject.id
    );

    if (eligible.length === 0) {
        return getRandomEligibleProject();
    }

    const referenceTech = new Set(getProjectTechnologies(referenceProject));

    const scored = eligible.map(project => {
        const projectTech = getProjectTechnologies(project);
        const sharedTech = projectTech.filter(tech => referenceTech.has(tech)).length;

        let score = sharedTech * 3;

        if (project.category === referenceProject.category) score += 7;
        if (project.degree === referenceProject.degree) score += 2;
        if (project.difficulty === referenceProject.difficulty) score += 1;

        return { project, score };
    });

    const bestScore = Math.max(...scored.map(item => item.score));

    const strongestMatches = scored
        .filter(item => item.score === bestScore)
        .map(item => item.project);

    return randomItem(strongestMatches);
}

function getDifferentProject(referenceProject) {
    if (!referenceProject) {
        return getRandomEligibleProject();
    }

    const eligible = getEligibleProjects().filter(
        project => project.id !== referenceProject.id
    );

    if (eligible.length === 0) {
        return getRandomEligibleProject();
    }

    const referenceTech = new Set(getProjectTechnologies(referenceProject));

    const scored = eligible.map(project => {
        const projectTech = getProjectTechnologies(project);
        const sharedTech = projectTech.filter(tech => referenceTech.has(tech)).length;

        let differenceScore = 0;

        if (project.category !== referenceProject.category) {
            differenceScore += 8;
        }

        if (sharedTech === 0) {
            differenceScore += 6;
        } else {
            differenceScore -= sharedTech * 2;
        }

        if (project.degree !== referenceProject.degree && !selectedDegree) {
            differenceScore += 2;
        }

        return { project, differenceScore };
    });

    const bestScore = Math.max(...scored.map(item => item.differenceScore));

    const strongestDifferences = scored
        .filter(item => item.differenceScore === bestScore)
        .map(item => item.project);

    return randomItem(strongestDifferences);
}

function chooseProjectForSpin(mode, referenceProject) {
    if (mode === "similar") return getSimilarProject(referenceProject);
    if (mode === "different") return getDifferentProject(referenceProject);

    return getRandomEligibleProject();
}


/* ==========================================================
   SPIN ANIMATION
   ========================================================== */

function updateRouletteWords(project) {
    projectWordText.textContent = project.title;
    categoryWordText.textContent = project.category;
}

function updateCounter() {
    spinCountElement.textContent = String(spinCount).padStart(3, "0");
}

function animateRoulette(mode = "normal", referenceProject = currentProject) {
    if (spinning || roulette.classList.contains("hidden")) {
        return;
    }

    // Make sure audio is running *before* the first tick fires.
    getAudioContext();

    spinning = true;

    const thisSpin = ++spinSession;

    roulettePrompt.textContent = "how about";
    categoryPrompt.textContent = "in";

    projectWord.classList.add("spinning");
    categoryWord.classList.add("spinning");

    const totalChanges = 16;
    let currentChange = 0;

    function nextTick() {
        if (thisSpin !== spinSession) {
            return;
        }

        const isFinalChoice = currentChange === totalChanges - 1;

        const project = isFinalChoice
            ? chooseProjectForSpin(mode, referenceProject)
            : getRandomEligibleProject();

        currentProject = project;
        updateRouletteWords(project);

        const progress = currentChange / totalChanges;

        playSpinTick(progress);

        currentChange++;

        if (currentChange >= totalChanges) {
            previousProjectId = currentProject.id;

            projectWord.classList.remove("spinning");
            categoryWord.classList.remove("spinning");

            spinning = false;
            spinCount++;

            updateCounter();
            playFinalTick();

            const finishedProject = currentProject;

            setTimeout(() => {
                if (thisSpin === spinSession) {
                    showProject(finishedProject);
                }
            }, 320);

            return;
        }

        const delay = 55 + Math.pow(progress, 2.2) * 210;

        setTimeout(nextTick, delay);
    }

    nextTick();
}

function spinAnotherProject(mode = "normal") {
    const referenceProject = currentProject;

    closeResult();
    hideExplore();

    setTimeout(() => {
        animateRoulette(mode, referenceProject);
    }, SPIN_START_DELAY);
}


/* ==========================================================
   RESULT SCREEN
   ========================================================== */

function showProject(project) {
    if (!project) return;

    currentProject = project;

    projectTitle.textContent = project.title;
    projectDescription.textContent = project.description;

    resultDegree.textContent = project.degree;
    resultCategory.textContent = project.category;
    resultDifficulty.textContent = project.difficulty;

    technologyList.innerHTML = "";

    (project.technologies || []).forEach(technology => {
        const tag = document.createElement("span");

        tag.className = "technology";
        tag.textContent = technology;

        technologyList.appendChild(tag);
    });

    updateSaveButton();

    setOverlay(resultScreen, true);
}


/* ==========================================================
   SAVED PROJECTS
   ========================================================== */

function loadSavedProjects() {
    const stored = localStorage.getItem("spinspireSavedProjects");

    if (!stored) {
        savedProjects = [];
        updateSavedCount();
        return;
    }

    try {
        savedProjects = JSON.parse(stored);

        if (!Array.isArray(savedProjects)) {
            savedProjects = [];
        }
    } catch {
        savedProjects = [];
    }

    updateSavedCount();
}

function persistSavedProjects() {
    localStorage.setItem(
        "spinspireSavedProjects",
        JSON.stringify(savedProjects)
    );

    updateSavedCount();
}

function isProjectSaved(projectId) {
    return savedProjects.some(project => project.id === projectId);
}

function toggleCurrentProjectSave() {
    if (!currentProject) return;

    if (isProjectSaved(currentProject.id)) {
        savedProjects = savedProjects.filter(
            project => project.id !== currentProject.id
        );
    } else {
        savedProjects.unshift(currentProject);
    }

    persistSavedProjects();
    updateSaveButton();
    updateExploreSaveButton();
}

function updateSaveButton() {
    if (!currentProject) return;

    const saved = isProjectSaved(currentProject.id);

    saveProjectButton.classList.toggle("saved", saved);

    saveIcon.textContent = saved ? "♥" : "♡";
    saveText.textContent = saved ? "saved" : "save project";
}

function updateExploreSaveButton() {
    if (!currentProject) return;

    const saved = isProjectSaved(currentProject.id);

    exploreSaveButton.classList.toggle("saved", saved);

    exploreSaveButton.textContent = saved ? "♥ saved" : "♡ save project";
}

function updateSavedCount() {
    savedCount.textContent = String(savedProjects.length).padStart(2, "0");
}

function openSavedProjects() {
    closeResult();
    hideExplore();

    renderSavedProjects();

    setOverlay(savedScreen, true);
}

function openSavedProject(project) {
    if (!project) return;

    currentProject = project;
    previousProjectId = project.id;

    closeSavedProjects();
    showProject(project);
}

function renderSavedProjects() {
    savedList.innerHTML = "";

    if (savedProjects.length === 0) {
        const empty = document.createElement("p");

        empty.className = "saved-empty";
        empty.textContent = "nothing saved yet — go spin something worth building.";

        savedList.appendChild(empty);
        return;
    }

    savedProjects.forEach(project => {
        const card = document.createElement("article");

        card.className = "saved-project saved-project-clickable";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Open ${project.title}`);

        const degree = document.createElement("p");
        degree.className = "saved-project-degree";
        degree.textContent =
            `${project.degree} / ${project.category} / ${project.difficulty}`;

        const title = document.createElement("h3");
        title.textContent = project.title;

        const description = document.createElement("p");
        description.textContent = project.description;

        const openHint = document.createElement("span");
        openHint.className = "saved-project-open";
        openHint.textContent = "open project ↗";

        const remove = document.createElement("button");
        remove.className = "remove-saved";
        remove.type = "button";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${project.title}`);

        const openCard = () => openSavedProject(project);

        card.addEventListener("click", openCard);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCard();
            }
        });

        remove.addEventListener("click", event => {
            event.stopPropagation();

            savedProjects = savedProjects.filter(saved => saved.id !== project.id);

            persistSavedProjects();
            renderSavedProjects();
            updateSaveButton();
            updateExploreSaveButton();
        });

        remove.addEventListener("keydown", event => {
            event.stopPropagation();
        });

        card.append(degree, title, description, openHint, remove);
        savedList.appendChild(card);
    });
}


/* ==========================================================
   EXPLORE SCREEN
   ========================================================== */

function createProjectBrief(project) {
    const technologies = project.technologies || [];

    const fallbackFeatures = [
        `Build the main ${project.category.toLowerCase()} functionality.`,
        "Create a clean interface for interacting with the project.",
        "Use suitable real or sample data to test the idea.",
        "Show useful results, feedback or visual output to the user.",
        "Polish the final version so it is easy to demonstrate."
    ];

    const fallbackRoadmap = [
        "research",
        "plan",
        "prototype",
        "build",
        "test",
        "polish"
    ];

    const fallbackSkills = [
        project.category,
        ...technologies,
        "Problem Solving",
        "Project Design"
    ];

    return {
        idea: project.description,
        features: project.features?.length ? project.features : fallbackFeatures,
        roadmap: project.roadmap?.length ? project.roadmap : fallbackRoadmap,
        skills: project.skills?.length
            ? [...new Set(project.skills)]
            : [...new Set(fallbackSkills)]
    };
}

function fillTags(container, items, className) {
    container.innerHTML = "";

    items.forEach(item => {
        const tag = document.createElement("span");

        tag.className = className;
        tag.textContent = item;

        container.appendChild(tag);
    });
}

function openExploreProject() {
    if (!currentProject) return;

    const project = currentProject;
    const brief = createProjectBrief(project);

    exploreTitle.textContent = project.title;
    exploreDescription.textContent = project.description;

    exploreDegree.textContent = project.degree;
    exploreCategory.textContent = project.category;
    exploreDifficulty.textContent = project.difficulty;

    exploreIdea.textContent = brief.idea;
    exploreLevel.textContent = project.difficulty;

    exploreFeatures.innerHTML = "";

    brief.features.forEach(feature => {
        const item = document.createElement("li");

        item.textContent = feature;

        exploreFeatures.appendChild(item);
    });

    fillTags(exploreTechnologies, project.technologies || [], "explore-tech");

    exploreRoadmap.innerHTML = "";

    brief.roadmap.forEach((step, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "roadmap-step";

        const name = document.createElement("span");
        name.className = "roadmap-name";
        name.textContent = step;

        wrapper.appendChild(name);

        if (index < brief.roadmap.length - 1) {
            const arrow = document.createElement("span");

            arrow.className = "roadmap-arrow";
            arrow.textContent = "→";

            wrapper.appendChild(arrow);
        }

        exploreRoadmap.appendChild(wrapper);
    });

    fillTags(exploreSkills, brief.skills, "explore-skill");

    updateExploreSaveButton();

    setOverlay(resultScreen, false);
    setOverlay(exploreScreen, true);

    exploreScreen.scrollTop = 0;
}

function closeExploreToResult() {
    hideExplore();

    if (currentProject) {
        setOverlay(resultScreen, true);
    }
}


/* ==========================================================
   SMART SPIN CONTROLS (similar / different)
   ========================================================== */

function createSmartSpinControls() {
    if (!anotherButton || document.getElementById("similarButton")) {
        return;
    }

    const parent = anotherButton.parentElement;

    if (!parent) return;

    const similarButton = document.createElement("button");
    similarButton.id = "similarButton";
    similarButton.type = "button";
    similarButton.className = anotherButton.className;
    similarButton.textContent = "something similar ↗";

    const differentButton = document.createElement("button");
    differentButton.id = "differentButton";
    differentButton.type = "button";
    differentButton.className = anotherButton.className;
    differentButton.textContent = "something different ↗";

    similarButton.addEventListener("click", () => spinAnotherProject("similar"));
    differentButton.addEventListener("click", () => spinAnotherProject("different"));

    parent.append(similarButton, differentButton);

    const style = document.createElement("style");

    style.textContent = `
        #similarButton,
        #differentButton {
            margin-left: 10px;
        }

        @media (max-width: 760px) {
            #similarButton,
            #differentButton {
                margin-left: 0;
                margin-top: 10px;
            }
        }
    `;

    document.head.appendChild(style);
}

function addSavedProjectsUpgradeStyles() {
    if (document.getElementById("savedProjectsUpgradeStyles")) return;

    const style = document.createElement("style");

    style.id = "savedProjectsUpgradeStyles";

    style.textContent = `
        .saved-project-clickable {
            cursor: pointer;
            transition: transform 180ms ease, background 180ms ease, padding-left 180ms ease;
        }

        .saved-project-clickable:hover {
            transform: translateY(-2px);
        }

        .saved-project-clickable:focus-visible {
            outline: 1px solid currentColor;
            outline-offset: -1px;
        }

        .saved-project-open {
            display: inline-block;
            margin-top: 18px;
            color: var(--muted);
            font-size: 9px;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 180ms ease, transform 180ms ease, color 180ms ease;
        }

        .saved-project-clickable:hover .saved-project-open,
        .saved-project-clickable:focus-visible .saved-project-open {
            opacity: 1;
            transform: translateY(0);
            color: var(--text);
        }

        .saved-project-clickable:hover h3 {
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 5px;
        }

        .remove-saved {
            z-index: 2;
        }

        @media (max-width: 700px) {
            .saved-project-open {
                opacity: 1;
                transform: none;
            }
        }
    `;

    document.head.appendChild(style);
}


/* ==========================================================
   EVENT LISTENERS
   ========================================================== */

anythingButton.addEventListener("click", selectAnyDegree);

document.querySelectorAll(".difficulty-option").forEach(button => {
    button.addEventListener("click", () => {
        selectDifficulty(button.dataset.difficulty);
    });
});

anyDifficultyButton.addEventListener("click", () => selectDifficulty(null));

difficultyBackButton.addEventListener("click", showDegreeScreen);
degreeIndicator.addEventListener("click", showDegreeScreen);
difficultyIndicator.addEventListener("click", showDifficultyScreen);
brand.addEventListener("click", showDegreeScreen);

// Wrapped in arrow functions so the click event isn't passed in as `mode`.
spinButton.addEventListener("click", () => animateRoulette("normal"));
spaceButton.addEventListener("click", () => animateRoulette("normal"));

backButton.addEventListener("click", closeResult);

anotherButton.addEventListener("click", () => spinAnotherProject("normal"));

saveProjectButton.addEventListener("click", toggleCurrentProjectSave);

exploreButton.addEventListener("click", openExploreProject);
exploreBackButton.addEventListener("click", closeExploreToResult);
exploreSaveButton.addEventListener("click", toggleCurrentProjectSave);
exploreAnotherButton.addEventListener("click", () => spinAnotherProject("normal"));

savedHeaderButton.addEventListener("click", openSavedProjects);
closeSavedButton.addEventListener("click", closeSavedProjects);


/* ---------- Keyboard: Space = spin ---------- */

document.addEventListener("keydown", event => {
    if (event.code !== "Space") return;

    const activeTag = document.activeElement.tagName;

    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(activeTag)) return;

    if (savedScreen.classList.contains("active")) return;
    if (exploreScreen.classList.contains("active")) return;

    if (
        !degreeScreen.classList.contains("hidden") ||
        !difficultyScreen.classList.contains("hidden")
    ) {
        return;
    }

    event.preventDefault();

    if (resultScreen.classList.contains("active")) {
        spinAnotherProject("normal");
        return;
    }

    animateRoulette("normal");
});


/* ---------- Keyboard: Escape = go back ---------- */

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (exploreScreen.classList.contains("active")) {
        closeExploreToResult();
        return;
    }

    if (savedScreen.classList.contains("active")) {
        closeSavedProjects();
        return;
    }

    if (resultScreen.classList.contains("active")) {
        closeResult();
    }
});


/* ==========================================================
   START
   ========================================================== */

addSavedProjectsUpgradeStyles();
updateCounter();
createSmartSpinControls();
loadProjects();
