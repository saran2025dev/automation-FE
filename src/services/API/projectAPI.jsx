import axios from "axios";
import { ENDPOINTS } from "./endpoints";

export const fetchProjects = async (userId, roleName) => {
  const res = await axios.get(ENDPOINTS.PROJECT.GET_ALL(userId, roleName));
  return res.data;
};

export const fetchProjectsByUser = async (userId) => {
  const res = await axios.get(ENDPOINTS.PROJECT.GET_BY_USER(userId));
  return res.data;
}

export const fetchProjectsByAssignedUser = async (projectId) => {
  const res = await axios.get(ENDPOINTS.PROJECT.GET_BY_ASSIGNED_USER(projectId));
  return res.data;
}

export const createProject = async (projectData) => {
  const res = await axios.post(ENDPOINTS.PROJECT.CREATE, projectData);
  return res.data;
};
