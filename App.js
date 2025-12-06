import React, { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client'

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const URL = "https://raw.githubusercontent.com/debelique/solarpanelcalculator_cs385/refs/heads/main/PV_Module_List_Full_Data_ADAmicro.json";

    async function fetchData() {
      try {
        const response = await fetch(URL);
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
        <SolarFormComponent data={data} />
      </>
    );
  }
} // end App() function or component

function SolarFormComponent(props) {
    const [kWhMonth, setkWhMonth] = useState(375);
    
    return (
        <>
            <h1>Solar Net Zero Calculator</h1>
            <p>How much panels do you need to disconnect from the grid</p>
            <p>
                <label>How much kW/h do you use per month:</label>
                <input id="kWhMonth" type="text" value={kWhMonth}  onChange={(e) => setkWhMonth(e.target.value)} />
            </p>
            <PanelDropDownComponent APIData={props.data} />
            <p>
                <label> Enter season: </label>
                <select id="Season">
                    <option value="Summer"> Summer </option>
                    <option value="Winter"> Winter </option> 
                </select>
            </p>
            <p><button>Calculate</button></p>
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
    //console.log("value >>", props);
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

