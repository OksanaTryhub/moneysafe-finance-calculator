const API_URL = 'https://treasure-dour-piper.glitch.me/api';

export const getData = async (url) => {
  try {
    const response = await fetch(`${API_URL}${url}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json();

  } catch (error) {
    console.log(error)  
    throw error;
  }
};

export const addOperation = async (url, data) => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json();

  } catch (error) {
    console.log(error)  
    throw error;
  }
};

export const deleteOperation = async (url) => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json();

  } catch (error) {
    console.log(error)  
    throw error;
  }
};