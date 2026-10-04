/* =========================================
   STATE
========================================= */

let projects = [];

let selectedDegree = null;
let selectedDifficulty = null;

let currentProject = null;
let previousProjectId = null;

let spinCount = 0;
let spinning = false;

let savedProjects = [];


/* =========================================
   ELEMENTS
========================================= */
const roulettePrompt =
    document.getElementById("roulettePrompt");

const categoryPrompt =
    document.getElementById("categoryPrompt");
const degreeScreen =
    document.getElementById("degreeScreen");

const difficultyScreen =
    document.getElementById("difficultyScreen");

const roulette =
    document.getElementById("roulette");

const degreeGrid =
    document.getElementById("degreeGrid");

const anythingButton =
    document.getElementById("anythingButton");

const anyDifficultyButton =
    document.getElementById("anyDifficultyButton");

const difficultyBackButton =
    document.getElementById("difficultyBackButton");

const degreeIndicator =
    document.getElementById("degreeIndicator");

const difficultyIndicator =
    document.getElementById("difficultyIndicator");

const currentDegreeLabel =
    document.getElementById("currentDegreeLabel");

const currentDifficultyLabel =
    document.getElementById("currentDifficultyLabel");

const projectWord =
    document.getElementById("projectWord");

const projectWordText =
    document.getElementById("projectWordText");

const categoryWord =
    document.getElementById("categoryWord");

const categoryWordText =
    document.getElementById("categoryWordText");

const spinButton =
    document.getElementById("spinButton");

const spaceButton =
    document.getElementById("spaceButton");

const spinCountElement =
    document.getElementById("spinCount");

const resultScreen =
    document.getElementById("resultScreen");

const projectTitle =
    document.getElementById("projectTitle");

const projectDescription =
    document.getElementById("projectDescription");

const resultDegree =
    document.getElementById("resultDegree");

const resultCategory =
    document.getElementById("resultCategory");

const resultDifficulty =
    document.getElementById("resultDifficulty");

const technologyList =
    document.getElementById("technologyList");

const anotherButton =
    document.getElementById("anotherButton");

const backButton =
    document.getElementById("backButton");

const saveProjectButton =
    document.getElementById("saveProjectButton");

const saveIcon =
    document.getElementById("saveIcon");

const saveText =
    document.getElementById("saveText");

const savedHeaderButton =
    document.getElementById("savedHeaderButton");

const savedCount =
    document.getElementById("savedCount");

const savedScreen =
    document.getElementById("savedScreen");

const savedList =
    document.getElementById("savedList");

const closeSavedButton =
    document.getElementById("closeSavedButton");

const statusScreen =
    document.getElementById("statusScreen");

const statusText =
    document.getElementById("statusText");


/* =========================================
   DATABASE
========================================= */

async function loadProjects() {

    try {

        const response =
            await fetch("data/projects.json");


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        projects =
            await response.json();


        if (
            !Array.isArray(projects) ||
            projects.length === 0
        ) {
            throw new Error(
                "Invalid project database."
            );
        }


        initializeApp();

    }

    catch (error) {

        console.error(error);

        statusText.innerHTML =
            "couldn't load the project database.<br><br>" +
            "make sure Spinspire is running with Live Server.";

    }

}


/* =========================================
   INITIALIZE
========================================= */
function initializeApp() {

    createDegreeButtons();

    loadSavedProjects();

    showDegreeScreen();

    statusScreen.classList.add(
        "hidden"
    );

}

/* =========================================
   DEGREE LIST
========================================= */

function getDegrees() {

    return [
        ...new Set(
            projects.map(
                project => project.degree
            )
        )
    ].sort();

}


/* =========================================
   CREATE DEGREE BUTTONS
========================================= */

function createDegreeButtons() {

    degreeGrid.innerHTML = "";


    getDegrees().forEach(degree => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "degree-option";

        button.type =
            "button";

        button.textContent =
            degree;


        button.addEventListener(
            "click",
            () => selectDegree(degree)
        );


        degreeGrid.appendChild(
            button
        );

    });

}


