export const toggleTheme = (): "light" | "dark" => {
  const currentTheme =
    localStorage.getItem("theme") === "dark" ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  return newTheme;
};
export const checkTheme = (): string => {
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    return "dark";
  } else {
    return "light";
  }
};
// function to check if string is empty
export const checkStringIsEmpty = (text: string): boolean => {
  if (text === "" || text === null) {
    return true;
  }
  return false;
};
