// src/stores/smoke.ts

import { defineStore } from "pinia";
import axios from "axios";

interface SmokeRatio {
  Black: number;
  White: number;
}

interface DataItem {
  No: number;
  date_time: string;
  Status: number;
  TimeOfSmoke: number;
}

interface SelectedSmoke extends DataItem {
  imageUrl: string;
}

interface SmokeState {
  selectedSmoke: SelectedSmoke | null;
  dailyData: SmokeRatio[];
  monthlyData: SmokeRatio[];
  yearlyData: SmokeRatio[];
  normalData: DataItem[];
  blackCount: number;
  whiteCount: number;

  // User-related properties
  username: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notificationTokens: string[];
  profilePicData: string;
}

interface LoadSmokeResponse {
  data: DataItem;
  imageUrl: string;
  blackCount: number;
  whiteCount: number;
}

interface FilterSmokeResponse {
  normalData: DataItem[];
  dailyData: SmokeRatio[];
  monthlyData: SmokeRatio[];
  yearlyData: SmokeRatio[];
}

const BASE_URL = "http://127.0.0.1:8000";

export const useSmokeStore = defineStore("smoke", {
  state: (): SmokeState => ({
    selectedSmoke: null,
    dailyData: [],
    monthlyData: [],
    yearlyData: [],
    normalData: [],
    blackCount: 0,
    whiteCount: 0,

    // User-related properties
    username: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notificationTokens: [],
    profilePicData: '',
  }),

  actions: {
    // Existing actions...

    async loadSmoke(): Promise<void> {
      try {
        const response = await axios.get<LoadSmokeResponse>(`${BASE_URL}/smoke`);
        const { data, imageUrl, blackCount, whiteCount } = response.data;

        const selectedWithImage: SelectedSmoke = { ...data, imageUrl };
        this.selectedSmoke = selectedWithImage;
        this.blackCount = blackCount || 0;
        this.whiteCount = whiteCount || 0;
      } catch (error: any) {
        console.error("Error loading smoke:", error);
      }
    },

    async filterSmoke(startDate: string, endDate: string): Promise<void> {
      try {
        const response = await axios.get<FilterSmokeResponse>(`${BASE_URL}/filter-smoke`, {
          params: { startDate, endDate },
        });
        const { normalData, dailyData, monthlyData, yearlyData } = response.data;

        this.normalData = normalData || [];
        this.dailyData = dailyData || [];
        this.monthlyData = monthlyData || [];
        this.yearlyData = yearlyData || [];
      } catch (error: any) {
        console.error("Error filtering smoke data:", error);
      }
    },

    // User Registration
    async register(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const response = await axios.post(`${BASE_URL}/register`, userData);
        return response.data;
      } catch (error: any) {
        console.error("Error registering user:", error);
      }
    },

    // User Login
    async login(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const response = await axios.post(`${BASE_URL}/login`, userData);
        localStorage.setItem("token", response.data.token);
        return response.data;
      } catch (error: any) {
        console.error("Error logging in:", error);
      }
    },

    // Fetch User Data
    async getUser(): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/user`, 
        //   {
        //   headers: { authorization: `Bearer ${authToken}` },
        // }
      );
        return response.data;
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          window.location.replace("/login");
        }
      }
    },

    // Edit User Data
    async editUser(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(`${BASE_URL}/edit-user`, userData, 
          {
          headers: { authorization: `Bearer ${authToken}` },
        }
      );
        return response.data;
      } catch (error: any) {
        console.error("Error editing user:", error);
      }
    },

    // Add Line Token
    async addLineToken(lineToken: string): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/add-linetoken`,
          { lineToken }
          // ,
          // {
          //   headers: { authorization: `Bearer ${authToken}` },
          // }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error adding line token:", error);
      }
    },

    async removeLineToken(lineID: number): Promise<any | undefined> {
      try {
        // const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/remove-linetoken`,
          { lineID }
          // ,
          // {
          //   headers: { authorization: `Bearer ${authToken}` },
          // }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error removing line token:", error);
      }
    },


    async updateLineToken(lineToken: string, lineID: string): Promise<any | undefined> {
      try {
        // const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/edit-linetoken`,
          { lineToken,lineID }
          // ,
          // {
          //   headers: { authorization: `Bearer ${authToken}` },
          // }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error removing line token:", error);
      }
    },

    async loadUserData(): Promise<void> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/user`, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        const userData = response.data;
        this.username = userData.Username || '';
        this.company = userData.Company || '';
        this.email = userData.Email || '';
        this.phone = userData.Phone || '';
        this.address = userData.Address || '';
        this.profilePicData = userData.ProfilePic || '';
        this.notificationTokens = Array.isArray(userData.notificationTokens)
      ? userData.notificationTokens
      : [];
      } catch (error: any) {
        console.error("Error loading user data:", error);
      }
    },

    updateUserInfo(userData: {
      username: string;
      company: string;
      email: string;
      phone: string;
      address: string;
      profilePicData: string;
    }): void {
      this.username = userData.username;
      this.company = userData.company;
      this.email = userData.email;
      this.phone = userData.phone;
      this.address = userData.address;
      this.profilePicData = userData.profilePicData;
    },

    addNotificationToken(token: string): void {
      this.notificationTokens.push(token);
    },

    removeNotificationToken(index: number): void {
      this.notificationTokens.splice(index, 1);
    },
  },
});
