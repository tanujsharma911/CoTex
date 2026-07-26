/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import type { ApiResponse, AuthPayload, LogoutPayload } from '../types';
import { config } from '../config/env';
import type { docType } from '@cotex/types';

class BackendApi {
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.http_server,
      withCredentials: true
    });
  }

  public async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthPayload>> {
    try {
      const response = await this.axiosInstance.post('/auth/login', {
        email,
        password
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Login error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse<AuthPayload>> {
    try {
      const response = await this.axiosInstance.post('/auth/register', {
        name,
        email,
        password
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Registration error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async logout(token: string): Promise<LogoutPayload> {
    try {
      const response = await this.axiosInstance.post(
        `/auth/logout?token=${token}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Logout error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async getMe(token: string) {
    try {
      const response = await this.axiosInstance.get('/users/me', {
        params: {
          token: token
        }
      });

      console.log(
        'Server Replica ID:',
        (response.headers.get as any)?.('X-Server-Replica')
      );

      return response;
    } catch (err: any) {
      console.error(
        'Get me error:',
        err.response?.data?.message || err.message
      );
      throw err;
    }
  }

  public async getDocs(token: string) {
    try {
      const response = await this.axiosInstance.get('/docs', {
        params: {
          token: token
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(
        'Get documents error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async getDoc({ token, docId }: { token?: string; docId?: string }) {
    if (!token) {
      throw new Error('Token is required to get a document');
    }
    if (!docId) {
      throw new Error('Document ID is required to get a document');
    }
    try {
      const response = await this.axiosInstance.get(`/docs/${docId}`, {
        params: {
          token: token
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(
        'Get document error:',
        error.response?.data?.message || error.message
      );

      throw error;
    }
  }

  public async createDoc({
    token,
    name,
    data,
    visibility
  }: {
    token?: string;
    name: string;
    data?: string;
    visibility: 'private' | 'public';
  }) {
    if (!token) {
      throw new Error('Token is required to create a document');
    }
    try {
      const response = await this.axiosInstance.post(
        '/docs/create',
        {
          name,
          data,
          visibility
        },
        {
          params: {
            token: token
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Create document error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async updateDoc({
    token,
    docId,
    data
  }: {
    token: string;
    docId: string;
    data: Partial<docType>;
  }) {
    try {
      const response = await this.axiosInstance.put(
        `/docs/${docId}`,
        {
          ...data
        },
        {
          params: {
            token: token
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Update document error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async deleteDoc({ token, docId }: { token?: string; docId: string }) {
    if (!token) {
      throw new Error('Token is required to delete a document');
    }
    try {
      const response = await this.axiosInstance.delete(`/docs/${docId}`, {
        params: {
          token: token
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Delete document error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  public async compileDoc({ token, docId }: { token?: string; docId: string }) {
    if (!token) {
      throw new Error('Token is required to compile a document');
    }
    try {
      const response = await this.axiosInstance.get(`/docs/${docId}/compile`, {
        params: {
          token: token
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Compile document error:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }
}

const backendApi = new BackendApi();

export { backendApi };
