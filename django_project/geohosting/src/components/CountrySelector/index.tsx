import React, { useEffect, useState } from 'react';
import { Input, Select } from "@chakra-ui/react";
import axios from "axios";

interface Props {
  disable: boolean;
  data: string;
  setData: (data: string) => void;
}

const CountrySelector: React.FC<Props> = (
  { disable, data, setData }
) => {
  const [list, setList] = useState<string[] | null>(null);
  const [error, setError] = useState<string[] | null>(null);

  useEffect(() => {
    axios.get('/api/countries/?page_size=1000').then((response) => {
      setList(response.data.results.map(_row => _row.name))
    }).catch(function (error) {
      setError(error)
    })
  }, []);

  if (error) {
    return <Input
      disabled={true}
      value='Loading'
      borderWidth="0px"
      borderColor="gray.400"
      bg="white"
      color='red'
      width={'100%'}
    />
  }
  if (!list) {
    return <Input
      disabled={true}
      value='Loading'
      borderWidth="0px"
      borderColor="gray.400"
      bg="white"
      width={'100%'}
    />
  }
  return <Select
    disabled={disable}
    placeholder="Select country"
    borderWidth="0px"
    borderColor="gray.400"
    bg="white"
    width={'100%'}
    value={data}
    onChange={(e) => setData(e.target.value)}
  >
    {
      list.map(name => <option key={name} value={name}>{name}</option>)
    }
  </Select>
};

export default CountrySelector;
