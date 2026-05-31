const hyundaiLocations = [
  {
    name: "리바트 본사",
    address: "서울특별시 강남구 압구정로 165 금강쇼핑센터",
    fallback: { lat: 37.525144, lng: 127.027705 },
    img: "../static/img/hyundai-logo/livart.webp",
    homepage: "https://www.hyundailivart.co.kr",
  },
  {
    name: "현대홈쇼핑 본사",
    address: "서울특별시 강동구 올림픽로70길 34",
    fallback: { lat: 37.540393, lng: 127.123628 },
    img: "../static/img/hyundai-logo/homeshopping.webp",
    homepage: "https://www.hmall.com",
  },
  {
    name: "그린푸드",
    address: "경기도 용인시 수지구 문인로 30",
    fallback: { lat: 37.332508, lng: 127.100742 },
    img: "../static/img/hyundai-logo/greenfood.webp",
    homepage: "https://www.hyundaigreenfood.com",
  },
  {
    name: "한섬",
    address: "서울특별시 강동구 성내동 448-3",
    fallback: { lat: 37.530454, lng: 127.130964 },
    img: "../static/img/hyundai-logo/handsome.webp",
    homepage: "https://www.thehandsome.com",
  },
  {
    name: "현대면세점 본사",
    address: "서울특별시 강남구 영동대로82길 19",
    fallback: { lat: 37.505614, lng: 127.063153 },
    img: "../static/img/hyundai-logo/duty-free.webp",
    homepage: "https://www.hddfs.com",
  },
];

const mapFocusLevel = 2;
const locationToggleBar = document.getElementById("locationToggleBar");
const mapContainer = document.getElementById("map");

let selectLocation = focusFallbackLocation;
let showAllLocations = showFallbackAllLocations;
let sortedLocationIndexes = hyundaiLocations.map((_, index) => index);

function createLocationPin(location, index) {
  return `
    <article
      class="location-pin"
      data-location-pin-index="${index}"
      aria-label="${location.name}"
      role="button"
      tabindex="0"
    >
      <span class="location-pin-avatar">
        <img src="${location.img}" alt="" />
      </span>
    </article>
  `;
}

function createUserLocationPin() {
  return `
    <article class="location-user-pin" aria-label="현재 위치">
      <span>현재 위치</span>
    </article>
  `;
}

function createRouteDistanceLabel(distanceText) {
  return `
    <article class="location-route-distance" aria-label="예상 거리 ${distanceText}">
      ${distanceText}
    </article>
  `;
}

function createLocationInfoOverlay(location) {
  return `
    <article class="location-info-overlay" aria-label="${location.name} 상세 정보">
      <strong>${location.name}</strong>
      <address>${location.address}</address>
      ${
        location.distanceText
          ? `<small>현재 위치에서 ${location.distanceText}</small>`
          : ""
      }
      ${
        location.homepage
          ? `
            <a
              class="location-homepage-link"
              href="${location.homepage}"
              target="_blank"
              rel="noopener noreferrer"
            >
              홈페이지 바로가기
            </a>
          `
          : ""
      }
    </article>
  `;
}

function formatDistance(distanceMeter) {
  if (distanceMeter >= 1000) {
    return `${(distanceMeter / 1000).toFixed(1)}km`;
  }

  return `${Math.round(distanceMeter)}m`;
}

function setActiveLocation(index) {
  locationToggleBar
    .querySelectorAll("[data-location-index]")
    .forEach((button) => {
      const isActive = Number(button.dataset.locationIndex) === index;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

  const allButton = locationToggleBar.querySelector("[data-location-all]");
  allButton?.classList.remove("active");
  allButton?.setAttribute("aria-pressed", "false");
}

function setAllLocationActive() {
  locationToggleBar
    .querySelectorAll("[data-location-index]")
    .forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });

  const allButton = locationToggleBar.querySelector("[data-location-all]");
  allButton?.classList.add("active");
  allButton?.setAttribute("aria-pressed", "true");
}

function renderLocationControls() {
  const allButton = `
    <button
      type="button"
      class="location-toggle-button location-toggle-all-button"
      data-location-all
      aria-pressed="false"
    >
      <span>전체 보기</span>
    </button>
  `;

  const locationButtons = sortedLocationIndexes
    .map((index) => {
      const location = hyundaiLocations[index];

      return `
        <button
          type="button"
          class="location-toggle-button"
          data-location-index="${index}"
          aria-pressed="false"
        >
          <img src="${location.img}" alt="" />
          <span>${location.name}</span>
          ${
            location.distanceText
              ? `<small class="location-distance">${location.distanceText}</small>`
              : ""
          }
        </button>
      `;
    })
    .join("");

  locationToggleBar.innerHTML = allButton + locationButtons;
}

function bindLocationControls() {
  locationToggleBar.addEventListener("click", function (event) {
    const allButton = event.target.closest("[data-location-all]");

    if (allButton) {
      showAllLocations();
      return;
    }

    const button = event.target.closest("[data-location-index]");

    if (!button) {
      return;
    }

    selectLocation(Number(button.dataset.locationIndex), {
      shouldZoom: false,
    });
  });
}

