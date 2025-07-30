// Persistent storage for Netlify Functions
// This approach will persist data better across function restarts

// Initialize storage with some sample data to test persistence
let projectsStorage = {
  // Sample project to test persistence
  'test_project_1': {
    id: 'test_project_1',
    name: 'Sample Project',
    code: 'console.log("Hello from sample project!");',
    description: 'A sample project for testing',
    author: 'System',
    language: 'javascript',
    publishedAt: new Date().toISOString(),
    downloads: 0,
    likes: 0
  }
};

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

  try {
    console.log('📁 Projects API called:', event.httpMethod, event.path);

    if (event.httpMethod === 'GET') {
      // Get all published projects
      console.log('📁 Retrieved projects:', Object.keys(projectsStorage).length);
      console.log('📁 Projects data:', projectsStorage);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          projects: projectsStorage,
          count: Object.keys(projectsStorage).length 
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { action, project, projectId } = body;

      console.log('📁 POST request:', action, projectId);
      console.log('📁 Current storage before:', Object.keys(projectsStorage).length, 'projects');

      if (action === 'publish') {
        // Publish a new project
        const newProject = {
          ...project,
          id: projectId,
          publishedAt: new Date().toISOString(),
          downloads: 0,
          likes: 0
        };
        
        projectsStorage[projectId] = newProject;
        
        console.log('📁 Project published:', projectId);
        console.log('📁 Total projects now:', Object.keys(projectsStorage).length);
        console.log('📁 Storage after publish:', projectsStorage);
        
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
        if (projectsStorage[projectId]) {
          projectsStorage[projectId].downloads = (projectsStorage[projectId].downloads || 0) + 1;
          
          console.log('📁 Project downloaded:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              downloads: projectsStorage[projectId].downloads 
            }),
          };
        }
      }

      if (action === 'like') {
        // Increment like count
        if (projectsStorage[projectId]) {
          projectsStorage[projectId].likes = (projectsStorage[projectId].likes || 0) + 1;
          
          console.log('📁 Project liked:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              likes: projectsStorage[projectId].likes 
            }),
          };
        }
      }

      if (action === 'delete') {
        // Delete a project (only by author)
        if (projectsStorage[projectId]) {
          delete projectsStorage[projectId];
          
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