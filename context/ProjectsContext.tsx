import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                console.error("No authentication token found");
                return;
            }

            const response = await fetch(
                "https://www.realvistamanagement.com/projects/projects_list/",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Error ${response.status}: ${response.statusText}`
                );
            }

            const data: Project[] = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Unable to fetch data now", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <ProjectsContext.Provider value={{ projects, fetchProjects }}>
            {children}
        </ProjectsContext.Provider>
    );
};
