# CHANGELOG

## 0.4.1 (2026-04-15)

### Added

### Changed

- Fixed Load Recent button not loading saved settings
- Change import file to accept new lua app json pattern

### Removed


## 0.4.0 (2026-04-15)

### Added

- **Multi-Driver BoP Support**: Refactored data mapping to support multiple drivers using the same car model.
- **ID-Based Precision Mapping**: Integrated `acCarId` tracking to perfectly map `race.ini` ballast/restrictors to specific session instances.
- **Load Recent Session**: Added "Load Recent" button to allow manual restoration of previously imported data.
- **Result Sorting**: Added dropdown to sort BoP results by Pace or Car Name (A-Z/Z-A).
- **Independent Result Scrolling**: The Results panel is now sticky and internally scrollable, improving navigation with large car lists.
- **Auto-Settings Detection**: The tool now triggers auto-detection of `Sec/10kg` and `Sec/1% Restr` immediately after mapping `race.ini` files.

### Changed

- Updated default Max Ballast limit from 50kg to 100kg.
- Improved UI consistency for all import/action buttons.
- Fixed visibility issues for native browser dropdowns in dark mode by applying `color-scheme: dark`.
- Changed BoP Calculator to start with an empty list for a cleaner initial state.

### Removed


## 0.3.0 (2026-03-19)

### Added

- Add Car Setup Guide — interactive race engineer tool for all sims
  - 9 handling problems (understeer, oversteer, poor turn-in, low traction, braking instability, high-speed instability, bouncing, excessive body roll, tyre wear)
  - 3 corner phases (entry, mid, exit) with animated SVG corner diagram
  - Ranked setup recommendations sorted by impact (high/medium/low)
  - Setup Parameter Reference accordion with 16 parameters
  - Ride Height & Rake Guide with optimal values per car class (GT3, GT4, Formula, Road)
  - Step-by-step rake tuning guide and pro tips

### Changed

### Removed


## 0.2.1 (2026-03-11)

### Added

### Changed

- Update BOP Calculator's auto-detect seconds per 1% restrictor to only use pairs where ballast differs but restrictor stays the same

### Removed

## 0.2.0 (2026-03-11)

### Added

- Add auto-detect seconds per 1% restrictor to BOP Calculator

### Changed

- Update BOP Calculator's input box to input `0` as a first digit of milliseconds 

### Removed

## 0.1.2 (2026-03-11)

### Added

- Add BOP Calculator
- Add prettier

### Changed

### Removed

## 0.1.1 (2026-03-10)

### Added

### Changed

- Update simulated time calculator input field to allow delete all value
- Update simulated time calculator fixed value to change from `1, 6, 12, ..., 60` to `1, 5, 10, ..., 60`

### Removed

## 0.1.0 (2026-03-07)

### Added

- Initial release
- AMS2 Calculator

### Changed

### Removed
