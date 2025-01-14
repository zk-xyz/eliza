import { useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import info from "@/lib/info.json";
import semver from "semver";
import { ToastAction } from "@/components/ui/toast";
import { Link } from "react-router-dom"; // Changed from NavLink to Link

export default function useVersion() {
    const { toast } = useToast();

    const getLatestRelease = useCallback(async (repo: string) => {
        const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

        try {
            const response = await fetch(apiUrl, {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "fetch-latest-release",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch latest release: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data.tag_name;
        } catch (error) {
            console.error("Error fetching latest release:", error);
            return null;
        }
    }, []);

    const compareVersion = useCallback(async () => {
        try {
            const latestVersion = await getLatestRelease("elizaos/eliza");
            const thisVersion = info?.version;
            
            if (!latestVersion || !thisVersion) {
                return;
            }

            const latest = latestVersion.replace("v", "");
            const current = thisVersion.replace("v", "");

            if (semver.gt(latest, current)) {
                toast({
                    variant: "default",
                    title: `New version ${latestVersion} is available.`,
                    description: "Visit GitHub for more information.",
                    action: (
                        <Link
                            to="https://github.com/elizaos/eliza/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ToastAction altText="Update">
                                Update
                            </ToastAction>
                        </Link>
                    ),
                });
            }
        } catch (error) {
            console.error("Unable to retrieve latest version from GitHub:", error);
        }
    }, [toast, getLatestRelease]);

    useEffect(() => {
        let mounted = true;

        const checkVersion = async () => {
            if (mounted) {
                await compareVersion();
            }
        };

        checkVersion();

        return () => {
            mounted = false;
        };
    }, [compareVersion]);

    return null;
}