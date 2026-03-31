import React, { useState } from 'react';
import Select from 'react-select';

const initialEventData = [
  {
    id: "40",
    name: "Politics",
    children: [
      {
        id: "409042632",
        name: "Assembly Election 2026",
        children: [
          {
            id: "409042632891072363",
            name: "Assembly Election 2026",
            markets: [
              { type: "Match", items: [{ id: "7607128874819", name: "OVER" }] },
              { type: "Fancy", items: [{ id: "991684260649", name: "Normal" }] },
              { type: "oddeven", items: [{ id: "883865686070", name: "oddeven" }] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Cricket",
    isOpen: true,
    children: [
      {
        id: "46644281",
        name: "Indian Premier League",
        isOpen: true,
        children: [
          {
            id: "46644281661707314",
            name: "Indian Premier League",
            markets: [
              { type: "Match", items: [{ id: "7799864225554", name: "TOURNAMENT_WINNER", checked: true, disabled: true }] },
              { type: "Match1", items: [{ id: "7973036859598", name: "IPL Cup Winner Bookmaker", checked: true, disabled: true }] },
              { type: "Fancy", items: [{ id: "484450914872", name: "Normal", checked: true, disabled: true }] }
            ]
          },
          {
            id: "46644281821091903",
            name: "Kolkata Knight Riders v Sunrisers Hyderabad",
            isOpen: true,
            markets: [
              { type: "Match", items: [{ id: "5944866068922", name: "TIED_MATCH" }, { id: "8843931606028", name: "MATCH_ODDS" }] },
              { type: "oddeven", items: [{ id: "653891793285", name: "oddeven" }] },
              { type: "khado", items: [{ id: "737734743110", name: "khado" }] },
              { type: "fancy1", items: [{ id: "752882102170", name: "fancy1" }] }
            ]
          },
          {
            id: "46644281911628266",
            name: "Lucknow Super Giants v Delhi Capitals",
            markets: [
              { type: "Match", items: [{ id: "5029714329694", name: "MATCH_ODDS" }, { id: "5120082775429", name: "TIED_MATCH" }] },
              { type: "fancy1", items: [{ id: "486303398914", name: "fancy1" }] },
              { type: "oddeven", items: [{ id: "547907845382", name: "oddeven" }] },
              { type: "khado", items: [{ id: "803590777611", name: "khado" }] }
            ]
          }
        ]
      },
      {
        id: "47143635",
        name: "Pakistan Super League",
        children: [
          {
            id: "47143635582566837",
            name: "Pakistan Super League",
            markets: [
              { type: "Match", items: [{ id: "7446016827872", name: "TOURNAMENT_WINNER" }] },
              { type: "Match1", items: [{ id: "5541429157876", name: "PSL Cup Winner Bookmaker" }] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "1",
    name: "Football",
    children: [
      {
        id: "15954905",
        name: "ENGLAND National League South",
        children: [
          {
            id: "15954905542582796",
            name: "Chelmsford v AFC Totton",
            markets: [
              { type: "Match", items: [{ id: "6635109558942", name: "MATCH_ODDS" }, { id: "5385867459905", name: "Both Teams To Score" }] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "8590658",
    name: "Virtual Cricket League",
    children: [
      {
        id: "665865915",
        name: "Guyana Amazon Warriors T10 v Trinbago Riders T10",
        markets: [
          { type: "Match", items: [{ id: "5350154745160", name: "OVER" }] },
          { type: "Fancy", items: [{ id: "143861987832", name: "Normal" }] }
        ]
      }
    ]
  },
  {
    id: "56100513",
    name: "T10 XI",
    children: [
      {
        id: "82997530",
        name: "Hobart Hurricanes XI v Adelaide Strikers XI",
        markets: [
          { type: "Match", items: [{ id: "6118454743718", name: "MATCH_ODDS" }] },
          { type: "Match1", items: [{ id: "6902235204492", name: "Bookmaker" }] },
          { type: "Fancy", items: [{ id: "968243523186", name: "Normal" }] }
        ]
      }
    ]
  },
  {
    id: "46201121",
    name: "T5 XI",
    children: [
      {
        id: "46680358",
        name: "SLZ XI v SNP XI",
        markets: [
          { type: "Match", items: [{ id: "6763295871041", name: "MATCH_ODDS" }] },
          { type: "Match1", items: [{ id: "9079192169148", name: "Bookmaker" }] }
        ]
      }
    ]
  },
  {
    id: "9212252",
    name: "Womens One Day Internationals",
    children: [
      {
        id: "765984993",
        name: "New Zealand W v South Africa W",
        markets: [
          { type: "Match", items: [{ id: "5600874138701", name: "TIED_MATCH" }, { id: "5998589718511", name: "MATCH_ODDS" }] },
          { type: "fancy1", items: [{ id: "520967524739", name: "fancy1" }] },
          { type: "oddeven", items: [{ id: "528441234606", name: "oddeven" }] },
          { type: "khado", items: [{ id: "728477214987", name: "khado" }] }
        ]
      }
    ]
  },
  {
    id: "6066324",
    name: "EUROPE Euro U21 - Qualification",
    children: [
      {
        id: "554652163",
        name: "Armenia U21 v North Macedonia U21",
        markets: [
          { type: "Match", items: [{ id: "9072679367692", name: "MATCH_ODDS" }] }
        ]
      }
    ]
  }
];

const initialCasinoData = [
  { id: "Teen", name: "Teenpatti 1-day" },
  { id: "poker", name: "Poker 1-Day" },
  { id: "3cardj", name: "3 Cards Judgement" },
  { id: "aaa", name: "Amar Akbar Anthony" },
  { id: "ab20", name: "Andar Bahar" },
  { id: "abj", name: "Andar Bahar 2" },
  { id: "baccarat", name: "Baccarat" },
  { id: "baccarat2", name: "Baccarat 2" },
  { id: "btable", name: "Bollywood Casino" },
  { id: "card32", name: "32 Cards A" },
  { id: "card32eu", name: "32 Cards B" },
  { id: "cmatch20", name: "Cricket Match 20-20" },
  { id: "cmeter", name: "Casino Meter" },
  { id: "CricketV", name: "Cricket V" },
  { id: "CricketV2", name: "Cricket V2" },
  { id: "cricketv3", name: "5Five Cricket" },
  { id: "dt20", name: "20-20 Dragon Tiger" },
  { id: "dt202", name: "20-20 Dragon Tiger 2" },
  { id: "dt6", name: "1 Day Dragon Tiger" },
  { id: "dtl20", name: "20-20 D T L" },
  { id: "lottcard", name: "lottcard" },
  { id: "lucky7", name: "Lucky 7 - A" },
  { id: "lucky7eu", name: "Lucky 7 - B" },
  { id: "poker20", name: "20-20 Poker" },
  { id: "poker6", name: "Poker 6 Players" },
  { id: "teen20", name: "20-20 Teenpatti" },
  { id: "teen8", name: "Teenpatti Open" },
  { id: "teen9", name: "Teenpatti Test" },
  { id: "war", name: "Casino War" },
  { id: "worli", name: "Worli Matka" },
  { id: "worli2", name: "Instant Worli" },
  { id: "dream", name: "Diam11" },
  { id: "daba", name: "Player Battle" },
  { id: "runner", name: "Runner" },
  { id: "cockfight", name: "Cockfight" },
  { id: "ezugi", name: "Ezugi" },
  { id: "ss", name: "Super Spade" },
  { id: "qt", name: "QTech" },
  { id: "evo", name: "Evolution" },
  { id: "teen6", name: "Teenpatti - 2.0" },
  { id: "queen", name: "Queen" },
  { id: "race20", name: "Race20" },
  { id: "pop-the-ball", name: "Pop The Ball" },
  { id: "lucky7eu2", name: "Lucky 7 - C" },
  { id: "superover", name: "Super Over" },
  { id: "trap", name: "The Trap" },
  { id: "binary", name: "Binary" },
  { id: "ludo-club", name: "Ludo Club" },
  { id: "patti2", name: "2 Cards Teenpatti" },
  { id: "teensin", name: "29Card Baccarat" },
  { id: "teenmuf", name: "Muflis Teenpatti" },
  { id: "rummy", name: "Rummy" },
  { id: "slot", name: "Slot" },
  { id: "tgs", name: "Slot 2" },
  { id: "race17", name: "Race to 17" },
  { id: "teen20b", name: "20-20 Teenpatti B" },
  { id: "TGSLive", name: "VivoGames-LuckyStreak" },
  { id: "trio", name: "Trio" },
  { id: "notenum", name: "Note Number" },
  { id: "teen2024", name: "Teen 20 24" },
  { id: "kbc", name: "K.B.C" },
  { id: "ludo-lands", name: "Ludo Lands" },
  { id: "teen120", name: "1 CARD 20-20" },
  { id: "teen1", name: "1 CARD ONE-DAY" },
  { id: "vteen20", name: "V-20-20 Teenpatti" },
  { id: "vteen", name: "V-Teenpatti 1-day" },
  { id: "vdt6", name: "V-1 Day Dragon Tiger" },
  { id: "vdt20", name: "V-20-20 Dragon Tiger" },
  { id: "vlucky7", name: "V-Lucky 7 - A" },
  { id: "vrace17", name: "V-Race to 17" },
  { id: "vteenmuf", name: "V-Muflis Teenpatti" },
  { id: "vaaa", name: "V-Amar Akbar Anthony" },
  { id: "vbtable", name: "V-Bollywood Casino" },
  { id: "vbaccarat", name: "V-Baccarat" },
  { id: "vtrio", name: "V-Trio" },
  { id: "vtrap", name: "V-The Trap" },
  { id: "ab3", name: "ANDAR BAHAR 50 CARDS" },
  { id: "vdtl20", name: "V-20-20 D T L" },
  { id: "aaa2", name: "Amar Akbar Anthony 2" },
  { id: "vivo", name: "Vivo Gaming" },
  { id: "snakes-and-ladders", name: "snakes and ladders" },
  { id: "roulette", name: "roulette" },
  { id: "race2", name: "Race to 2nd" },
  { id: "Astar", name: "Astar Game" },
  { id: "smart", name: "Smart Soft" },
  { id: "teen3", name: "Instant Teenpatti" },
  { id: "bc", name: "Creedroomz" },
  { id: "dum10", name: "Dus ka Dum" },
  { id: "cmeter1", name: "1 Card Meter" },
  { id: "bota", name: "Bota" },
  { id: "tembo", name: "Tembo" },
  { id: "ds", name: "Dragoon Soft" },
  { id: "av", name: "Aviator" },
  { id: "bcslot", name: "Pascal Game" },
  { id: "lottery", name: "Lottery" },
  { id: "radar", name: "sportbook" },
  { id: "bti", name: "sportbook 1" },
  { id: "teen32", name: "Instant Teenpatti 2.0" },
  { id: "prgslot", name: "Pragamatic slot" },
  { id: "prglive", name: "Pragamatic live" },
  { id: "SicBo", name: "Sic Bo" },
  { id: "ballbyball", name: "Ball by ball" },
  { id: "roulette1", name: "roulette1" },
  { id: "teen33", name: "Instant Teenpatti 3.0" },
  { id: "Scratch", name: "Scratch" },
  { id: "roulette2", name: "roulette2" },
  { id: "superover2", name: "Super Over2" },
  { id: "roulette3", name: "roulette3" },
  { id: "sicbo2", name: "Sic Bo 2" },
  { id: "Darwin", name: "Darwin" },
  { id: "Teen41", name: "Queen top open teenpatti" },
  { id: "Teen42", name: "Jack top open teenpatti" },
  { id: "Lucky15", name: "Lucky 15" },
  { id: "goal", name: "Goal" },
  { id: "pg", name: "Pocket Game" },
  { id: "ab4", name: "Andar-Bahar 150 card" },
  { id: "superover3", name: "Mini SuperOver" },
  { id: "ourroullete", name: "Unique Roulette" },
  { id: "Teen20c", name: "20-20 Teenpatti C" },
  { id: "btable2", name: "Bollywood Casino 2" },
  { id: "bet", name: "betcore" },
  { id: "teenjoker", name: "Teenpatti Joker" },
  { id: "gemini1", name: "Gemini" },
  { id: "Jilli", name: "Jilli" },
  { id: "gemini2", name: "gemini live" },
  { id: "Win", name: "Win Infinity" },
  { id: "joker1", name: "Unlimited Joker One Day" },
  { id: "Joker20", name: "Teenpatti Joker 20-20" },
  { id: "Joker120", name: "Unlimited Joker 20-20" },
  { id: "poison20", name: "Teenpatti Poison 20-20" },
  { id: "Amigo", name: "Amigo" },
  { id: "teenunique", name: "Unique Teenpatti" },
  { id: "poison", name: "Teenpatti Poison One Day" },
  { id: "Roulette11", name: "Golden Roulette" },
  { id: "Roulette12", name: "Beach Roulette" },
  { id: "Roulette13", name: "Regular Roulette" },
  { id: "egt", name: "EGT" },
  { id: "pteen", name: "Premium Teenpatti 1-day" },
  { id: "pteen20", name: "Premium 20-20 Teenpatti" },
  { id: "pdt6", name: "Premium 1 Day Dragon Tiger" },
  { id: "pdt20", name: "Premium 20-20 Dragon Tiger" },
  { id: "plucky7", name: "Premium Lucky 7" },
  { id: "pcard32", name: "Premium 32 Cards" },
  { id: "pbaccarat", name: "Premium Baccarat" },
  { id: "tteen", name: "Tembo Teenpatti 1-day" },
  { id: "tteen20", name: "Tembo 20-20 Teenpatti" },
  { id: "tdt6", name: "Tembo 1 Day Dragon Tiger" },
  { id: "tdt20", name: "Tembo 20-20 Dragon Tiger" },
  { id: "tlucky7", name: "Tembo Lucky 7" },
  { id: "tcard32", name: "Tembo 32 Cards" },
  { id: "tbaccarat", name: "Tembo Baccarat" },
  { id: "Lucky5", name: "Lucky 6" },
  { id: "Mogambo", name: "Mogambo" },
  { id: "dolidana", name: "Dolidana" },
  { id: "exa", name: "EXA" },
  { id: "studio21", name: "Studio21" },
  { id: "teen20v", name: "20-20 Teenpatti VIP" },
  { id: "Worli3", name: "Matka" },
  { id: "GVI", name: "GVI" },
  { id: "teen62", name: "V VIP Teenpatti 1-day" },
  { id: "beon", name: "Beon Gaming" },
  { id: "Playtech", name: "Play Tech" },
  { id: "King", name: "king" }
];

const EventTreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <li className={`nav-item dropdown ${isOpen ? 'show' : ''}`}>
      <div className="d-flex align-items-center">
        {(node.children || node.markets) && (
          <a title="click here to expand" className={`arrow-icon ${!isOpen ? 'collapsed' : ''}`} onClick={toggleOpen}>
            <i className="fas fa-angle-down"></i>
          </a>
        )}
        <span className="custom-control custom-checkbox">
          <input type="checkbox" id={node.id} className="custom-control-input" value={node.id} />
          <label htmlFor={node.id} className="custom-control-label">{node.name}</label>
        </span>
      </div>

      <ul className={`sub-menu collapse ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
        {node.children && node.children.map(child => (
          <EventTreeNode key={child.id} node={child} />
        ))}
        {node.markets && node.markets.map((marketGroup, idx) => (
          <React.Fragment key={idx}>
            <h5 className="mb-0 font-size-16 mt-2">{marketGroup.type}</h5>
            {marketGroup.items.map(item => (
              <li key={item.id}>
                <span className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    id={item.id}
                    className="custom-control-input"
                    value={item.id}
                    defaultChecked={item.checked}
                    disabled={item.disabled}
                  />
                  <label htmlFor={item.id} className="custom-control-label">{item.name}</label>
                </span>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
    </li>
  );
};

const GeneralLock = () => {
  const [selectedClient, setSelectedClient] = useState(null);

  const clientOptions = [
    { value: 'ras46', label: 'Ras46' },
  ];

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">General Lock</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><a href="/admin/home">Home</a></li>
                <li className="breadcrumb-item active">General Lock</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="user-lock-container">
                <div className="m-t-20">
                  <form className="ajaxFormSubmit">
                    <div className="row row5 align-items-center">
                      <div className="col-md-3">
                        <div className="form-group user-lock-search mb-0">
                          <Select
                            options={clientOptions}
                            placeholder="Search By Client Name"
                            classNamePrefix="react-select"
                            isClearable
                            value={selectedClient}
                            onChange={setSelectedClient}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <input type="password" placeholder="Transaction Code" className="form-control" />
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn btn-primary me-1">Load</button>
                        <button type="button" className="btn btn-light" onClick={() => setSelectedClient(null)}>Reset</button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-6 col-md-6 col-12">
                    <h4 className="ptitle">Events</h4>
                    <ul id="accordian1" className="navbar-nav user-lock-nav list-unstyled">
                      {initialEventData.map(node => (
                        <EventTreeNode key={node.id} node={node} />
                      ))}
                    </ul>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <h4 className="ptitle">Casino List</h4>
                    <ul className="user-lock-nav list-unstyled mt-2">
                      {initialCasinoData.map(item => (
                        <li key={item.id} className="mb-1">
                          <span className="custom-control custom-checkbox">
                            <input type="checkbox" id={item.id} className="custom-control-input" value={item.id} />
                            <label htmlFor={item.id} className="custom-control-label">{item.name}</label>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralLock;
