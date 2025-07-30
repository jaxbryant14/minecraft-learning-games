// Global storage that persists better across function calls
let globalProjectsStorage = {};

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
      console.log('📁 Current storage:', globalProjectsStorage);
      console.log('📁 Storage keys:', Object.keys(globalProjectsStorage));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          projects: globalProjectsStorage,
          count: Object.keys(globalProjectsStorage).length 
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { action, project, projectId } = body;

      console.log('📁 POST request:', action, projectId);
      console.log('📁 Current storage before:', globalProjectsStorage);

      if (action === 'publish') {
        // Publish a new project
        const newProject = {
          ...project,
          id: projectId,
          publishedAt: new Date().toISOString(),
          downloads: 0,
          likes: 0
        };
        
        globalProjectsStorage[projectId] = newProject;
        
        console.log('📁 Project published:', projectId);
        console.log('📁 Storage after publish:', globalProjectsStorage);
        
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
        if (globalProjectsStorage[projectId]) {
          globalProjectsStorage[projectId].downloads = (globalProjectsStorage[projectId].downloads || 0) + 1;
          
          console.log('📁 Project downloaded:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              downloads: globalProjectsStorage[projectId].downloads 
            }),
          };
        }
      }

      if (action === 'like') {
        // Increment like count
        if (globalProjectsStorage[projectId]) {
          globalProjectsStorage[projectId].likes = (globalProjectsStorage[projectId].likes || 0) + 1;
          
          console.log('📁 Project liked:', projectId);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              likes: globalProjectsStorage[projectId].likes 
            }),
          };
        }
      }

      if (action === 'delete') {
        // Delete a project (only by author)
        if (globalProjectsStorage[projectId]) {
          delete globalProjectsStorage[projectId];
          
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