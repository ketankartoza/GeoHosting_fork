import React from 'react';
import { Box, Flex } from "@chakra-ui/react";
import SearchBar from "../../components/SearchBar/SearchBar";

interface Props {
  onSearch?: (term: string) => void;
  placeholder?: string;
  leftElement?: React.ReactElement,
  rightElement?: React.ReactElement,
}

const TopNavigation: React.FC<Props> = (
  {
    onSearch,
    placeholder = 'Search Items',
    leftElement,
    rightElement
  }) => {
  return (
    <Flex mb={6} alignItems="center" width={'100%'}>
      <SearchBar
        onSearch={onSearch}
        showDateFields={false}
        showClearButton={false}
        placeholder={placeholder}
      />
      {leftElement}
      <Box flexGrow={1}/>
      {rightElement}
    </Flex>
  )
};

export default TopNavigation;