function focusFallbackLocation(index) {
  const card = document.querySelector(`[data-location-card="${index}"]`);

  if (!card) {
    return;
  }

  setActiveLocation(index);

  card.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
}

function showFallbackAllLocations() {
  setAllLocationActive();

  const firstCard = document.querySelector(".location-fallback-card");

  if (!firstCard) {
    return;
  }

  firstCard.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
}

function showMapFallback() {
  mapContainer.classList.add("location-map-fallback-mode");

  const fallbackCards = sortedLocationIndexes
    .map((index) => {
      const location = hyundaiLocations[index];

      return `
        <article class="location-fallback-card" data-location-card="${index}">
          ${createLocationPin(location, index)}
          <address>${location.address}</address>
          ${
            location.distanceText
              ? `<small class="location-distance">${location.distanceText}</small>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  mapContainer.innerHTML = `
    <section class="location-fallback-pin-list" aria-label="Location pin list">
      ${fallbackCards}
    </section>
  `;
}

function initFallbackMode() {
  renderLocationControls();
  bindLocationControls();
  showMapFallback();
}

function initKakaoMap() {
  kakao.maps.load(function () {
    mapContainer.classList.remove("location-map-fallback-mode");

    const mapOption = {
      center: new kakao.maps.LatLng(37.4979, 127.0276),
      level: 9,
    };

    const map = new kakao.maps.Map(mapContainer, mapOption);
    const geocoder = new kakao.maps.services.Geocoder();
    const bounds = new kakao.maps.LatLngBounds();

    const overlays = [];
    const locationTargets = new Map();

    let userOverlay = null;
    let userLatLngCache = null;
    let routeLine = null;
    let routeDistanceOverlay = null;
    let locationInfoOverlay = null;
    let resolvedCount = 0;

    function getFallbackLatLng(location) {
      return new kakao.maps.LatLng(
        location.fallback.lat,
        location.fallback.lng,
      );
    }

    function getDistanceMeter(latlngA, latlngB) {
      const earthRadius = 6371000;

      const lat1 = (latlngA.getLat() * Math.PI) / 180;
      const lat2 = (latlngB.getLat() * Math.PI) / 180;
      const deltaLat = ((latlngB.getLat() - latlngA.getLat()) * Math.PI) / 180;
      const deltaLng = ((latlngB.getLng() - latlngA.getLng()) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLng / 2) *
          Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadius * c;
    }

    function getMiddleLatLng(latlngA, latlngB) {
      const middleLat = (latlngA.getLat() + latlngB.getLat()) / 2;
      const middleLng = (latlngA.getLng() + latlngB.getLng()) / 2;

      return new kakao.maps.LatLng(middleLat, middleLng);
    }

    function addLocationOverlay(location, latlng, index) {
      const overlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: createLocationPin(location, index),
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 10,
      });

      overlay.setMap(map);
      overlays.push(overlay);
      locationTargets.set(index, { latlng, overlay });
      bounds.extend(latlng);
    }

    function addUserLocationOverlay(userLatLng) {
      if (userOverlay) {
        userOverlay.setMap(null);
      }

      userOverlay = new kakao.maps.CustomOverlay({
        position: userLatLng,
        content: createUserLocationPin(),
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 40,
      });

      userOverlay.setMap(map);
      bounds.extend(userLatLng);
    }

    function clearRoute() {
      if (routeLine) {
        routeLine.setMap(null);
        routeLine = null;
      }

      if (routeDistanceOverlay) {
        routeDistanceOverlay.setMap(null);
        routeDistanceOverlay = null;
      }
    }

    function drawRouteLine(userLatLng, targetLatLng) {
      clearRoute();

      const distanceMeter = getDistanceMeter(userLatLng, targetLatLng);
      const distanceText = formatDistance(distanceMeter);
      const middleLatLng = getMiddleLatLng(userLatLng, targetLatLng);

      routeLine = new kakao.maps.Polyline({
        path: [userLatLng, targetLatLng],
        strokeWeight: 4,
        strokeColor: "#009C7D",
        strokeOpacity: 0.9,
        strokeStyle: "shortdash",
      });

      routeDistanceOverlay = new kakao.maps.CustomOverlay({
        position: middleLatLng,
        content: createRouteDistanceLabel(distanceText),
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 50,
      });

      routeLine.setMap(map);
      routeDistanceOverlay.setMap(map);
    }

    function showLocationInfoOverlay(location, latlng) {
      if (locationInfoOverlay) {
        locationInfoOverlay.setMap(null);
      }

      locationInfoOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: createLocationInfoOverlay(location),
        xAnchor: 0.5,
        yAnchor: 1.25,
        zIndex: 60,
      });

      locationInfoOverlay.setMap(map);
    }

    function hideLocationInfoOverlay() {
      if (locationInfoOverlay) {
        locationInfoOverlay.setMap(null);
        locationInfoOverlay = null;
      }
    }

    function fitMapBounds() {
      if (!overlays.length) {
        return;
      }

      map.setBounds(bounds);
    }

    function fitRouteBounds(userLatLng, targetLatLng) {
      const routeBounds = new kakao.maps.LatLngBounds();

      routeBounds.extend(userLatLng);
      routeBounds.extend(targetLatLng);

      map.setBounds(routeBounds, 80, 80, 80, 80);
    }

    function fitAllLocationBounds() {
      const allBounds = new kakao.maps.LatLngBounds();

      if (userLatLngCache) {
        allBounds.extend(userLatLngCache);
      }

      locationTargets.forEach((target) => {
        allBounds.extend(target.latlng);
      });

      clearRoute();
      hideLocationInfoOverlay();
      setAllLocationActive();
      map.setBounds(allBounds, 70, 70, 70, 70);
    }

    function focusMapLocation(index, options = {}) {
      const { shouldZoom = false, shouldShowInfo = false } = options;

      const location = hyundaiLocations[index];
      const target = locationTargets.get(index) || {
        latlng: getFallbackLatLng(location),
      };

      setActiveLocation(index);

      overlays.forEach((overlay) => overlay.setZIndex(10));

      if (target.overlay) {
        target.overlay.setZIndex(30);
      }

      if (shouldShowInfo) {
        showLocationInfoOverlay(location, target.latlng);
      } else {
        hideLocationInfoOverlay();
      }

      if (userLatLngCache) {
        drawRouteLine(userLatLngCache, target.latlng);

        if (shouldZoom) {
          map.setLevel(mapFocusLevel, { animate: true });
          map.panTo(target.latlng);
          return;
        }

        fitRouteBounds(userLatLngCache, target.latlng);
        return;
      }

      if (shouldZoom) {
        map.setLevel(mapFocusLevel, { animate: true });
      }

      map.panTo(target.latlng);
    }

    function updateDistanceFromUser(userLatLng) {
      const sortedTargets = Array.from(locationTargets.entries())
        .map(([index, target]) => {
          const distanceMeter = getDistanceMeter(userLatLng, target.latlng);

          hyundaiLocations[index].distanceMeter = distanceMeter;
          hyundaiLocations[index].distanceText = formatDistance(distanceMeter);

          return {
            index,
            distanceMeter,
          };
        })
        .sort((a, b) => a.distanceMeter - b.distanceMeter);

      sortedLocationIndexes = sortedTargets.map((target) => target.index);

      renderLocationControls();

      return sortedTargets;
    }

    function requestUserLocation() {
      if (!navigator.geolocation) {
        fitMapBounds();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          const userLatLng = new kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
          );

          userLatLngCache = userLatLng;

          addUserLocationOverlay(userLatLng);

          const sortedTargets = updateDistanceFromUser(userLatLng);

          if (sortedTargets.length) {
            focusMapLocation(sortedTargets[0].index, {
              shouldZoom: false,
            });
          } else {
            fitMapBounds();
          }
        },
        function () {
          fitMapBounds();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        },
      );
    }

    function resolveLocation(location, index) {
      geocoder.addressSearch(location.address, function (result, status) {
        const latlng =
          status === kakao.maps.services.Status.OK && result[0]
            ? new kakao.maps.LatLng(result[0].y, result[0].x)
            : getFallbackLatLng(location);

        addLocationOverlay(location, latlng, index);
        resolvedCount += 1;

        if (resolvedCount === hyundaiLocations.length) {
          requestUserLocation();
        }
      });
    }

    function bindMapPinEvents() {
      mapContainer.addEventListener("click", function (event) {
        const pin = event.target.closest("[data-location-pin-index]");

        if (!pin) {
          return;
        }

        focusMapLocation(Number(pin.dataset.locationPinIndex), {
          shouldZoom: true,
          shouldShowInfo: true,
        });
      });

      mapContainer.addEventListener("keydown", function (event) {
        const pin = event.target.closest("[data-location-pin-index]");

        if (!pin || (event.key !== "Enter" && event.key !== " ")) {
          return;
        }

        event.preventDefault();

        focusMapLocation(Number(pin.dataset.locationPinIndex), {
          shouldZoom: true,
          shouldShowInfo: true,
        });
      });
    }

    function syncMapLayout() {
      map.relayout();

      if (!hyundaiLocations.some((location) => location.distanceMeter)) {
        fitMapBounds();
      }
    }

    selectLocation = focusMapLocation;
    showAllLocations = fitAllLocationBounds;

    renderLocationControls();
    bindLocationControls();
    bindMapPinEvents();

    hyundaiLocations.forEach(resolveLocation);

    setTimeout(syncMapLayout, 300);
    window.addEventListener("resize", syncMapLayout);

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(syncMapLayout);
      resizeObserver.observe(mapContainer);
    }
  });
}

if (!locationToggleBar || !mapContainer) {
  throw new Error("Location page required elements are missing.");
}

if (!window.kakao || !kakao.maps) {
  initFallbackMode();
} else {
  initKakaoMap();
}
