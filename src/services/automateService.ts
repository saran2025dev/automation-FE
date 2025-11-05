import axios from 'axios';
import { ActionPayload } from '../types';
import {BASE_URL} from "./API/endpoints.jsx"



export const fetchMethods = async (): Promise<string[]> => {
  const { data } = await axios.get(`${BASE_URL}/auto-process/methods`);
  return data;
};

export const sendAutomationData = async (actions: ActionPayload[]): Promise<void> => {
  await axios.post(`${BASE_URL}/test`, actions);
};


/* Save a new script */
export async function saveScript(data: { title: string; actions: ActionPayload[] }) {
  const response = await axios.post(`${BASE_URL}`, data);
  console.log(response.data)
  return response.data; // { id }
}

/* Update an existing script */
export async function updateScript(id: string, data: { title: string; actions: ActionPayload[] }) {
  await axios.put(`${BASE_URL}/${id}`, data);
}

/* Load an existing script by ID */
export async function loadScript(id: string): Promise<{ title: string; actions: ActionPayload[] }> {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
}