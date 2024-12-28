import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { VisibleRangePlugin } from "@photo-sphere-viewer/visible-range-plugin";

class Panorama {
  floorControls = [];

  constructor(opts = {}) {
    this.container = opts.container ?? document.querySelector("#viewer");
    this.floors =
      opts.floors ?? JSON.parse(this.container.getAttribute("data-json"));
    this.currentFloor = this.floors[opts.initialFloor ?? 0];
    this.captionFloorContainer =
      opts.captionFloorContainer ??
      this.container.querySelector("#caption-floor");
    this.captionFloorHeightContainer =
      opts.captionFloorHeightContainer ??
      this.container.querySelector("#caption-floor-height");
    this.baseUrl = opts.baseUrl ?? "./assets/low";
    this.tilesUrl = opts.tilesUrl ?? "./assets/tiles";
    this.assetsExtension = opts.assetsExtension ?? "webp";
    this.loadingMessage = opts.loadingMessage ?? "Загрузка...";
    this.loadErrorMessage = opts.loadErrorMessage ?? "Панорама не найдена.";
    this.floorControlsContainer =
      opts.floorControlsContainer ??
      this.container.querySelector("#floors-container");
    this.controls =
      opts.controls ??
      this.container.querySelectorAll("[data-panorama-control]");

    this.init();
  }

  init() {
    this.viewer = new Viewer({
      plugins: [
        [
          VisibleRangePlugin,
          {
            verticalRange: [-Math.PI / 5, Math.PI / 5],
          },
        ],
      ],
      navbar: false,
      container: this.container,
      adapter: EquirectangularTilesAdapter,
      panorama: {
        width: 8192,
        cols: 16,
        rows: 8,
        baseUrl: `${this.baseUrl}/${this.currentFloor.value}/${this.currentFloor.value}.${this.assetsExtension}`,
        tileUrl: (col, row) => {
          return `${this.tilesUrl}/${this.currentFloor.value}/${this.currentFloor.value}_${col}_${row}.${this.assetsExtension}`;
        },
      },
      lang: {
        loading: this.loadingMessage,
        loadError: this.loadErrorMessage,
      },
    });

    this.renderFloorControls();
    this.renderCaption();
    this.bindEvents();
  }

  renderFloorControls() {
    this.floorControls = [];
    this.floorControlsContainer.replaceChildren();

    this.floors
      .sort((a, b) => b.value - a.value)
      .forEach((floor) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-set-floor", String(floor.value));
        button.setAttribute("data-panorama-control", "");
        button.setAttribute(
          "aria-current",
          floor.value == this.currentFloor.value
        );
        button.textContent = floor.value + " этаж";
        this.floorControls.push(button);

        this.floorControlsContainer.append(button);
      });
  }

  renderCaption() {
    this.captionFloorContainer.textContent = this.currentFloor.value + " этаж";
    this.captionFloorHeightContainer.textContent = this.currentFloor.height;
  }

  setFloor(value) {
    this.currentFloor = this.floors.find((floor) => floor.value == value);

    this.floorControls.forEach((button) => {
      button.setAttribute("aria-current", "false");
    });

    this.floorControls
      .find((button) => button.getAttribute("data-set-floor") === value)
      .setAttribute("aria-current", "true");

    this.updateViewer();
    this.renderCaption();
  }

  setLoading(value) {
    [...this.controls, ...this.floorControls].forEach((control) => {
      if (value) {
        control.setAttribute("disabled", "");
        control.setAttribute("aria-disabled", "true");
      } else {
        control.removeAttribute("disabled");
        control.setAttribute("aria-disabled", "false");
      }
    });
  }

  updateViewer() {
    this.setLoading(true);
    this.viewer
      .setPanorama({
        width: 8192,
        cols: 16,
        rows: 8,
        baseUrl: `./assets/low/${this.currentFloor.value}/${this.currentFloor.value}.${this.assetsExtension}`,
        tileUrl: (col, row) => {
          return `./assets/tiles/${this.currentFloor.value}/${this.currentFloor.value}_${col}_${row}.${this.assetsExtension}`;
        },
      })
      .finally(() => {
        this.setLoading(false);
      });
  }

  bindEvents() {
    this.container.addEventListener("click", (event) => {
      const target = event.target;
      const setFloorTrigger = target.closest("[data-set-floor]");
      if (setFloorTrigger) {
        const floor = setFloorTrigger.getAttribute("data-set-floor");
        if (this.currentFloor.value != floor) this.setFloor(floor);
      }
    });
  }
}

