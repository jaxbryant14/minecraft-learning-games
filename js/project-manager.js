// Project Manager for cloud-based project storage
class ProjectManager {
  constructor() {
    this.apiUrl = '/.netlify/functions/projects';
  }

  // Get all published projects
  async getPublishedProjects() {
    try {
      console.log('📁 Fetching published projects from:', this.apiUrl);
      const timestamp = Date.now();
      const url = `${this.apiUrl}?t=${timestamp}`;
      console.log('📁 Full URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Projects fetched from server:', data);
      console.log('✅ Projects count:', data.count);
      console.log('✅ Projects object:', data.projects);
      return data.projects || {};
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      console.error('❌ Error details:', error.message);
      return {};
    }
  }

  // Publish a project
  async publishProject(project) {
    try {
      console.log('📁 Publishing project:', project.name);
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish',
          project: project,
          projectId: projectId
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Project published successfully:', data.message);
      return data.project;
    } catch (error) {
      console.error('❌ Error publishing project:', error);
      throw error;
    }
  }

  // Download a project (increment download count)
  async downloadProject(projectId) {
    try {
      console.log('📁 Downloading project:', projectId);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download',
          projectId: projectId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Project downloaded, new count:', data.downloads);
      return data;
    } catch (error) {
      console.error('❌ Error downloading project:', error);
      // Don't throw error for downloads, just log it
    }
  }

  // Like a project
  async likeProject(projectId) {
    try {
      console.log('📁 Liking project:', projectId);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'like',
          projectId: projectId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Project liked, new count:', data.likes);
      return data;
    } catch (error) {
      console.error('❌ Error liking project:', error);
      // Don't throw error for likes, just log it
    }
  }

  // Delete a project
  async deleteProject(projectId) {
    try {
      console.log('📁 Deleting project:', projectId);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          projectId: projectId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Project deleted successfully');
      return data;
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      throw error;
    }
  }

  // Local storage fallback methods
  getLocalProjects() {
    const projects = localStorage.getItem('codingProjects');
    return projects ? JSON.parse(projects) : [];
  }

  setLocalProjects(projects) {
    localStorage.setItem('codingProjects', JSON.stringify(projects));
  }

  saveLocalProject(project) {
    const projects = this.getLocalProjects();
    projects.push(project);
    this.setLocalProjects(projects);
  }
}

// Create global instance
window.projectManager = new ProjectManager(); 