/* =========================================
   DEGREE SELECTION
========================================= */

function selectDegree(degree) {

    selectedDegree =
        degree;


    degreeScreen.classList.add(
        "hidden"
    );


    difficultyScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   ANY DEGREE
========================================= */

function selectAnyDegree() {

    selectedDegree =
        null;


    degreeScreen.classList.add(
        "hidden"
    );


    difficultyScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   DIFFICULTY
========================================= */

function selectDifficulty(
    difficulty
) {

    selectedDifficulty =
        difficulty;


    savePreferences();

    openRoulette();

}


/* =========================================
   SAVE PREFERENCES
========================================= */

function savePreferences() {

    const preferences = {

        degree:
            selectedDegree,

        difficulty:
            selectedDifficulty

    };


    localStorage.setItem(
        "spinspirePreferences",
        JSON.stringify(preferences)
    );

}


/* =========================================
   RESTORE PREFERENCES
========================================= */

function restorePreferences() {

    const stored =
        localStorage.getItem(
            "spinspirePreferences"
        );


    if (!stored) {

        showDegreeScreen();

        return;

    }


    try {

        const preferences =
            JSON.parse(stored);


        selectedDegree =
            preferences.degree ?? null;


        selectedDifficulty =
            preferences.difficulty ?? null;


        /*
            If the saved degree no longer
            exists, restart onboarding.
        */

        if (
            selectedDegree &&
            !getDegrees().includes(
                selectedDegree
            )
        ) {

            localStorage.removeItem(
                "spinspirePreferences"
            );

            showDegreeScreen();

            return;

        }


        openRoulette();

    }

    catch {

        localStorage.removeItem(
            "spinspirePreferences"
        );

        showDegreeScreen();

    }

}


/* =========================================
   SCREENS
========================================= */

function showDegreeScreen() {

    closeResult();

    savedScreen.classList.remove(
        "active"
    );


    roulette.classList.add(
        "hidden"
    );

    difficultyScreen.classList.add(
        "hidden"
    );

    degreeScreen.classList.remove(
        "hidden"
    );


    degreeIndicator.classList.add(
        "hidden"
    );

    difficultyIndicator.classList.add(
        "hidden"
    );

}


function showDifficultyScreen() {

    closeResult();


    roulette.classList.add(
        "hidden"
    );

    degreeScreen.classList.add(
        "hidden"
    );

    difficultyScreen.classList.remove(
        "hidden"
    );


    degreeIndicator.classList.add(
        "hidden"
    );

    difficultyIndicator.classList.add(
        "hidden"
    );

}


/* =========================================
   OPEN ROULETTE
========================================= */

function openRoulette() {

    degreeScreen.classList.add(
        "hidden"
    );

    difficultyScreen.classList.add(
        "hidden"
    );

    roulette.classList.remove(
        "hidden"
    );


    degreeIndicator.classList.remove(
        "hidden"
    );

    difficultyIndicator.classList.remove(
        "hidden"
    );


    currentDegreeLabel.textContent =
        selectedDegree ||
        "anything";


    currentDifficultyLabel.textContent =
        selectedDifficulty ||
        "any difficulty";


    /*
        IMPORTANT:
        Do NOT choose a project yet.

        The user should spin first.
    */

    currentProject = null;

    projectWordText.textContent =
        "Find Your Next Project";

    categoryWordText.textContent =
        "spin to discover";
    roulettePrompt.textContent =
    "ready?";

    categoryPrompt.textContent =
    "your idea is waiting";

}


/* =========================================
   FILTER PROJECTS
========================================= */

function getEligibleProjects() {

    return projects.filter(
        project => {

            const degreeMatch =
                !selectedDegree ||
                project.degree ===
                    selectedDegree;


            const difficultyMatch =
                !selectedDifficulty ||
                project.difficulty ===
                    selectedDifficulty;


            return (
                degreeMatch &&
                difficultyMatch
            );

        }
    );

}


/* =========================================
   RANDOM PROJECT
========================================= */

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function getRandomEligibleProject() {

    let eligible =
        getEligibleProjects();


    /*
        Fallback in case a future degree
        doesn't contain the requested
        difficulty.
    */

    if (
        eligible.length === 0 &&
        selectedDegree
    ) {

        eligible =
            projects.filter(
                project =>
                    project.degree ===
                    selectedDegree
            );

    }


    if (eligible.length === 0) {

        eligible =
            projects;

    }


    if (eligible.length === 1) {

        return eligible[0];

    }


    const withoutPrevious =
        eligible.filter(
            project =>
                project.id !==
                previousProjectId
        );


    return randomItem(
        withoutPrevious.length
            ? withoutPrevious
            : eligible
    );

}


/* =========================================
   ROULETTE DISPLAY
========================================= */

function updateRouletteWords(
    project
) {

    projectWordText.textContent =
        project.title;


    categoryWordText.textContent =
        project.category;

}


/* =========================================
   COUNTER
========================================= */

function updateCounter() {

    spinCountElement.textContent =
        String(spinCount)
            .padStart(
                3,
                "0"
            );

}


/* =========================================
   AUDIO CONTEXT
========================================= */

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;

}


/* =========================================
   BUBBLE TICK
========================================= */

function playSpinTick(
    progress = 0
) {

    const ctx =
        getAudioContext();


    const now =
        ctx.currentTime;


    const oscillator =
        ctx.createOscillator();


    const gain =
        ctx.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency
        .setValueAtTime(
            260 +
            progress * 170,
            now
        );


    gain.gain
        .setValueAtTime(
            0.085,
            now
        );


    gain.gain
        .exponentialRampToValueAtTime(
            0.001,
            now + 0.035
        );


    oscillator.connect(
        gain
    );


    gain.connect(
        ctx.destination
    );


    oscillator.start(
        now
    );


    oscillator.stop(
        now + 0.04
    );

}


/* =========================================
   RESULT SOUND
========================================= */

function playFinalTick() {

    const ctx =
        getAudioContext();


    const now =
        ctx.currentTime;


    /* Bubble pop */

    const pop =
        ctx.createOscillator();


    const popGain =
        ctx.createGain();


    pop.type =
        "sine";


    pop.frequency
        .setValueAtTime(
            220,
            now
        );


    pop.frequency
        .exponentialRampToValueAtTime(
            520,
            now + 0.07
        );


    popGain.gain
        .setValueAtTime(
            0.0001,
            now
        );


    popGain.gain
        .exponentialRampToValueAtTime(
            0.20,
            now + 0.008
        );


    popGain.gain
        .exponentialRampToValueAtTime(
            0.001,
            now + 0.13
        );


    pop.connect(
        popGain
    );


    popGain.connect(
        ctx.destination
    );


    pop.start(
        now
    );


    pop.stop(
        now + 0.14
    );


    /* Warm chime */

    const chime =
        ctx.createOscillator();


    const chimeGain =
        ctx.createGain();


    chime.type =
        "sine";


    chime.frequency
        .setValueAtTime(
            659.25,
            now + 0.055
        );


    chimeGain.gain
        .setValueAtTime(
            0.0001,
            now
        );


    chimeGain.gain
        .exponentialRampToValueAtTime(
            0.055,
            now + 0.065
        );


    chimeGain.gain
        .exponentialRampToValueAtTime(
            0.001,
            now + 0.38
        );


    chime.connect(
        chimeGain
    );


    chimeGain.connect(
        ctx.destination
    );


    chime.start(
        now + 0.055
    );


    chime.stop(
        now + 0.4
    );


    /* Sparkle */

    const sparkle =
        ctx.createOscillator();


    const sparkleGain =
        ctx.createGain();


    sparkle.type =
        "sine";


    sparkle.frequency
        .setValueAtTime(
            987.77,
            now + 0.11
        );


    sparkleGain.gain
        .setValueAtTime(
            0.0001,
            now
        );


    sparkleGain.gain
        .exponentialRampToValueAtTime(
            0.025,
            now + 0.12
        );


    sparkleGain.gain
        .exponentialRampToValueAtTime(
            0.001,
            now + 0.45
        );


    sparkle.connect(
        sparkleGain
    );


    sparkleGain.connect(
        ctx.destination
    );


    sparkle.start(
        now + 0.11
    );


    sparkle.stop(
        now + 0.46
    );

}


/* =========================================
   SPIN
========================================= */

function animateRoulette() {

    if (
        spinning ||
        roulette.classList.contains(
            "hidden"
        )
    ) {
        return;
    }


    spinning = true;
    roulettePrompt.textContent =
    "how about";

    categoryPrompt.textContent =
    "in";


    projectWord.classList.add(
        "spinning"
    );


    categoryWord.classList.add(
        "spinning"
    );


    const totalChanges =
        16;


    let currentChange =
        0;


    function nextTick() {

        const project =
            getRandomEligibleProject();


        currentProject =
            project;


        updateRouletteWords(
            project
        );


        const progress =
            currentChange /
            totalChanges;


        playSpinTick(
            progress
        );


        currentChange++;


        if (
            currentChange >=
            totalChanges
        ) {

            previousProjectId =
                currentProject.id;


            projectWord.classList.remove(
                "spinning"
            );


            categoryWord.classList.remove(
                "spinning"
            );


            spinning =
                false;


            spinCount++;


            updateCounter();


            playFinalTick();


            setTimeout(
                () =>
                    showProject(
                        currentProject
                    ),
                320
            );


            return;

        }


        const delay =
            55 +
            Math.pow(
                progress,
                2.2
            ) * 210;


        setTimeout(
            nextTick,
            delay
        );

    }


    nextTick();

}


/* =========================================
   RESULT
========================================= */

function showProject(
    project
) {

    currentProject =
        project;


    projectTitle.textContent =
        project.title;


    projectDescription.textContent =
        project.description;


    resultDegree.textContent =
        project.degree;


    resultCategory.textContent =
        project.category;


    resultDifficulty.textContent =
        project.difficulty;


    technologyList.innerHTML =
        "";


    project.technologies.forEach(
        technology => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "technology";


            tag.textContent =
                technology;


            technologyList.appendChild(
                tag
            );

        }
    );


    updateSaveButton();


    resultScreen.classList.add(
        "active"
    );


    resultScreen.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeResult() {

    resultScreen.classList.remove(
        "active"
    );


    resultScreen.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================
   SAVED PROJECTS
========================================= */

function loadSavedProjects() {

    const stored =
        localStorage.getItem(
            "spinspireSavedProjects"
        );


    if (!stored) {

        savedProjects = [];

        updateSavedCount();

        return;

    }


    try {

        savedProjects =
            JSON.parse(stored);


        if (
            !Array.isArray(
                savedProjects
            )
        ) {
            savedProjects = [];
        }

    }

    catch {

        savedProjects = [];

    }


    updateSavedCount();

}


function persistSavedProjects() {

    localStorage.setItem(
        "spinspireSavedProjects",
        JSON.stringify(
            savedProjects
        )
    );


    updateSavedCount();

}


function isProjectSaved(
    projectId
) {

    return savedProjects.some(
        project =>
            project.id ===
            projectId
    );

}


function toggleCurrentProjectSave() {

    if (!currentProject) {
        return;
    }


    if (
        isProjectSaved(
            currentProject.id
        )
    ) {

        savedProjects =
            savedProjects.filter(
                project =>
                    project.id !==
                    currentProject.id
            );

    }

    else {

        savedProjects.unshift(
            currentProject
        );

    }


    persistSavedProjects();

    updateSaveButton();

}


function updateSaveButton() {

    if (!currentProject) {
        return;
    }


    const saved =
        isProjectSaved(
            currentProject.id
        );


    saveProjectButton.classList.toggle(
        "saved",
        saved
    );


    saveIcon.textContent =
        saved
            ? "♥"
            : "♡";


    saveText.textContent =
        saved
            ? "saved"
            : "save project";

}


function updateSavedCount() {

    savedCount.textContent =
        String(
            savedProjects.length
        ).padStart(
            2,
            "0"
        );

}


/* =========================================
   SAVED SCREEN
========================================= */

function openSavedProjects() {

    closeResult();

    renderSavedProjects();


    savedScreen.classList.add(
        "active"
    );


    savedScreen.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeSavedProjects() {

    savedScreen.classList.remove(
        "active"
    );


    savedScreen.setAttribute(
        "aria-hidden",
        "true"
    );

}


function renderSavedProjects() {

    savedList.innerHTML =
        "";


    if (
        savedProjects.length ===
        0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "saved-empty";


        empty.textContent =
            "nothing saved yet — go spin something worth building.";


        savedList.appendChild(
            empty
        );


        return;

    }


    savedProjects.forEach(
        project => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "saved-project";


            const degree =
                document.createElement(
                    "p"
                );


            degree.className =
                "saved-project-degree";


            degree.textContent =
                `${project.degree} / ${project.category} / ${project.difficulty}`;


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                project.title;


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                project.description;


            const remove =
                document.createElement(
                    "button"
                );


            remove.className =
                "remove-saved";


            remove.type =
                "button";


            remove.textContent =
                "×";


            remove.setAttribute(
                "aria-label",
                `Remove ${project.title}`
            );


            remove.addEventListener(
                "click",
                () => {

                    savedProjects =
                        savedProjects.filter(
                            saved =>
                                saved.id !==
                                project.id
                        );


                    persistSavedProjects();

                    renderSavedProjects();

                    updateSaveButton();

                }
            );


            card.append(
                degree,
                title,
                description,
                remove
            );


            savedList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   EVENTS
========================================= */

anythingButton.addEventListener(
    "click",
    selectAnyDegree
);


document
    .querySelectorAll(
        ".difficulty-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectDifficulty(
                    button.dataset
                        .difficulty
                );

            }
        );

    });


anyDifficultyButton.addEventListener(
    "click",
    () =>
        selectDifficulty(
            null
        )
);


difficultyBackButton.addEventListener(
    "click",
    showDegreeScreen
);


degreeIndicator.addEventListener(
    "click",
    showDegreeScreen
);


difficultyIndicator.addEventListener(
    "click",
    showDifficultyScreen
);


spinButton.addEventListener(
    "click",
    animateRoulette
);


spaceButton.addEventListener(
    "click",
    animateRoulette
);


backButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        closeResult();

    }
);


anotherButton.addEventListener(
    "click",
    () => {

        closeResult();


        setTimeout(
            animateRoulette,
            500
        );

    }
);


saveProjectButton.addEventListener(
    "click",
    toggleCurrentProjectSave
);


savedHeaderButton.addEventListener(
    "click",
    openSavedProjects
);


closeSavedButton.addEventListener(
    "click",
    closeSavedProjects
);


/* =========================================
   SPACEBAR
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code !==
            "Space"
        ) {
            return;
        }


        if (
            ["INPUT", "TEXTAREA", "SELECT"]
                .includes(
                    document.activeElement
                        .tagName
                )
        ) {
            return;
        }


        if (
            savedScreen.classList.contains(
                "active"
            )
        ) {
            return;
        }


        if (
            !degreeScreen.classList.contains(
                "hidden"
            ) ||
            !difficultyScreen.classList.contains(
                "hidden"
            )
        ) {
            return;
        }


        event.preventDefault();


        if (
            resultScreen.classList.contains(
                "active"
            )
        ) {

            closeResult();


            setTimeout(
                animateRoulette,
                500
            );


            return;

        }


        animateRoulette();

    }
);


/* =========================================
   START
========================================= */

updateCounter();

loadProjects();