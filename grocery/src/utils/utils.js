
export const handleSessionStorage = (action, key, target) => {

  if (action === "set") {
    sessionStorage.setItem("grocery_" + key, JSON.stringify(target));
  }

  else if (action === "get") {
    return JSON.parse(sessionStorage.getItem("grocery_" + key));
  }

  else if (action === "remove") {
    sessionStorage.removeItem("grocery_" + key);
  }
};
