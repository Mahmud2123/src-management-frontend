// lib/api/interceptor.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

    const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

        }
      }
    }

    }

    // Handle network errors
    if (!error.response) {
    }

    return Promise.reject(error);
  }
);

export default apiClient;