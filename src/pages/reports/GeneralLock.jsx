import React, { useState, useEffect } from "react";
import Select from "react-select";
import { io } from "socket.io-client";
import { getClients, checkUserLockPwd, updateUserLockStatus } from "../../api/API";
import { casino_list } from "../../utilies/casino_list";

// Event tree node component
const EventTreeNode = ({ node, onChange }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <li className={`nav-item dropdown ${isOpen ? "show" : ""}`}>
      <div className="d-flex align-items-center">
        {(node.children || node.markets) && (
          <a
            title="click here to expand"
            className={`arrow-icon ${!isOpen ? "collapsed" : ""}`}
            onClick={toggleOpen}
          >
            <i className="fas fa-angle-down"></i>
          </a>
        )}
        <span className="custom-control custom-checkbox">
          <input
            type="checkbox"
            id={node.id}
            className="custom-control-input"
            checked={node.checked || false}
            onChange={(e) => onChange(node, e.target.checked)}
          />
          <label htmlFor={node.id} className="custom-control-label">
            {node.name}
          </label>
        </span>
      </div>

      <ul
        className={`sub-menu collapse ${isOpen ? "show" : ""}`}
        style={{ display: isOpen ? "block" : "none" }}
      >
        {node.children &&
          node.children.map((child) => (
            <EventTreeNode key={child.id} node={child} onChange={onChange} />
          ))}

        {node.markets &&
          node.markets.map((marketGroup, idx) => (
            <React.Fragment key={idx}>
              <h5 className="mb-0 font-size-16 mt-2">{marketGroup.type}</h5>
              {marketGroup.items.map((item) => (
                <li key={item.id}>
                  <span className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="custom-control-input"
                      checked={item.checked || false}
                      disabled={item.disabled}
                      onChange={(e) =>
                        onChange(item, e.target.checked, marketGroup)
                      }
                    />
                    <label htmlFor={item.id} className="custom-control-label">
                      {item.name}
                    </label>
                  </span>
                </li>
              ))}
            </React.Fragment>
          ))}
      </ul>
    </li>
  );
};

