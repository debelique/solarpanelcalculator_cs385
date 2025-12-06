import React, { useEffect, useState } from "react";
// global variables
const URL = "https://raw.githubusercontent.com/debelique/solarpanelcalculator_cs385/refs/heads/main/";

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
        <SolarFormComponent APIData={data}/>
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
    
    function changekWh(e)
    {
        setkWhMonth(e.target.value);
    }
    
    function changeSeason(e)
    {
        setSeason(e.target.value);
        loadSunData(e.target.value);
    }

    function calculateUsage(e)
    {
        let selectedPanelDropDown = document.getElementById('panel');
        let selectedPanelId = selectedPanelDropDown.value;
        let selectedPanel_var = props.APIData.find((element) => element.Id == selectedPanelId);
        
        console.log("DATA:*************");
        console.log(kWhMonth);
        //Solar raduation
        console.log(sunData.list[0].radiation.ghi);

        // Assuming season is 3 months
        // Assume effective sunlight summer 18h winter 8h. No clouds
        let totalkWhWeNeedToProduce = 3 * kWhMonth;
        let totalHoursProducingPower = 3 * 30 * (season == "summer") ? 18 :  8;
        let kWhWeNeedToProducePerHour =  totalkWhWeNeedToProduce / totalHoursProducingPower;
        let onePanelProducesWPerHour = selectedPanel_var.NameplatePmax;
        let onePanelProduceskWPerHour = onePanelProducesWPerHour / 1000;
        let panelsNeeded = Math.ceil(kWhWeNeedToProducePerHour / onePanelProduceskWPerHour);
        
        console.log(panelsNeeded);
        setPanelsNeeded(panelsNeeded);
        // TODO: Assume inverter efficiency of 85%
        
    }
    
    return (
        <>
            <h1>Solar Net Zero Calculator</h1>
            <p>How much panels do you need to disconnec from the grid</p>
            <p>
                <label>How much kW/h do you use per month:</label>
                <input id="kWhMonth" type="text" value={kWhMonth} onChange={changekWh}/>
            </p>
            <PanelDropDownComponent APIData={props.APIData} />
            <p>
                <label> Enter season: </label>
                <select id="Season" onChange={changeSeason}>
                    <option value="summer">Summer</option>
                    <option value="winter">Winter</option> 
                </select>
            </p>
            <p><button onClick={calculateUsage}>Calculate</button></p>
            <p>You will need: <label id="panelsNeeded">{panelsNeeded}</label> panels to disconnect from the grid.</p>
        </>
      );
}

function PanelDropDownComponent(props) {
    const [selectedPanel, setSelectedPanel] = useState("");   
    const handleChange = (event) => {
        setSelectedPanel(event.target.value);
    };

    const selectedPanel_var = props.APIData.find((element) => element.Id == selectedPanel);
   
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
            <PanelDetailsComponent data={selectedPanel_var}/>
         </>
    );
}

function PanelDetailsComponent(props) {
    if (props.data)
    {
        return (
            <>
            <p><label>Manufacturer:</label> <span>{props.data.Manufacturer}</span></p>
            <p><label>Description:</label> <span>{props.data.Description}</span></p>
            <p><label>Power:</label> <span>{props.data.NameplatePmax}</span></p>
            <p><label>Voltage:</label> <span>{props.data.NameplateVpmax}</span></p>               
            </> 
        );
    }
}

export default App;
