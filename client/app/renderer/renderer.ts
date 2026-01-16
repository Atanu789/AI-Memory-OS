declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
    };
  }
}

export {};

const btn = document.getElementById("pingBtn");

btn?.addEventListener("click", async () => {
  const response = await window.api.ping();
  console.log(response);
  alert(response);
});
