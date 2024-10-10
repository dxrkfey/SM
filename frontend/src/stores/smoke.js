import { defineStore } from "pinia";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const useSmokeStore = defineStore("smoke", {
  state: () => ({
    selectedSmoke: {},
    dailyData: [],
    monthlyData: [],
    yearlyData: [],
    normalData: [],
    blackCount: 0,
    whiteCount: 0,
  }),
  actions: {
    async loadSmoke() {
      try {
        const response = await axios.get(`${BASE_URL}/smoke`);
        this.selectedSmoke = response.data.data;
        this.selectedSmoke.imageUrl = response.data.imageUrl;
        this.blackCount = response.data.blackCount || 0;
        this.whiteCount = response.data.whiteCount || 0;
        console.log(response.data.imageUrl);
      } catch (error) {
        console.error("Error loading smoke:", error);
      }
    },
    async filterSmoke(startDate, endDate) {
      try {
        const response = await axios.get(`${BASE_URL}/filter-smoke`, {
           params : {startDate, endDate}
        });
        const { normalData, dailyData, monthlyData, yearlyData } = response.data;
        this.normalData = normalData || [];
        this.dailyData = dailyData || [];
        this.monthlyData = monthlyData || [];
        this.yearlyData = yearlyData || [];
      } catch (error) {
        console.error("Error filtering smoke data:", error);
      }
    },
    async register(userData) {
      try {
        const response = await axios.post(`${BASE_URL}/register`, userData);
        return response.data;
      } catch (error) {
        console.error("Error registering user:", error);
      }
    },
    async login(userData) {
      try {
        const response = await axios.post(`${BASE_URL}/login`, userData);
        localStorage.setItem("token", response.data.token);
        return response.data;
      } catch (error) {
        console.error("Error logging in:", error);
      }
    },
    async getUser() {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/user`, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          window.location.replace("/login");
        }
      }
    },
    async editUser(userData) {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(`${BASE_URL}/edit-user`, userData, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        return response.data;
      } catch (error) {
        console.error("Error editing user:", error);
      }
    },
    async editLineToken(lineToken, lineID) {
      try {
        const response = await axios.post(`${BASE_URL}/edit-linetoken`, {
          lineToken,
          lineID,
        });
        console.log("Edit Line Token Success");
        return response.data;
      } catch (error) {
        console.error("Error editing line token:", error);
      }
    },
  },
});
