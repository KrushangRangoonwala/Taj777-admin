import React, { useEffect, useState } from 'react';
import { getBetDetails } from '../api/API';

const BetStatementModal = ({
  show,
  onClose,
  rowData
}) => {

  const [loading, setLoading] = useState(false);
  const [betDetails, setBetDetails] = useState([]);
  const [summary, setSummary] = useState({});

  const [filterType, setFilterType] = useState("all");

  console.log("Row Data:", rowData);

  useEffect(() => {

    if (show && rowData) {
      fetchBetDetails();
    }

  }, [show, rowData]);

  const getUserName = (fromTo) => {

    console.log("fromTo value:", fromTo);

    if (!fromTo || typeof fromTo !== "string") {
        return "-";
    }

    const parts = fromTo
        .split("/")
        .map(item => item.trim())
        .filter(item => item !== "");

    if (parts.length === 0) {
        return "-";
    }

    // Prefer second username if exists
    return parts[1] || parts[0] || "-";
};

  const getBetType = (value) => String(value ?? "").trim().toLowerCase();

  const normalizeBetType = (value) => {
    const betType = getBetType(value);

    if (betType === "yes") return "back";
    if (betType === "no") return "lay";

    return betType;
  };

  const isBackType = (item) => normalizeBetType(item?.bet_type) === "back";
  const isLayType = (item) => normalizeBetType(item?.bet_type) === "lay";

  const fetchBetDetails = async () => {

    try {

      setLoading(true);

      const payload = {
        bet_time: rowData?.bet_time || rowData?.created_at,
        event_id: rowData?.event_id,
        game_type: rowData?.game_type,
        event_type: rowData?.event_type,
        market_id: rowData?.market_id,
        market_type: rowData?.market_type,
        userid: rowData?.userid,
      };

      const response = await getBetDetails(payload);

      /* const response = res?.data; */

      if (response?.status === "success") {

        setBetDetails(response?.data || []);

        const totalWin = (response?.data || []).reduce(
          (sum, item) => sum + Number(item.win || 0),
          0
        );

        setSummary({
          total_bets: response?.total_bets || 0,
          total_win: totalWin
        });

      } else {

        setBetDetails([]);
      }

    } catch (err) {

      console.log(err);
      setBetDetails([]);

    } finally {

      setLoading(false);
    }
  };

  // FILTER DATA
  const filteredData = betDetails.filter((item) => {

    if (filterType === "all") return true;

    if (filterType === "back") {
      return isBackType(item);
    }

    if (filterType === "lay") {
      return isLayType(item);
    }

    if (filterType === "deleted") {
      return item.is_deleted === true;
    }

    return true;
  });

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        overflowY: 'auto'
      }}
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
    >

      <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>

        <div className="modal-content">

          {/* HEADER */}
          <header className="modal-header">

            <h5 className="modal-title">
              Details
            </h5>

            <button
              type="button"
              className="close"
              onClick={onClose}
            >
              ×
            </button>

          </header>

          {/* BODY */}
          <div className="modal-body">

            {/* TOP INFO */}
            <div className="mt-1">
              {rowData?.remark || "-"}
            </div>

            <div className="mt-1">

              <div className="row">

                <div className="col-6">
                  Winner: {rowData?.winner || "-"}
                </div>

                <div className="col-6 text-right">

                  Game Time:

                  <div className="text-right">

                    {rowData?.created_at
                      ? new Date(rowData.created_at * 1000).toLocaleString("en-GB")
                      : "-"}

                  </div>

                </div>

              </div>

            </div>

            {/* FILTERS */}
            <div className="mt-4">

              <div className="custom-control custom-radio custom-control-inline">

                <input
                  type="radio"
                  id="soda-all"
                  value="all"
                  checked={filterType === "all"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="custom-control-input"
                />

                <label
                  htmlFor="soda-all"
                  className="custom-control-label"
                >
                  All
                </label>

              </div>

              <div className="custom-control custom-radio custom-control-inline">

                <input
                  type="radio"
                  id="soda-back"
                  value="back"
                  checked={filterType === "back"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="custom-control-input"
                />

                <label
                  htmlFor="soda-back"
                  className="custom-control-label"
                >
                  Back
                </label>

              </div>

              <div className="custom-control custom-radio custom-control-inline">

                <input
                  type="radio"
                  id="soda-lay"
                  value="lay"
                  checked={filterType === "lay"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="custom-control-input"
                />

                <label
                  htmlFor="soda-lay"
                  className="custom-control-label"
                >
                  Lay
                </label>

              </div>
              
              <div className="custom-control custom-radio custom-control-inline">

                <input
                  type="radio"
                  id="soda-deleted"
                  value="deleted"
                  checked={filterType === "deleted"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="custom-control-input"
                />

                <label
                  htmlFor="soda-deleted"
                  className="custom-control-label"
                >
                  Deleted
                </label>

              </div>

              <div className="custom-control-inline float-right">

                <h5>

                  Total Bets:
                  <span className="text-success ml-2 mr-3">
                    {summary?.total_bets || 0}
                  </span>

                  Total Win:
                  <span
                    className={
                      Number(summary?.total_win) >= 0
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {summary?.total_win || 0}
                  </span>

                </h5>

              </div>

            </div>

            {/* TABLE */}
            <div className="table-responsive report-table mt-3">

              <table className="table table-bordered">

                <thead>

                  <tr>

                    <th>username</th>

                    <th>Nation</th>

                    <th className="text-right">
                      Rate
                    </th>

                    <th className="text-right">
                      Bhav
                    </th>

                    <th className="text-right">
                      Amount
                    </th>

                    <th className="text-right">
                      Win
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      IP
                    </th>

                    <th>
                      B Details
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td colSpan="8" className="text-center">
                        Loading...
                      </td>
                    </tr>

                  ) : filteredData.length > 0 ? (

                    filteredData.map((item, index) => {
                      const betType = normalizeBetType(item?.bet_type);
                      const rowClassName = betType === "back"
                        ? "back-border"
                        : betType === "lay"
                          ? "lay-border"
                          : "";

                      const winClassName =
                           Number(item.win) >= 0
                            ? "text-success"
                            : "text-danger";

                      return (
                        <tr
                          key={index}
                          className={rowClassName}
                        >

                        <td>
                            {getUserName(rowData?.from_to)}
                        </td>
                        
                        <td>
                          {item.nation}
                        </td>

                        <td className="text-right">
                          {item.rate}
                        </td>

                        <td className="text-right">
                          {item.bhav}
                        </td>

                        <td className="text-right">
                          {item.amount}
                        </td>

                        <td
                          className={`text-right ${winClassName}`}
                        >
                          {item.win}
                        </td>

                        <td>
                          {item.date}
                        </td>

                        <td>
                          <a href="javascript:void(0)">
                            {item.ip_address}
                          </a>
                        </td>

                        <td>

                          <a
                            href="javascript:void(0)"
                            title={item.browser}
                            className="text-success"
                          >
                            Detail
                          </a>

                        </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>

                      <td colSpan="8" className="text-center">
                        No Data Found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BetStatementModal;