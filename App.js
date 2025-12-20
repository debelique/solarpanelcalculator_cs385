import React, { useEffect, useState } from "react";
// global variables
const URL =
  "https://raw.githubusercontent.com/debelique/solarpanelcalculator_cs385/refs/heads/main/";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const URLPanels = `${URL}PV_Module_List_Full_Data_ADAmicro.json`;

    async function fetchData() {
      try {
        console.log(URLPanels);
        const response = await fetch(URLPanels);
        const dataJson = await response.json();
        setLoading(true);
        setData(dataJson);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    }

    fetchData();
  }, []); // end of useEffect

  if (error) {
    return <h1>Opps! An error has occurred: {error.toString()}</h1>;
  } else if (loading === false) {
    return <h1>Waiting for the data .....</h1>;
  } else {
    return (
      <>
        <SolarFormComponent APIData={data} />
      </>
    );
  }
} // end App() function or component

function SolarFormComponent(props) {
  const [kWhMonth, setkWhMonth] = useState(375);
  const [season, setSeason] = useState("summer");
  const [sunData, setSundata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelsNeeded, setPanelsNeeded] = useState(0);
  const [error, setError] = useState(null);

  async function loadSunData(seasonArg) {
    try {
      const URLsundata = `${URL}openweather.co.uk_${seasonArg}.json`;
      const response = await fetch(URLsundata);
      const dataJson = await response.json();
      setSundata(dataJson);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSunData(season);
  }, []);

  function changekWh(e) {
    setkWhMonth(e.target.value);
  }

  function changeSeason(e) {
    setSeason(e.target.value);
    loadSunData(e.target.value);
  }

  function calculateUsage(e) {
    let selectedPanelDropDown = document.getElementById("panel");
    let selectedPanelId = selectedPanelDropDown.value;
    let selectedPanel_var = props.APIData.find(
      (element) => element.Id == selectedPanelId
    );

    console.log("DATA:*************");
    console.log(kWhMonth);
    //Solar raduation
    console.log(sunData.list[0].radiation.ghi);

    // Assuming season is 3 months
    // Assume effective sunlight summer 18h winter 8h. No clouds
    let totalkWhWeNeedToProduce = 3 * kWhMonth;
    let totalHoursProducingPower = 3 * 30 * (season === "summer" ? 18 : 8);
    let kWhWeNeedToProducePerHour =
      totalkWhWeNeedToProduce / totalHoursProducingPower;
    let onePanelProducesWPerHour = selectedPanel_var.NameplatePmax;
    let onePanelProduceskWPerHour = onePanelProducesWPerHour / 1000;
    let panelsNeeded = Math.ceil(
      kWhWeNeedToProducePerHour / onePanelProduceskWPerHour
    );

    console.log(panelsNeeded);
    setPanelsNeeded(panelsNeeded);
    // TODO: Assume inverter efficiency of 85%
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Solar Net Zero Calculator</h1>
      <p>Calculate how many solar panels you need to go net zero.</p>

      <p>
        <label>Monthly energy usage (kWh):</label>
        <br />
        <input
          id="kWhMonth"
          type="number"
          value={kWhMonth}
          onChange={changekWh}
          style={{ width: "100%", padding: "6px" }}
        />
      </p>

      <PanelDropDownComponent APIData={props.APIData} />

      <p>
        <label>Season:</label>
        <br />
        <select
          id="Season"
          onChange={changeSeason}
          style={{ width: "100%", padding: "6px" }}
        >
          <option value="summer">Summer</option>
          <option value="winter">Winter</option>
        </select>
      </p>

      <button
        onClick={calculateUsage}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Calculate
      </button>

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>
        Panels needed: {panelsNeeded}
      </p>
    </div>
  );
}

function PanelDropDownComponent(props) {
  const [selectedPanel, setSelectedPanel] = useState("");
  const handleChange = (event) => {
    setSelectedPanel(event.target.value);
  };

  const selectedPanel_var = props.APIData.find(
    (element) => element.Id == selectedPanel
  );

  return (
    <>
      <p>
        <label>Type of panel:</label>
        <select onChange={handleChange} id="panel">
          {props.APIData.map((t, index) => (
            <option value={t.Id}>{t.ModelNumber}</option>
          ))}
        </select>
      </p>
      <PanelDetailsComponent data={selectedPanel_var} />
    </>
  );
}

function PanelDetailsComponent(props) {
  if (props.data) {
    return (
      <>
        <p>
          <label>Manufacturer:</label> <span>{props.data.Manufacturer}</span>
        </p>
        <p>
          <label>Description:</label> <span>{props.data.Description}</span>
        </p>
        <p>
          <label>Power:</label> <span>{props.data.NameplatePmax}</span>
        </p>
        <p>
          <label>Voltage:</label> <span>{props.data.NameplateVpmax}</span>
        </p>
      </>
    );
  }
}

export default App;