// Main component
const GeneralLock = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [tpassword, setTpassword] = useState("");

  const [eventData, setEventData] = useState([]);
  const [casinoData, setCasinoData] = useState([]);

  const [matchesBySport, setMatchesBySport] = useState({});

  const [clientOptions, setClientOptions] = useState([]);
  const [clientSearch, setClientSearch] = useState("");

  // SOCKET: fetch matches dynamically
  useEffect(() => {
    const socket = io("https://trubet9.bet:2053", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit("getMatchesOnlyOnce", { eventType: 4 });
    });

    socket.on("eventGetMatchesOnlyOnce", (data) => {
      const updated = {};

      Object.values(data || {}).forEach((sport) => {
        if (!sport?.body) return;

        Object.values(sport.body).forEach((match) => {
          if (!updated[match.SportId]) updated[match.SportId] = [];
          updated[match.SportId].push({
            matchName: match.matchName,
            marketId: match.marketid,
          });
        });
      });

      setMatchesBySport(updated);
    });

    return () => socket.disconnect();
  }, []);

  // CLIENT SEARCH
  const fetchClients = async (inputValue) => {
    try {
      const res = await getClients(inputValue);

      const formatted =
        (res?.results || []).map((c) => ({
          value: c.id,
          label: c.text,
        })) || [];

      setClientOptions(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  // LOAD USER LOCK DATA
  const handleLoad = async (e) => {
    e.preventDefault();
    /* if (!selectedClient || !tpassword) return; */
    if (!tpassword) {
      alert("Transaction Code is required");
      return;
    }

    try {
      const res = await checkUserLockPwd({
        client_name: selectedClient.value,
        tpassword,
      });

      if (res.status !== "ok") {
        alert(res.message);
        return;
      }

      buildTree(res);
    } catch (err) {
      console.log(err);
    }
  };

  // BUILD TREE FOR EVENTS AND CASINOS
  const buildTree = (data) => {
    const { casino_names = [], sport_type = [] } = data;

    const casinoTypes = [
        { value: "", label: "Select Type" },   // ✅ static first option
        ...(casino_list?.map(val => ({
            value: val.game_socket,
            label: val.game_name,
        })) || [])
    ];

    const sportsMap = { "4": "Cricket", "1": "Soccer", "2": "Tennis" };

    const events = Object.keys(matchesBySport).map((sportId) => ({
      id: sportId,
      name: sportsMap[sportId] || "Unknown",
      checked: sport_type.includes(sportId),
      children: matchesBySport[sportId]?.map((match) => ({
        id: match.marketId,
        name: match.matchName,
        markets: [
          {
            type: "Match",
            items: [
              {
                id: match.marketId,
                name: match.matchName,
                checked: casino_names.includes(match.marketId.toString()),
                disabled: sport_type.includes(sportId),
              },
            ],
          },
        ],
      })),
    }));

    setEventData(events);

    setCasinoData(
      casino_names.map((id) => ({
        id,
        name: id,
        checked: true,
      }))
    );
  };

  // CHECKBOX TOGGLE HANDLER (Events + Casino)
  const handleCheckbox = async (item, checked, parent = null) => {
    if (!selectedClient) return;

    try {
      await updateUserLockStatus({
        child_id: item.id || "all",
        sport_type: parent?.type || "Match",
        status: checked ? 1 : 0,
        username: selectedClient.value,
      });

      // Update UI locally
      if (parent) {
        setEventData((prev) =>
          prev.map((ev) => ({
            ...ev,
            children: ev.children?.map((child) => {
              if (child.id === item.id) {
                child.markets = child.markets.map((m) => {
                  if (m.type === parent.type) {
                    m.items = m.items.map((it) =>
                      it.id === item.id ? { ...it, checked } : it
                    );
                  }
                  return m;
                });
              }
              return child;
            }),
          }))
        );
      } else {
        setCasinoData((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, checked } : c))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* PAGE TITLE */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">General Lock</h4>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="user-lock-container">
            {/* FORM */}
            <div className="m-t-20">
              <form onSubmit={handleLoad}>
                <div className="row row5 align-items-center">
                  <div className="col-md-3">
                    <Select
                      options={clientOptions}
                      placeholder="Search By Client Name"
                      classNamePrefix="react-select"
                      isClearable
                      value={selectedClient}
                      onChange={(selected) => setSelectedClient(selected)}
                      onInputChange={(inputValue) => {
                        setClientSearch(inputValue);
                        fetchClients(inputValue);
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Transaction Code"
                      value={tpassword}
                      onChange={(e) => setTpassword(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-primary me-1">
                      Load
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        setSelectedClient(null);
                        setEventData([]);
                        setCasinoData([]);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* DATA DISPLAY */}
            {eventData.length > 0 && (
              <div className="row mt-4">
                {/* EVENTS */}
                <div className="col-lg-6 col-md-6 col-12">
                  <h4 className="ptitle">Events</h4>
                  <ul
                    id="accordian1"
                    className="navbar-nav user-lock-nav list-unstyled"
                  >
                    {eventData.map((node) => (
                      <EventTreeNode
                        key={node.id}
                        node={node}
                        onChange={handleCheckbox}
                      />
                    ))}
                  </ul>
                </div>

                {/* CASINO */}
                <div className="col-lg-6 col-md-6 col-12">
                  <h4 className="ptitle">Casino List</h4>
                  <ul className="user-lock-nav list-unstyled mt-2">
                    {casinoData.map((item) => (
                      <li key={item.id}>
                        <span className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            id={item.id}
                            className="custom-control-input"
                            checked={item.checked || false}
                            onChange={(e) =>
                              handleCheckbox(item, e.target.checked)
                            }
                          />
                          <label
                            htmlFor={item.id}
                            className="custom-control-label"
                          >
                            {item.name}
                          </label>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralLock;