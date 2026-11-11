/**
 * Aura Weather — Responsive Live Weather Engine
 * Powered by Open-Meteo live APIs
 */

(function () {
  'use strict';

  // State Management
  const state = {
    isCelsius: true,
    currentLocation: {
      name: 'London, United Kingdom',
      lat: 51.50853,
      lon: -0.12574
    },
    weatherData: null,
    airQualityData: null,
    selectedDayIndex: 0,
    activeTab: 'week' // 'today' or 'week'
  };

  // Weather Code Dictionary (WMO Code -> UI properties)
  const weatherCodeMap = {
    0: { text: 'Clear Sky', icon: 'wb_sunny', isRain: false, sky: 'from-amber-400 via-orange-400 to-sky-500' },
    1: { text: 'Mainly Clear', icon: 'partly_cloudy_day', isRain: false, sky: 'from-blue-400 via-sky-400 to-amber-300' },
    2: { text: 'Partly Cloudy', icon: 'partly_cloudy_day', isRain: false, sky: 'from-slate-400 via-sky-500 to-blue-500' },
    3: { text: 'Overcast', icon: 'cloud', isRain: false, sky: 'from-slate-500 via-gray-500 to-slate-600' },
    45: { text: 'Fog', icon: 'foggy', isRain: false, sky: 'from-gray-400 via-slate-400 to-zinc-500' },
    48: { text: 'Depositing Rime Fog', icon: 'foggy', isRain: false, sky: 'from-gray-400 via-slate-400 to-zinc-500' },
    51: { text: 'Light Drizzle', icon: 'grain', isRain: true, sky: 'from-slate-500 via-blue-600 to-slate-700' },
    53: { text: 'Moderate Drizzle', icon: 'grain', isRain: true, sky: 'from-slate-600 via-blue-700 to-slate-800' },
    55: { text: 'Dense Drizzle', icon: 'grain', isRain: true, sky: 'from-slate-600 via-blue-700 to-slate-800' },
    61: { text: 'Slight Rain', icon: 'rainy', isRain: true, sky: 'from-blue-600 via-indigo-600 to-slate-700' },
    63: { text: 'Moderate Rain', icon: 'rainy', isRain: true, sky: 'from-blue-700 via-indigo-700 to-slate-800' },
    65: { text: 'Heavy Rain', icon: 'rainy', isRain: true, sky: 'from-blue-800 via-indigo-800 to-slate-900' },
    71: { text: 'Slight Snow', icon: 'ac_unit', isRain: false, sky: 'from-slate-300 via-blue-300 to-indigo-400' },
    73: { text: 'Moderate Snow', icon: 'ac_unit', isRain: false, sky: 'from-slate-400 via-blue-400 to-indigo-500' },
    75: { text: 'Heavy Snow', icon: 'ac_unit', isRain: false, sky: 'from-slate-500 via-blue-500 to-indigo-600' },
    77: { text: 'Snow Grains', icon: 'ac_unit', isRain: false, sky: 'from-slate-400 via-blue-400 to-indigo-500' },
    80: { text: 'Slight Showers', icon: 'shower', isRain: true, sky: 'from-blue-600 via-sky-600 to-slate-700' },
    81: { text: 'Moderate Showers', icon: 'shower', isRain: true, sky: 'from-blue-700 via-indigo-700 to-slate-800' },
    82: { text: 'Violent Showers', icon: 'shower', isRain: true, sky: 'from-blue-900 via-indigo-900 to-slate-900' },
    85: { text: 'Snow Showers', icon: 'weather_snowy', isRain: false, sky: 'from-slate-400 via-blue-300 to-indigo-400' },
    86: { text: 'Heavy Snow Showers', icon: 'weather_snowy', isRain: false, sky: 'from-slate-500 via-blue-400 to-indigo-500' },
    95: { text: 'Thunderstorm', icon: 'thunderstorm', isRain: true, sky: 'from-amber-700 via-purple-900 to-slate-900' },
    96: { text: 'Thunderstorm with Hail', icon: 'thunderstorm', isRain: true, sky: 'from-amber-800 via-purple-950 to-black' },
    99: { text: 'Heavy Thunderstorm', icon: 'thunderstorm', isRain: true, sky: 'from-amber-800 via-purple-950 to-black' }
  };

  function getWeatherInfo(code) {
    return weatherCodeMap[code] || { text: 'Clear Sky', icon: 'wb_sunny', isRain: false, sky: 'from-amber-400 via-orange-400 to-sky-500' };
  }

  function getCardinalDirection(angle) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(angle / 22.5) % 16;
    return directions[index];
  }

  function formatTemp(celsius) {
    if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
    if (!state.isCelsius) {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return Math.round(fahrenheit);
    }
    return Math.round(celsius);
  }

  // Fetch Live Weather & Air Quality from Open-Meteo
  async function fetchWeatherData(lat, lon, locationName) {
    showLoading(true);
    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto&forecast_days=7`;
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm2_5,pm10`;

      const [forecastRes, aqiRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(aqiUrl).catch(() => null)
      ]);

      if (!forecastRes.ok) throw new Error('Weather API request failed');

      state.weatherData = await forecastRes.json();
      state.airQualityData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

      if (locationName) {
        state.currentLocation.name = locationName;
      }
      state.currentLocation.lat = lat;
      state.currentLocation.lon = lon;

      updateUI();
    } catch (err) {
      console.error('Error fetching weather:', err);
      showToast('Could not load live weather. Please check connection.');
    } finally {
      showLoading(false);
    }
  }

  // Update All Visual Elements
  function updateUI() {
    if (!state.weatherData) return;
    const { current, daily } = state.weatherData;

    // 1. Search Bar & Location
    const searchInput = document.getElementById('city-search-input');
    const cityCard = document.getElementById('city-card-name');
    if (searchInput) searchInput.value = state.currentLocation.name;
    if (cityCard) cityCard.textContent = state.currentLocation.name;

    // 2. Hero Temperature & Conditions
    const heroTemp = document.getElementById('hero-temp-val');
    const heroUnit = document.getElementById('hero-temp-unit');
    const heroFeels = document.getElementById('hero-feels-like');
    const heroDayTime = document.getElementById('hero-day-time');
    const heroCondition = document.getElementById('hero-condition');
    const heroPrecip = document.getElementById('hero-precip');

    if (heroTemp) heroTemp.textContent = formatTemp(current.temperature_2m);
    if (heroUnit) heroUnit.textContent = state.isCelsius ? '°C' : '°F';
    if (heroFeels) heroFeels.textContent = `Feels like ${formatTemp(current.apparent_temperature)}°${state.isCelsius ? 'C' : 'F'}`;

    // Current Date / Time
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (heroDayTime) heroDayTime.textContent = `${dayNames[now.getDay()]}, ${hours}:${minutes}`;

    const info = getWeatherInfo(current.weather_code);
    if (heroCondition) heroCondition.textContent = info.text;

    // Dynamic Rain Bars Visibility: ONLY show bouncing rain ticks when it is actually raining!
    const rainBars = document.getElementById('hero-rain-bars');
    if (rainBars) {
      rainBars.style.display = info.isRain ? 'flex' : 'none';
    }

    // Dynamic Sky Backdrop for Hero Temperature Weather Card
    const heroSky = document.getElementById('hero-weather-sky');
    const isNight = current.is_day === 0;
    if (heroSky) {
      heroSky.className = isNight
        ? 'absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 transition-all duration-700'
        : `absolute inset-0 bg-gradient-to-br ${info.sky} transition-all duration-700`;
    }

    const citySky = document.getElementById('city-card-sky');
    if (citySky) {
      citySky.className = isNight
        ? 'w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 transition-all duration-700'
        : `w-full h-full bg-gradient-to-tr ${info.sky} transition-all duration-700`;
    }

    const condIcon = document.getElementById('hero-condition-icon');
    if (condIcon) condIcon.textContent = isNight ? 'nights_stay' : info.icon;

    const orbIcon = document.getElementById('hero-orb-icon');
    if (orbIcon) orbIcon.textContent = isNight ? 'nights_stay' : info.icon;

    const orbSun = document.getElementById('hero-orb-sun');
    if (orbSun) {
      orbSun.className = isNight
        ? 'w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-500 to-slate-300 shadow-[0_0_30px_rgba(167,139,250,0.55)] flex items-center justify-center transition-all duration-700'
        : 'w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 shadow-[0_0_30px_rgba(255,215,0,0.55)] flex items-center justify-center transition-all duration-700';
    }

    // Precipitation probability
    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
    if (heroPrecip) heroPrecip.textContent = `${precipProb}%`;

    // 3. Highlight Card 1: UV Index
    const uvMax = daily.uv_index_max && daily.uv_index_max[0] ? daily.uv_index_max[0] : 0;
    const uvVal = document.getElementById('uv-val');
    const uvLabel = document.getElementById('uv-label');
    const uvDesc = document.getElementById('uv-desc');
    const uvArc = document.getElementById('uv-arc-fill');

    if (uvVal) uvVal.textContent = Math.round(uvMax);
    let uvRating = 'Low';
    let uvTip = 'No protection required';
    let uvColor = '#35a464';

    if (uvMax >= 11) {
      uvRating = 'Extreme';
      uvTip = 'Avoid sun during peak hours';
      uvColor = '#93000a';
    } else if (uvMax >= 8) {
      uvRating = 'Very High';
      uvTip = 'Extra skin protection needed';
      uvColor = '#ba1a1a';
    } else if (uvMax >= 6) {
      uvRating = 'High';
      uvTip = 'Hat & SPF 30+ recommended';
      uvColor = '#ffa84b';
    } else if (uvMax >= 3) {
      uvRating = 'Moderate';
      uvTip = 'Seek shade during midday';
      uvColor = '#FFB800';
    }

    if (uvLabel) {
      uvLabel.textContent = uvRating;
      uvLabel.style.color = uvColor;
    }
    if (uvDesc) uvDesc.textContent = uvTip;

    if (uvArc) {
      const angleFraction = Math.min(Math.max(uvMax / 12, 0.05), 1);
      const angleRad = Math.PI * (1 - angleFraction);
      const targetX = 80 - 60 * Math.cos(angleRad);
      const targetY = 80 - 60 * Math.sin(angleRad);
      uvArc.setAttribute('d', `M 20 80 A 60 60 0 0 1 ${targetX.toFixed(1)} ${targetY.toFixed(1)}`);
      uvArc.setAttribute('stroke', uvColor);
    }

    // 4. Highlight Card 2: Wind Status
    const windSpeed = document.getElementById('wind-speed');
    const windSpeedUnit = document.getElementById('wind-speed-unit');
    const windCompass = document.getElementById('wind-compass');
    const windDir = document.getElementById('wind-direction');
    const windGusts = document.getElementById('wind-gusts');

    if (windSpeed) {
      if (!state.isCelsius) {
        windSpeed.textContent = (current.wind_speed_10m * 0.621371).toFixed(1);
        if (windSpeedUnit) windSpeedUnit.textContent = 'mph';
      } else {
        windSpeed.textContent = current.wind_speed_10m.toFixed(1);
        if (windSpeedUnit) windSpeedUnit.textContent = 'km/h';
      }
    }
    if (windCompass) {
      windCompass.style.transform = `rotate(${current.wind_direction_10m}deg)`;
      windCompass.style.transition = 'transform 0.5s ease-out';
    }
    if (windDir) windDir.textContent = getCardinalDirection(current.wind_direction_10m);
    if (windGusts) {
      const gustStr = state.isCelsius ? `${current.wind_gusts_10m.toFixed(0)} km/h` : `${(current.wind_gusts_10m * 0.621371).toFixed(0)} mph`;
      windGusts.textContent = `Gusts ${gustStr}`;
    }

    // 5. Highlight Card 3: Sunrise & Sunset
    const sunriseTime = document.getElementById('sunrise-time');
    const sunsetTime = document.getElementById('sunset-time');
    const totalDaylight = document.getElementById('total-daylight');

    if (daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
      const riseDate = new Date(daily.sunrise[0]);
      const setDate = new Date(daily.sunset[0]);

      if (sunriseTime) {
        sunriseTime.textContent = riseDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      if (sunsetTime) {
        sunsetTime.textContent = setDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }

      const diffMs = setDate - riseDate;
      if (diffMs > 0 && totalDaylight) {
        const hoursDay = Math.floor(diffMs / 3600000);
        const minsDay = Math.floor((diffMs % 3600000) / 60000);
        totalDaylight.textContent = `Total Daylight: ${hoursDay}h ${String(minsDay).padStart(2, '0')}m`;
      }
    }

    // 6. Highlight Card 4: Humidity
    const humVal = document.getElementById('humidity-val');
    const humMarker = document.getElementById('humidity-marker');
    const humStatus = document.getElementById('humidity-status');
    const humEmoji = document.getElementById('humidity-emoji');

    const humidity = current.relative_humidity_2m;
    if (humVal) humVal.textContent = humidity;
    if (humMarker) {
      const clampedHum = Math.min(Math.max(humidity, 5), 95);
      humMarker.style.marginBottom = `${(clampedHum * 0.45).toFixed(0)}px`;
    }
    if (humStatus && humEmoji) {
      if (humidity > 70) {
        humStatus.textContent = 'High';
        humEmoji.textContent = '💧';
      } else if (humidity < 30) {
        humStatus.textContent = 'Dry';
        humEmoji.textContent = '🏜️';
      } else {
        humStatus.textContent = 'Optimal';
        humEmoji.textContent = '👍';
      }
    }

    // 7. Highlight Card 5: Visibility
    const visVal = document.getElementById('visibility-val');
    const visUnit = document.getElementById('visibility-unit');
    const visStatus = document.getElementById('visibility-status');
    const visEmoji = document.getElementById('visibility-emoji');
    const visDesc = document.getElementById('visibility-desc');

    const visibilityMeters = current.visibility !== undefined ? current.visibility : 10000;
    const visibilityKm = (visibilityMeters / 1000).toFixed(1);
    if (visVal) {
      visVal.textContent = state.isCelsius ? visibilityKm : (visibilityKm * 0.621371).toFixed(1);
    }
    if (visUnit) visUnit.textContent = state.isCelsius ? 'km' : 'mi';

    if (visStatus && visEmoji && visDesc) {
      if (visibilityMeters >= 10000) {
        visStatus.textContent = 'Clear';
        visEmoji.textContent = '✨';
        visDesc.textContent = 'Crystal clear horizon';
      } else if (visibilityMeters >= 5000) {
        visStatus.textContent = 'Good';
        visEmoji.textContent = '🙂';
        visDesc.textContent = 'Mild haze in distance';
      } else {
        visStatus.textContent = 'Low';
        visEmoji.textContent = '🌫️';
        visDesc.textContent = 'Reduced visibility';
      }
    }

    // 8. Highlight Card 6: Air Quality
    const aqiVal = document.getElementById('aqi-val');
    const aqiMarker = document.getElementById('aqi-marker');
    const aqiStatus = document.getElementById('aqi-status');
    const aqiEmoji = document.getElementById('aqi-emoji');

    let aqiNumber = 35;
    if (state.airQualityData && state.airQualityData.current) {
      aqiNumber = state.airQualityData.current.us_aqi || Math.round(state.airQualityData.current.european_aqi * 1.5) || 35;
    }

    if (aqiVal) aqiVal.textContent = aqiNumber;
    if (aqiMarker) {
      const clampedAqi = Math.min(Math.max((aqiNumber / 300) * 100, 5), 90);
      aqiMarker.style.marginTop = `${(clampedAqi * 0.45).toFixed(0)}px`;
    }
    if (aqiStatus && aqiEmoji) {
      if (aqiNumber <= 50) {
        aqiStatus.textContent = 'Good';
        aqiEmoji.textContent = '🌱';
      } else if (aqiNumber <= 100) {
        aqiStatus.textContent = 'Moderate';
        aqiEmoji.textContent = '😐';
      } else if (aqiNumber <= 150) {
        aqiStatus.textContent = 'Sensitive';
        aqiEmoji.textContent = '😷';
      } else {
        aqiStatus.textContent = 'Unhealthy';
        aqiEmoji.textContent = '👎';
      }
    }

    // 9. Render Forecast Strip & Hourly Horizon
    renderForecastStrip();
    renderHourlyHorizon();
  }

  // Render 7-Day Forecast Cards (Fully Responsive for Mobile Swipe & Desktop Grid)
  function renderForecastStrip() {
    const strip = document.getElementById('forecast-strip');
    if (!strip || !state.weatherData || !state.weatherData.daily) return;

    const daily = state.weatherData.daily;
    const daysCount = daily.time.length;
    strip.innerHTML = '';

    const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daysCount; i++) {
      const date = new Date(daily.time[i]);
      const dayLabel = i === 0 ? 'Today' : dayShorts[date.getDay()];
      const code = daily.weather_code[i];
      const info = getWeatherInfo(code);
      const maxT = formatTemp(daily.temperature_2m_max[i]);
      const minT = formatTemp(daily.temperature_2m_min[i]);

      const isSelected = i === state.selectedDayIndex;

      const card = document.createElement('div');
      // Responsive flex-shrink on mobile for horizontal swiping, grid cell on sm+
      card.className = isSelected
        ? 'flex-shrink-0 min-w-[95px] sm:min-w-0 bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] ring-2 ring-primary dark:ring-primary-container border border-transparent dark:border-slate-700 cursor-pointer transition-all scale-[1.02]'
        : 'flex-shrink-0 min-w-[95px] sm:min-w-0 bg-surface-container-lowest dark:bg-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-transparent dark:border-slate-700/50 hover:dark:bg-slate-800 transition-all cursor-pointer group';

      card.innerHTML = `
        <span class="font-body-sm text-body-sm ${isSelected ? 'font-bold text-on-surface dark:text-white' : 'font-semibold text-outline dark:text-slate-400 group-hover:text-on-surface dark:group-hover:text-white transition-colors'}">${dayLabel}</span>
        <div class="my-3 w-10 h-10 rounded-full flex items-center justify-center ${info.isRain ? 'bg-primary-container/15 text-primary dark:bg-primary-container/30 dark:text-primary-fixed' : 'bg-amber-100 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400'}">
          <span class="material-symbols-outlined text-[24px]">${info.icon}</span>
        </div>
        <div class="flex items-center gap-1.5 font-label-sm text-label-sm">
          <span class="font-semibold text-on-surface dark:text-white">${maxT}°</span>
          <span class="text-outline dark:text-slate-400">${minT}°</span>
        </div>
      `;

      card.addEventListener('click', () => {
        state.selectedDayIndex = i;
        renderForecastStrip();
        renderHourlyHorizon();
      });

      strip.appendChild(card);
    }
  }

  // Render Hourly Forecast Horizon
  function renderHourlyHorizon() {
    const drawer = document.getElementById('hourly-drawer');
    if (!drawer || !state.weatherData || !state.weatherData.hourly) return;

    const hourly = state.weatherData.hourly;
    drawer.innerHTML = '';

    const startIndex = state.selectedDayIndex * 24 + (state.selectedDayIndex === 0 ? new Date().getHours() : 6);
    const count = 6;

    for (let i = startIndex; i < startIndex + count && i < hourly.time.length; i++) {
      const date = new Date(hourly.time[i]);
      const hourStr = `${String(date.getHours()).padStart(2, '0')}:00`;
      const code = hourly.weather_code[i];
      const info = getWeatherInfo(code);
      const temp = formatTemp(hourly.temperature_2m[i]);
      const precip = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

      const slot = document.createElement('div');
      slot.className = 'flex-shrink-0 min-w-[85px] sm:min-w-0 flex flex-col items-center py-2.5 px-2 rounded-xl bg-surface-container-low dark:bg-slate-800/90 text-center shadow-sm border border-transparent dark:border-slate-700/50';
      slot.innerHTML = `
        <span class="font-label-xs text-label-xs text-outline dark:text-slate-400 font-medium">${hourStr}</span>
        <span class="material-symbols-outlined text-[22px] my-1 ${info.isRain ? 'text-primary dark:text-primary-fixed' : 'text-amber-500 dark:text-amber-400'}">${info.icon}</span>
        <span class="font-label-sm text-label-sm font-bold text-on-surface dark:text-white">${temp}°</span>
        <span class="text-[11px] text-outline dark:text-slate-400 mt-0.5">${precip}% rain</span>
      `;
      drawer.appendChild(slot);
    }
  }

  // Unit Toggle (°C / °F)
  function initUnitToggle() {
    const unitC = document.getElementById('unit-c');
    const unitF = document.getElementById('unit-f');

    function setUnits(celsius) {
      state.isCelsius = celsius;
      if (unitC && unitF) {
        if (celsius) {
          unitC.className = "w-8 h-8 rounded-full bg-inverse-surface dark:bg-slate-700 text-white font-label-xs text-label-xs font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer";
          unitF.className = "w-8 h-8 rounded-full text-on-surface-variant hover:text-on-surface dark:text-slate-400 dark:hover:text-white font-label-xs text-label-xs font-semibold flex items-center justify-center transition-all cursor-pointer";
        } else {
          unitF.className = "w-8 h-8 rounded-full bg-inverse-surface dark:bg-slate-700 text-white font-label-xs text-label-xs font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer";
          unitC.className = "w-8 h-8 rounded-full text-on-surface-variant hover:text-on-surface dark:text-slate-400 dark:hover:text-white font-label-xs text-label-xs font-semibold flex items-center justify-center transition-all cursor-pointer";
        }
      }
      updateUI();
    }

    if (unitC && unitF) {
      unitC.addEventListener('click', () => setUnits(true));
      unitF.addEventListener('click', () => setUnits(false));
    }
  }

  // Today vs Week Tabs Action (Rounded Rectangle Segmented Control)
  function initPeriodTabs() {
    const tabToday = document.getElementById('tab-today');
    const tabWeek = document.getElementById('tab-week');
    const hourlyDrawer = document.getElementById('hourly-drawer');
    const hourlyToggle = document.getElementById('hourly-toggle');
    const hourlyChevron = document.getElementById('hourly-chevron');

    const activeClasses = 'forecast-tab px-4 sm:px-5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 bg-surface-container-lowest dark:bg-slate-700 text-on-surface dark:text-white shadow-sm cursor-pointer';
    const inactiveClasses = 'forecast-tab px-4 sm:px-5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 text-outline hover:text-on-surface dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer';

    if (tabToday && tabWeek) {
      tabToday.addEventListener('click', () => {
        state.activeTab = 'today';
        state.selectedDayIndex = 0;
        tabToday.className = activeClasses;
        tabToday.textContent = 'Today';
        tabWeek.className = inactiveClasses;
        tabWeek.textContent = 'Week';

        // Automatically expand the hourly drawer for today
        if (hourlyDrawer) {
          hourlyDrawer.classList.remove('hidden');
          if (hourlyChevron) hourlyChevron.textContent = 'expand_less';
          if (hourlyToggle) hourlyToggle.querySelector('span').textContent = 'Collapse Timeline';
        }
        renderForecastStrip();
        renderHourlyHorizon();
      });

      tabWeek.addEventListener('click', () => {
        state.activeTab = 'week';
        tabWeek.className = activeClasses;
        tabWeek.textContent = 'Week';
        tabToday.className = inactiveClasses;
        tabToday.textContent = 'Today';
        renderForecastStrip();
      });
    }
  }

  // Geocoding Search with Autocomplete
  function initSearch() {
    const input = document.getElementById('city-search-input');
    if (!input) return;

    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'search-dropdown';
      dropdown.className = 'absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-surface-container-high overflow-hidden hidden z-50 max-h-60 overflow-y-auto';
      input.parentElement.appendChild(dropdown);
    }

    let debounceTimer;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);
      if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
          if (!res.ok) return;
          const data = await res.json();

          if (!data.results || data.results.length === 0) {
            dropdown.innerHTML = `<div class="p-3 text-sm text-outline text-center">No locations found</div>`;
            dropdown.classList.remove('hidden');
            return;
          }

          dropdown.innerHTML = '';
          data.results.forEach(item => {
            const row = document.createElement('div');
            row.className = 'px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center justify-between border-b border-surface-container-high/50 last:border-0 transition-colors';
            
            const region = [item.admin1, item.country].filter(Boolean).join(', ');
            row.innerHTML = `
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-outline text-[18px]">location_on</span>
                <div>
                  <div class="font-semibold text-sm text-on-surface">${item.name}</div>
                  <div class="text-xs text-outline">${region}</div>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">${item.country_code || ''}</span>
            `;

            row.addEventListener('click', () => {
              dropdown.classList.add('hidden');
              const fullTitle = `${item.name}${region ? ', ' + region : ''}`;
              fetchWeatherData(item.latitude, item.longitude, fullTitle);
            });

            dropdown.appendChild(row);
          });

          dropdown.classList.remove('hidden');
        } catch (err) {
          console.error(err);
        }
      }, 250);
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        dropdown.classList.add('hidden');
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const item = data.results[0];
            const region = [item.admin1, item.country].filter(Boolean).join(', ');
            fetchWeatherData(item.latitude, item.longitude, `${item.name}, ${region}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  // Geolocation Button (Real GPS)
  function initGeolocation() {
    const btnGeolocate = document.getElementById('btn-geolocate');
    if (!btnGeolocate) return;

    btnGeolocate.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.');
        return;
      }

      btnGeolocate.classList.add('animate-spin');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          btnGeolocate.classList.remove('animate-spin');
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          let cityName = `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
          try {
            const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (revRes.ok) {
              const revData = await revRes.json();
              cityName = [revData.city || revData.locality, revData.principalSubdivision, revData.countryName].filter(Boolean).join(', ');
            }
          } catch (e) {
            console.warn('Reverse geocode failed', e);
          }

          fetchWeatherData(lat, lon, cityName);
        },
        (err) => {
          btnGeolocate.classList.remove('animate-spin');
          console.warn('Geolocation denied or failed:', err);
          showToast('Could not retrieve GPS location. Search for a city above.');
        },
        { timeout: 10000 }
      );
    });
  }

  // Notifications Popover
  function initNotifications() {
    const btn = document.getElementById('btn-notifications');
    const dropdown = document.getElementById('notifications-dropdown');
    if (btn && dropdown) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
          dropdown.classList.add('hidden');
        }
      });
    }
  }

  function showLoading(isLoading) {
    const heroTemp = document.getElementById('hero-temp-val');
    if (heroTemp && isLoading) {
      heroTemp.classList.add('opacity-40');
    } else if (heroTemp) {
      heroTemp.classList.remove('opacity-40');
    }
  }

  function showToast(message) {
    let toast = document.getElementById('weather-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'weather-toast';
      toast.className = 'fixed bottom-6 right-6 bg-on-surface text-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold z-50 transition-opacity duration-300 opacity-0 pointer-events-none';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3500);
  }


  // Dark / Light Theme Toggle Controller
  function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-toggle-icon');

    function updateThemeUI() {
      const isDark = document.documentElement.classList.contains('dark');
      if (icon) {
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        icon.className = isDark
          ? 'material-symbols-outlined text-[20px] text-amber-400 transition-transform duration-300'
          : 'material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-300';
      }
    }

    if (toggleBtn) {
      updateThemeUI();
      toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('aura_theme', isDark ? 'dark' : 'light');
        updateThemeUI();
        renderForecastStrip();
        renderHourlyHorizon();
      });
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initUnitToggle();
    initPeriodTabs();
    initSearch();
    initGeolocation();
    initNotifications();

    // Default load London
    fetchWeatherData(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.name);
  });
})();
