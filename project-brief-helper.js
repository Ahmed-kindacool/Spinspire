/* Spinspire project brief helper — project-specific data comes from projects.json */
function createProjectBrief(project) {
    return {
        idea: project.description,
        features: Array.isArray(project.features) ? project.features : [],
        roadmap: Array.isArray(project.roadmap) ? project.roadmap : [],
        skills: Array.isArray(project.skills) ? project.skills : []
    };
}
