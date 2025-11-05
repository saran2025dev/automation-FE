import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, fetchProjects, fetchProjectsByAssignedUser, fetchProjectsByUser } from "../API/projectAPI";

export const useProjectQuery = (id, roleName) =>
  useQuery({
    queryKey: ["projects", id, roleName],
    queryFn: ({ queryKey }) => {
      const [, userId, role] = queryKey;
      return fetchProjects(userId, role);
    },
    enabled: !!id && !!roleName,
  });

export const useProjectByUserQuery = (userId) =>
  useQuery({
    queryKey: ["userProjects", userId],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return fetchProjectsByUser(userId);
    },
    enabled: !!userId,
  });
      
export const useProjectsByAssignedUserQuery = (projectId) =>
  useQuery({
    queryKey: ["assignedUserProjects", projectId],
    queryFn: ({ queryKey }) => {
      const [, projectId] = queryKey;
      return fetchProjectsByAssignedUser(projectId);
    },
    enabled: !!projectId,
  });
  
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
    },
  });
};


