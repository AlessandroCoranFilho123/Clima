const API_KEY = "gtYL4JB2Mi5Q5ItJPfzL7DlBXSXN1zNGoSnLwtJI";

const fallbackCoords = {
    lat: -22.5645,
    lon: -47.4010
};

document.addEventListener("DOMContentLoaded", () => {
    initWeather();
    updateTime();
    setInterval(updateTime, 1000);
});

async function fetchCityName(lat, lon) {
    const response = await fetch(
        `https://api.api-ninjas.com/v1/reversegeocoding?lat=${lat}&lon=${lon}`,
        { headers: { "X-Api-Key": API_KEY } }
    );
    const data = await response.json();
    if (data && data[0]) {
        const city = data[0].name;
        const state = data[0].state ?? "";
        updateLocationName(`${city}, ${state}`);
    }
}

function initWeather() {
    if (!navigator.geolocation) {
        console.warn("Geolocalização não suportada");
        useFallback();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetchCityName(latitude, longitude);
            fetchWeather(latitude, longitude);
        },
        error => {
            console.warn("Usuário negou localização ou erro:", error);
            useFallback();
        },
        {
            timeout: 5000
        }
    );
}

function useFallback() {
    fetchWeather(fallbackCoords.lat, fallbackCoords.lon);
    updateLocationName("Limeira, SP (fallback)");
}

async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(
            `https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`,
            {
                method: "GET",
                headers: {
                    "X-Api-Key": API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Weather data:", data);

        updateUI(data);

    } catch (error) {
        console.error("Erro ao buscar clima:", error);
    }
}

function updateUI(data) {
    if (!data) return;

    document.querySelector(".temperatura").textContent = `${data.temp}°`;
    document.querySelector(".vento").textContent = `${data.wind_speed} km/h`;
    document.querySelector(".direcao").textContent = `${data.wind_degrees}°`;
    document.querySelector(".umidade").textContent = `${data.humidity}%`;
    document.querySelector(".descricao").textContent = getWeatherDescription(data);

    updateWeatherIcon(data);
}

function getWeatherDescription(data) {
    const temp = data.temp;
    const humidity = data.humidity;
    const hour = new Date().getHours();

    if (hour >= 18 || hour <= 5) return "Noite";
    if (humidity > 80) return "Muito úmido";
    if (temp >= 35) return "Extremamente quente";
    if (temp >= 28) return "Ensolarado";
    if (temp >= 22) return "Agradável";
    if (temp >= 15) return "Frio leve";
    return "Frio";
}

function updateWeatherIcon(data) {
    const icon = document.querySelector(".sol-icon");

    if (!icon) return;

    const hour = new Date().getHours();

    if (hour >= 18 || hour <= 5) {
        icon.src = "/imagens/lua.svg";
        return;
    }

    if (data.humidity > 80) {
        icon.src = "/imagens/nublado.svg";
    } else {
        icon.src = "/imagens/sol.svg";
    }
}

function updateLocationName(name) {
    const el = document.querySelector(".localizacao span");
    if (el) el.textContent = name;
}

function updateTime() {
    const now = new Date();

    const time = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    document.querySelector(".hora").textContent = time;
}