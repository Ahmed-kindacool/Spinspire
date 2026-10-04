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

let spinSession = 0;


/* =========================================
   ELEMENTS
========================================= */

const brand =
    document.getElementById("brand");

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

const roulettePrompt =
    document.getElementById("roulettePrompt");

const categoryPrompt =
    document.getElementById("categoryPrompt");

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

const exploreButton =
    document.getElementById("exploreButton");

const exploreScreen =
    document.getElementById("exploreScreen");

const exploreBackButton =
    document.getElementById("exploreBackButton");

const exploreTitle =
    document.getElementById("exploreTitle");

const exploreDescription =
    document.getElementById("exploreDescription");

const exploreDegree =
    document.getElementById("exploreDegree");

const exploreCategory =
    document.getElementById("exploreCategory");

const exploreDifficulty =
    document.getElementById("exploreDifficulty");

const exploreIdea =
    document.getElementById("exploreIdea");

const exploreFeatures =
    document.getElementById("exploreFeatures");

const exploreTechnologies =
    document.getElementById("exploreTechnologies");

const exploreRoadmap =
    document.getElementById("exploreRoadmap");

const exploreSkills =
    document.getElementById("exploreSkills");

const exploreLevel =
    document.getElementById("exploreLevel");

const exploreSaveButton =
    document.getElementById("exploreSaveButton");

const exploreAnotherButton =
    document.getElementById("exploreAnotherButton");

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

    /*
        During development we always start
        from the home screen.
    */

    showDegreeScreen();

    statusScreen.classList.add(
        "hidden"
    );

}


/* =========================================
   DEGREES
========================================= */

function getDegrees() {

    return [
        ...new Set(
            projects.map(
                project =>
                    project.degree
            )
        )
    ].sort();

}


function createDegreeButtons() {

    degreeGrid.innerHTML = "";


    getDegrees().forEach(
        degree => {

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
                () =>
                    selectDegree(
                        degree
                    )
            );


            degreeGrid.appendChild(
                button
            );

        }
    );

}


/* =========================================
   DEGREE
========================================= */

function selectDegree(
    degree
) {

    selectedDegree =
        degree;


    degreeScreen.classList.add(
        "hidden"
    );


    difficultyScreen.classList.remove(
        "hidden"
    );

}


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
   PREFERENCES
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
        JSON.stringify(
            preferences
        )
    );

}


/* =========================================
   SCREEN HELPERS
========================================= */

