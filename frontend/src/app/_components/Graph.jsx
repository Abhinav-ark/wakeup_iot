import React from "react";
import { BarChart } from "@mui/x-charts";
import { MenuItem, FormControl, Select } from "@mui/material";

const Graph = ({
  title,
  dayData,
  dayLabels,
  weekData,
  weekLabels,
  unit,
  gap,
  options,
  defaultOption,
  additionalInfo,
}) => {
  const [selectedOption, setSelectedOption] = React.useState(defaultOption);

  const handlePeriodChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const data = selectedOption === "Day" ? dayData : weekData;
  const labels = selectedOption === "Day" ? dayLabels : weekLabels;

  return (
    <div className="bg-white shadow-md border-[0.5px] border-gray rounded-3xl p-4 flex flex-col space-y-4 mb-20">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-xl font-semibold">{title}</h3>
        <FormControl variant="outlined" size="small">
          <Select
            value={selectedOption}
            onChange={handlePeriodChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            sx={{
              borderRadius: "12px",
              border: "0.1px gray",
              backgroundColor: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "10px",
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {additionalInfo && (
        <div className="flex items-center space-x-6">
          <p className="text-lg font-semibold">{additionalInfo.text}</p>
          <span className="bg-black text-white px-3 py-1 rounded-lg text-sm">
            {additionalInfo.badge}
          </span>
        </div>
      )}
      <div className="md:h-[250px] md:w-[600px] h-96 w-96 items-center justify-center">
        <BarChart
          yAxis={[{ label: unit }]}
          xAxis={[
            {
              scaleType: "band",
              data: labels,
              categoryGapRatio: gap,
              tickPlacement: "middle",
            },
          ]}
          series={[{ data: data, color: "#22abe6" }]}
          grid={{ horizontal: true }}
          borderRadius={20}
        />
      </div>
    </div>
  );
};

export default Graph;
