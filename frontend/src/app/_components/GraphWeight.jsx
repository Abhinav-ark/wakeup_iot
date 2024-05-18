import React from 'react';
import { LineChart } from '@mui/x-charts';
import { MenuItem, FormControl, Select } from '@mui/material';

const GraphWeight = ({ title, data, labels, unit, gap , options, defaultOption, badgeText, additionalInfo }) => {
  const [selectedOption, setSelectedOption] = React.useState(defaultOption);

  const handlePeriodChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="bg-white shadow-md border-[0.5px] border-gray rounded-3xl p-5 flex flex-col space-y-9 w-full">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-xl font-semibold">{title}</h3>
        <FormControl variant="outlined" size="small">
          <Select
            value={selectedOption}
            onChange={handlePeriodChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{
              borderRadius: '12px',
              border: '0.2px gray',
              backgroundColor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '12px',
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
      <div className="flex justify-start items-center w-full space-x-4">
        <div className="bg-black text-white px-4 py-1 rounded-full text-sm">{badgeText}</div>
        <div className="text-gray-500 text-sm">{additionalInfo}</div>
      </div>
      <LineChart
        yAxis={[{ label: unit }]}
        xAxis={[
            {
              scaleType: "band",
              data: labels,
              categoryGapRatio: gap,
              tickPlacement: "middle",
            },
          ]}
        series={[
          {
            data: data,
            color: '#22abe6',
          },
        ]}
        width={750}
        height={390}
        grid={{ horizontal: true }}
        borderRadius={20}
      />
    </div>
  );
};

export default GraphWeight;