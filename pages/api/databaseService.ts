// TODO: a better way to handle duplicated code with databaseService.ts in client side folder
// https://github.com/noraliucode/cryptopatronage/blob/dev/src/services/databaseService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class DatabaseService {
  readData = async (collection = "data") => {
    try {
      const response = await fetch(`${API_URL}/${collection}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`readData HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("There was a network error:", error);
    }
  };

  updateMany = async (collection = "data", data) => {
    try {
      const response = await fetch(`${API_URL}/${collection}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`readData HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log("There was a network error:", error);
    }
  };
}

export default DatabaseService;
