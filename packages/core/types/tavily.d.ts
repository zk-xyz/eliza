declare module "tavily" {
    export class Tavily {
        constructor(config: { apiKey: string });
        search(query: string, options?: {
            includeAnswer?: boolean;
            maxResults?: number;
            searchDepth?: string;
            includeImages?: boolean;
        }): Promise<{
            results: Array<{
                title: string;
                url: string;
                content: string;
                score?: number;
                publishedDate?: string;
            }>;
            answer?: string;
        }>;
    }
}