function hideExplore() {

    exploreScreen.classList.remove(
        "active"
    );


    exploreScreen.setAttribute(
        "aria-hidden",
        "true"
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


function closeSavedProjects() {

    savedScreen.classList.remove(
        "active"
    );


    savedScreen.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================
   HOME
========================================= */

function showDegreeScreen() {

    /*
        Incrementing this invalidates any
        roulette animation currently running.
    */

    spinSession++;

    spinning = false;

    currentProject = null;


    projectWord.classList.remove(
        "spinning"
    );


    categoryWord.classList.remove(
        "spinning"
    );


    closeResult();

    hideExplore();

    closeSavedProjects();


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


    resetRouletteWords();

}


/* =========================================
   DIFFICULTY SCREEN
========================================= */

function showDifficultyScreen() {

    spinSession++;

    spinning = false;


    closeResult();

    hideExplore();

    closeSavedProjects();


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
   ROULETTE INITIAL STATE
========================================= */

function resetRouletteWords() {

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
   OPEN ROULETTE
========================================= */

function openRoulette() {

    closeResult();

    hideExplore();

    closeSavedProjects();


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
        No project is selected here.

        The user MUST spin first.
    */

    currentProject =
        null;


    resetRouletteWords();

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

function randomItem(
    array
) {

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
        Fallback if a degree somehow doesn't
        contain the selected difficulty.
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


    if (
        eligible.length === 0
    ) {

        eligible =
            projects;

    }


    if (
        eligible.length === 1
    ) {

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
   ROULETTE WORDS
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
        String(
            spinCount
        ).padStart(
            3,
            "0"
        );

}


/* =========================================
   AUDIO
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
   SPIN BUBBLE SOUND
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


    /*
        Louder than our original version.
    */

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


    /*
        POP
    */

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
            0.18,
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


    /*
        CHIME
    */

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
            0.085,
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


    /*
        SPARKLE
    */

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
            0.04,
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


    spinning =
        true;


    const thisSpin =
        ++spinSession;


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

        /*
            If the user went home during a
            spin, cancel the old animation.
        */

        if (
            thisSpin !==
            spinSession
        ) {

            return;

        }


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


            const finishedProject =
                currentProject;


            setTimeout(
                () => {

                    if (
                        thisSpin ===
                        spinSession
                    ) {

                        showProject(
                            finishedProject
                        );

                    }

                },
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

    if (!project) {
        return;
    }


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


    (
        project.technologies ||
        []
    ).forEach(
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


/* =========================================
   SAVED PROJECTS
========================================= */

function loadSavedProjects() {

    const stored =
        localStorage.getItem(
            "spinspireSavedProjects"
        );


    if (!stored) {

        savedProjects =
            [];


        updateSavedCount();

        return;

    }


    try {

        savedProjects =
            JSON.parse(
                stored
            );


        if (
            !Array.isArray(
                savedProjects
            )
        ) {

            savedProjects =
                [];

        }

    }

    catch {

        savedProjects =
            [];

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

    updateExploreSaveButton();

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


function updateExploreSaveButton() {

    if (!currentProject) {
        return;
    }


    const saved =
        isProjectSaved(
            currentProject.id
        );


    exploreSaveButton.classList.toggle(
        "saved",
        saved
    );


    exploreSaveButton.textContent =
        saved
            ? "♥ saved"
            : "♡ save project";

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

    hideExplore();


    renderSavedProjects();


    savedScreen.classList.add(
        "active"
    );


    savedScreen.setAttribute(
        "aria-hidden",
        "false"
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

                    updateExploreSaveButton();

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
   PROJECT BRIEF
========================================= */

function createProjectBrief(
    project
) {

    const technologies =
        project.technologies ||
        [];


    /*
        For now these are created locally.

        Later we can give every project
        completely custom feature lists
        inside projects.json.
    */

    const features = [

        `Build the main ${project.category.toLowerCase()} functionality.`,

        `Create a clean interface for interacting with the project.`,

        `Use suitable real or sample data to test the idea.`,

        `Show useful results, feedback or visual output to the user.`,

        `Polish the final version so it is easy to demonstrate.`

    ];


    const roadmap = [
        "research",
        "plan",
        "prototype",
        "build",
        "test",
        "polish"
    ];


    const skills = [

        project.category,

        ...technologies,

        "Problem Solving",

        "Project Design"

    ];


    return {

        idea:
            project.description,

        features:
            features,

        roadmap:
            roadmap,

        skills:
            [...new Set(skills)]

    };

}


/* =========================================
   OPEN EXPLORE
========================================= */

function openExploreProject() {

    if (!currentProject) {
        return;
    }


    const project =
        currentProject;


    const brief =
        createProjectBrief(
            project
        );


    exploreTitle.textContent =
        project.title;


    exploreDescription.textContent =
        project.description;


    exploreDegree.textContent =
        project.degree;


    exploreCategory.textContent =
        project.category;


    exploreDifficulty.textContent =
        project.difficulty;


    exploreIdea.textContent =
        brief.idea;


    exploreLevel.textContent =
        project.difficulty;


    /*
        FEATURES
    */

    exploreFeatures.innerHTML =
        "";


    brief.features.forEach(
        feature => {

            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                feature;


            exploreFeatures.appendChild(
                item
            );

        }
    );


    /*
        TECHNOLOGIES
    */

    exploreTechnologies.innerHTML =
        "";


    (
        project.technologies ||
        []
    ).forEach(
        technology => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "explore-tech";


            tag.textContent =
                technology;


            exploreTechnologies.appendChild(
                tag
            );

        }
    );


    /*
        ROADMAP
    */

    exploreRoadmap.innerHTML =
        "";


    brief.roadmap.forEach(
        (step, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "roadmap-step";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "roadmap-name";


            name.textContent =
                step;


            wrapper.appendChild(
                name
            );


            if (
                index <
                brief.roadmap.length - 1
            ) {

                const arrow =
                    document.createElement(
                        "span"
                    );


                arrow.className =
                    "roadmap-arrow";


                arrow.textContent =
                    "→";


                wrapper.appendChild(
                    arrow
                );

            }


            exploreRoadmap.appendChild(
                wrapper
            );

        }
    );


    /*
        SKILLS
    */

    exploreSkills.innerHTML =
        "";


    brief.skills.forEach(
        skill => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "explore-skill";


            tag.textContent =
                skill;


            exploreSkills.appendChild(
                tag
            );

        }
    );


    updateExploreSaveButton();


    /*
        Hide result behind Explore.
    */

    resultScreen.classList.remove(
        "active"
    );


    resultScreen.setAttribute(
        "aria-hidden",
        "true"
    );


    exploreScreen.classList.add(
        "active"
    );


    exploreScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    exploreScreen.scrollTop =
        0;

}


/* =========================================
   BACK FROM EXPLORE
========================================= */

function closeExploreToResult() {

    hideExplore();


    if (currentProject) {

        resultScreen.classList.add(
            "active"
        );


        resultScreen.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =========================================
   ANOTHER PROJECT
========================================= */

function spinAnotherProject() {

    closeResult();

    hideExplore();


    setTimeout(
        animateRoulette,
        450
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
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectDifficulty(
                        button.dataset
                            .difficulty
                    );

                }
            );

        }
    );


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


brand.addEventListener(
    "click",
    showDegreeScreen
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
    () => {

        closeResult();

    }
);


anotherButton.addEventListener(
    "click",
    spinAnotherProject
);


saveProjectButton.addEventListener(
    "click",
    toggleCurrentProjectSave
);


exploreButton.addEventListener(
    "click",
    openExploreProject
);


exploreBackButton.addEventListener(
    "click",
    closeExploreToResult
);


exploreSaveButton.addEventListener(
    "click",
    toggleCurrentProjectSave
);


exploreAnotherButton.addEventListener(
    "click",
    spinAnotherProject
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
            [
                "INPUT",
                "TEXTAREA",
                "SELECT",
                "BUTTON"
            ].includes(
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
            exploreScreen.classList.contains(
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

            spinAnotherProject();

            return;

        }


        animateRoulette();

    }
);


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            exploreScreen.classList.contains(
                "active"
            )
        ) {

            closeExploreToResult();

            return;

        }


        if (
            savedScreen.classList.contains(
                "active"
            )
        ) {

            closeSavedProjects();

            return;

        }


        if (
            resultScreen.classList.contains(
                "active"
            )
        ) {

            closeResult();

        }

    }
);


/* =========================================
   START
========================================= */

updateCounter();

loadProjects();