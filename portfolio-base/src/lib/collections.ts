import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Note = CollectionEntry<'garden'>;

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

export async function getNotes(): Promise<Note[]> {
  return (await getCollection('garden')).sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
}

/** "P—01" style index code shown on cards. */
export function projectCode(project: Project): string {
  return `P—${String(project.data.order).padStart(2, '0')}`;
}

export const projectHref = (project: Project) => `/projects/${project.id}/`;
export const noteHref = (note: Note) => `/garden/${note.id}/`;
