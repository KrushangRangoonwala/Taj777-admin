# Proposed Modifications for EventPage.jsx

Below is the list of modifications found in `rough/index.js` that should be applied to `src/pages/game/EventPage.jsx`. Please comment on each item or let me know which ones to proceed with.

---

## 1. Structural & Logic Refactoring
- [ ] **Data Processing Helpers**: 
    - Implement `processMainMarketData(rawData)` and `processOtherMarketData(rawData)` to extract Match Odds, Tied Match, and other markets separately.
    - This replaces manual filtering inside `useEffect`.
- [ ] **Exposure Logic**: 
    - Use the updated `getExposureByMarketId` and the new `getExposureCss` helper for consistent color styling of exposure values.
    - Removes hardcoded style logic in multiple places.
- [ ] **Suspension Handling**: 
    - Adopt more robust suspended status checks (`getSuspendedStatus` and `getSuspendedStatusForBm1`).
    - Logic for checking 0 price values to determine suspension.

## 2. New Features & State
- [ ] **Live Score Integration**: 
    - Add state (`liveScoreData`) and `useEffect` listener for `liveScore` via socket.
    - Display `LiveScoreCard` in the banner area for cricket.
- [ ] **TV & Scorecard Toggle**: 
    - Add state (`isTvOn`, `scoreCardOrTv`).
    - Add UI icons in the header to switch between TV stream and Scorecard.
- [ ] **Run Amount Logic**: 
    - Add `getRunAmountApi` function to fetch run-wise exposure.
    - Add `runAmountModal` state to display the table.
- [ ] **League Support**: 
    - Add logic to detect leagues (`isLeague`) and generate shorter league names (`leagueName`) based on initials.

## 3. Component Enhancements
- [ ] **`Double_Column_Section` Updates**:
    - Add `isRunAmountEnable` prop: enables clicking on runner names to open the Run Amount modal.
    - Add `isPassLayPara` prop: for specific fancy bet types.
    - Add `Remark` display: Show the `item.Remark` text below each runner row.
- [ ] **`Bookmaker` & `Single_Column_Section` Updates**:
    - Add `isCashout` prop support (displays a Cashout badge).
    - Implement `isWholeSuspended` check: Dims the entire market table if all runners satisfy the suspension criteria.
- [ ] **Blinking Animations**: 
    - Update `Boxes_2` and `Boxes_6` logic using `prevSocketData` ref to track price changes and apply `green`/`red` blink classes.

## 4. UI & Layout Updates
- [ ] **Responsive Header**: 
    - Update the `game-header` to use sport-specific background colors (via `bgColor` helper).
    - Add date and TV icons to the mobile header layout.
- [ ] **Banner Section**: 
    - Implement conditional rendering for `LiveScoreCard`, `SafeIframe` (Scorecard), or TV stream based on the current selection.
- [ ] **Run Amount Table & Footer**: 
    - Add the `Modal_wrapper` and `RunAmountTableCss` for the Run Amount feature.
    - Add the `Footer` component at the bottom.
