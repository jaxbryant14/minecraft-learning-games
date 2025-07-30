const handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  // In-memory storage for projects (in production, you'd use a database)
  let projectsStorage = {};

  // Load projects from storage
  function loadProjects() {
    return projectsStorage;
  }

  // Save projects to storage
  function saveProjects(projects) {
    projectsStorage = projects;
    return true;
  }

  try {
    console.log('📁 Projects API called:', event.httpMethod, event.path);

    if (event.httpMethod === 'GET') {
      // Get all published projects
      const projects = loadProjects();
      console.log('📁 Retrieved projects:', Object.keys(projects).length);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          projects: projects,
          count: Object.keys(projects).length 
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { action, project, projectId } = body;

      console.log('📁 POST request:', action, projectId);

      if (action === 'publish') {
        // Publish a new project
        const projects = loadProjects();
        const newProject = {
          ...project,
          id: projectId,
          publishedAt: new Date().toISOString(),
          downloads: 0,
          likes: 0
        };
        
        projects[projectId] = newProject;
        saveProjects(projects);
        
        console.log('📁 Project published:', projectId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            project: newProject,
            message: 'Project published successfully!' 
          }),
        };
      }

      if (action === 'download') {
        // Increment download count
        const projects = loadProjects();
        if (projects[projectId]) {
          projects[projectId].downloads = (projects[projectId].downloads || 0) + 1;
          saveProjects(projects);
          
          console.log('📁 Project downloaded:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              downloads: projects[projectId].downloads 
            }),
          };
        }
      }

      if (action === 'like') {
        // Increment like count
        const projects = loadProjects();
        if (projects[projectId]) {
          projects[projectId].likes = (projects[projectId].likes || 0) + 1;
          saveProjects(projects);
          
          console.log('📁 Project liked:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              likes: projects[projectId].likes 
            }),
          };
        }
      }

      if (action === 'delete') {
        // Delete a project (only by author)
        const projects = loadProjects();
        if (projects[projectId]) {
          delete projects[projectId];
          saveProjects(projects);
          
          console.log('📁 Project deleted:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              message: 'Project deleted successfully!' 
            }),
          };
        }
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' }),
    };

  } catch (error) {
    console.error('❌ Projects API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

module.exports = { handler }; 