new Panorama();

// let currentFloor = DATA[1];

// const viewer = new Viewer({
//   plugins: [
//     [
//       VisibleRangePlugin,
//       {
//         verticalRange: [-Math.PI / 5, Math.PI / 5],
//       },
//     ],
//   ],
//   navbar: false,
//   container: document.querySelector("#viewer"),
//   adapter: EquirectangularTilesAdapter,
//   panorama: {
//     width: 8192,
//     cols: 16,
//     rows: 8,
//     baseUrl: `./assets/low/${currentFloor.value}.webp`,
//     tileUrl: (col, row) => {
//       return `./assets/tiles/${currentFloor.value}_${col}_${row}.webp`;
//     },
//   },
//   lang: {
//     loading: "Загрузка...",
//     loadError: "Панорама не найдена.",
//   },
// });

// // const floorsContainer = document.getElementById("floors-container");

// function setLoadingState(value) {
//   document
//     .querySelectorAll("[data-panorama-control]")
//     .forEach((control) => (control.disabled = value));
// }

// // function setCurrentTower(tower) {
// //   currentTower = tower;

// //   document
// //     .querySelectorAll("[data-set-tower]")
// //     .forEach((button) => (button.ariaCurrent = false));

// //   document.querySelector(`[data-set-tower='${tower}']`).ariaCurrent = true;
// // }

// function setCurrentFloor(floor) {
//   currentFloor = floor;

//   document
//     .querySelectorAll("[data-set-floor]")
//     .forEach((button) => (button.ariaCurrent = false));

//   document.querySelector(
//     `[data-set-floor='${floor.value}']`
//   ).ariaCurrent = true;
// }

// function setCaption(floor) {
//   document.getElementById("caption-floor").textContent = floor.value + " этаж";
//   document.getElementById("caption-floor-height").textContent = floor.height;
// }

// // function renderFloors(tower) {
// //   floorsContainer.replaceChildren();

// //   DATA[tower]
// //     .sort((a, b) => b.value - a.value)
// //     .forEach((floor) => {
// //       const button = document.createElement("button");
// //       button.type = "button";
// //       button.dataset.setFloor = floor.value;
// //       button.dataset.panoramaControl = "";
// //       button.textContent = floor.value + " этаж";

// //       floorsContainer.append(button);
// //     });
// // }

// // renderFloors(currentTower);
// // setCurrentTower(currentTower);
// // setCurrentFloor(currentFloor);
// setCaption(currentFloor);

// // function setTowerHandler(tower) {
// //   const floor = DATA[tower][1];

// //   setLoadingState(true);

// //   viewer
// //     .setPanorama({
// //       width: 8192,
// //       cols: 16,
// //       rows: 8,
// //       baseUrl: `./assets/low/${tower}/${floor.value}.webp`,
// //       tileUrl: (col, row) => {
// //         return `./assets/tiles/${tower}/${floor.value}_${col}_${row}.webp`;
// //       },
// //     })
// //     .then(() => {
// //       // renderFloors(tower);
// //       // setCurrentFloor(floor);
// //       setCaption(floor);
// //     })
// //     .finally(() => {
// //       setLoadingState(false);
// //     });

// //   setCurrentTower(tower);
// // }

// function setFloorHandler(floor) {
//   setLoadingState(true);
//   viewer
//     .setPanorama({
//       width: 8192,
//       cols: 16,
//       rows: 8,
//       baseUrl: `./assets/low/${currentTower}/${floor.value}.jpg`,
//       tileUrl: (col, row) => {
//         return `./assets/tiles/${currentTower}/${floor.value}_${col}_${row}.jpg`;
//       },
//     })
//     .finally(() => {
//       setLoadingState(false);
//     });

//   setCurrentFloor(floor);
//   setCaption(floor);
// }

// document.addEventListener("click", (event) => {
//   // const setTowerButton = event.target.closest("[data-set-tower]");
//   const setFloorButton = event.target.closest("[data-set-floor]");
//   const fullscreenButton = event.target.closest("#fullscreen");
//   const zoomInButton = event.target.closest("#zoom-in");
//   const zoomOutButton = event.target.closest("#zoom-out");

//   // if (setTowerButton) setTowerHandler(setTowerButton.dataset.setTower);
//   if (setFloorButton) setFloorHandler(setFloorButton.dataset.setFloor);
//   if (fullscreenButton) viewer.toggleFullscreen();
//   if (zoomInButton) viewer.zoomIn(50);
//   if (zoomOutButton) viewer.zoomOut(50);
// });
