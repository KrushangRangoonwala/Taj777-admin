- Last Result Text and Color
- casino video icons : home, info, lastresult (is there or not?)
- casinoVideo Info icon : Rules Modal
- <LastResult /> component in every game's mobile view

- Min-Max Info icon among game odds

- All Result modal

- Exposure Component



----------------

- socket data for tennisha nd football
- initial socket data
- marketname ?? market_name
- function CricketMarkets
- score card in scricket


1. Structural & Logic Refactoring
Data Processing Helpers: Implement processMainMarketData and processOtherMarketData functions to clean up the useEffect logic for socket data.
Exposure Logic: Use the updated getExposureByMarketId and the new getExposureCss helper for consistent color styling of exposure values.
Suspension Handling: Adopt more robust suspended status checks (getSuspendedStatus and getSuspendedStatusForBm1).

2. New Features & State
Live Score Integration: Add state and useEffect listener for liveScore via socket to display LiveScoreCard.
TV & Scorecard Toggle: Add state (isTvOn, scoreCardOrTv) and UI icons to switch between TV stream and Scorecard.
Run Amount Logic: Add getRunAmountApi function and a runAmountModal state to show detailed run-wise exposure for fancy markets.
League Support: Add logic to detect leagues (isLeague) and display shorter league names (leagueName) in headers.

3. Component Enhancements
Double_Column_Section:
Add isRunAmountEnable to allow clicking on runners to see run amounts.
Add Remark display below each runner row.
Improve "Suspended" overlay logic.
Bookmaker & Single_Column_Section:
Add isCashout prop support.
Implement isWholeSuspended check to dim the entire market if all runners are suspended.
Blinking Animations: Update Boxes_2 and Boxes_6 logic to correctly track previous price values and apply green/red blink classes.

4. UI & Layout Updates
Responsive Header: Update the top header to include the sport-specific background color and the TV/Scorecard toggle icons for mobile.
Banner Section: Implement conditional rendering for LiveScoreCard, SafeIframe (Scorecard), or TV stream based on match state.
Run Amount Table: Add the Modal_wrapper and RunAmountTable at the bottom of the component.