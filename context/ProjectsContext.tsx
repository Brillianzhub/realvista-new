import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from "react";
import api from "@/lib/apiClient";
import { tokenStore } from '@/lib/tokenStore';

// Define the Project type based on your API response
export interface Project {
    id: number;
    name: string;
    description?: string;
    // ✅ Add more fields from your backend response if needed
}

// Define the shape of the context
interface ProjectsContextType {
    projects: Project[];
    fetchProjects: () => Promise<void>;
}

// Create context with proper typing
const ProjectsContext = createContext<ProjectsContextType | undefined>(
    undefined
);

// Custom hook to consume context
export const useProjectData = (): ProjectsContextType => {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error(
            "useProjectData must be used within a ProjectsProvider"
        );
    }
    return context;
};

// Props type for provider
interface ProjectsProviderProps {
    children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
    children,
}) => {
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = async () => {
        try {
            // NOTE: real new path is bare /api/projects/ (list route registered
            // at '' in projects/urls_users.py) — NOT /api/projects/projects/
            // as an earlier mapping suggested; verified via reverse() against
            // the actual backend.
            const response = await api.get<Project[]>(
                "/api/projects/"
            );
            setProjects(response.data);
        } catch (error) {
            console.error("Unable to fetch data now", error);
        }
    };

    useEffect(() => {
        const run = async () => {
            const token = await tokenStore.get();
            if (!token) return;
            fetchProjects();
        };
        run();
    }, []);

    return (
        <ProjectsContext.Provider value={{ projects, fetchProjects }}>
            {children}
        </ProjectsContext.Provider>
    );
};
