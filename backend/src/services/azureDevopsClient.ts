import axios, { AxiosInstance } from 'axios';
import config from '../config/env';

// Azure DevOps PAT auth: Basic base64(':'+PAT)
function buildAuthHeader(pat: string): string {
  const token = Buffer.from(':' + pat).toString('base64');
  return `Basic ${token}`;
}

class AzureDevOpsClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.azdo.baseUrl,
      headers: {
        Authorization: buildAuthHeader(config.azdo.pat)
      }
    });
  }

  async getWorkItemsWiql(project: string | undefined, wiql: string) {
    // POST Wiql query: https://dev.azure.com/{organization}/{project}/_apis/wit/wiql?api-version=7.1-preview.2
    const url = project
      ? `/${project}/_apis/wit/wiql?api-version=7.1-preview.2`
      : '/_apis/wit/wiql?api-version=7.1-preview.2';
    const { data } = await this.client.post(url, { query: wiql });
    return data;
  }

  async getWorkItems(ids: number[]) {
    if (!ids.length) return [];
    const chunk = 200; // API limit safeguard
    const results: any[] = [];
    for (let i = 0; i < ids.length; i += chunk) {
      const slice = ids.slice(i, i + chunk);
      const url = `/_apis/wit/workitems?ids=${slice.join(',')}&api-version=7.1-preview.2`;
      const { data } = await this.client.get(url);
      results.push(...(data.value || []));
    }
    return results;
  }
}

export const azureDevopsClient = new AzureDevOpsClient();
